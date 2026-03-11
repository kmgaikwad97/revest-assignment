'use client';

import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert, Box, Button, Card, CardActions, CardContent, Chip,
  CircularProgress, Container, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, FormHelperText, Grid, IconButton, InputLabel,
  MenuItem, Paper, Select, Snackbar, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
  useMediaQuery, useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  getOrders, getProducts, createOrder, cancelOrder,
  Order, Product,
} from '@/lib/api';

interface OrderFormValues { productId: string; quantity: number; }

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  CONFIRMED: 'success',
  PENDING:   'warning',
  CANCELLED: 'error',
};

export default function OrdersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [orders, setOrders]   = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState<Order | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>
    ({ open: false, message: '', severity: 'success' });

  const { control, register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } =
    useForm<OrderFormValues>();

  const selectedProductId = watch('productId');
  const selectedProduct = products.find(p => String(p.id) === String(selectedProductId));

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [o, p] = await Promise.all([getOrders(), getProducts()]);
      setOrders(o); setProducts(p);
    } catch {
      setError('Could not connect to services. Make sure both ports 3001 and 3002 are running.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { reset({ productId: '', quantity: 1 }); setDialogOpen(true); };

  const onSubmit = async (data: OrderFormValues) => {
    try {
      const created = await createOrder({ productId: Number(data.productId), quantity: Number(data.quantity) });
      setOrders(prev => [...prev, created]);
      setSnackbar({ open: true, message: `Order #${created.id} placed successfully!`, severity: 'success' });
      setDialogOpen(false);
      setProducts(await getProducts());
    } catch (err: unknown) {
      setSnackbar({ open: true, message: err instanceof Error ? err.message : 'Failed to place order', severity: 'error' });
    }
  };

  const handleCancel = async () => {
    if (!cancelConfirm) return;
    try {
      const updated = await cancelOrder(cancelConfirm.id);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      setSnackbar({ open: true, message: `Order #${updated.id} cancelled`, severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to cancel order', severity: 'error' });
    } finally { setCancelConfirm(null); }
  };

  const availableProducts = products.filter(p => p.stock > 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Orders</Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={fetchData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Place Order
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}
          action={<Button size="small" color="inherit" onClick={fetchData}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {loading && !error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !error && orders.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }} variant="outlined">
          <Typography color="text.secondary" gutterBottom>No orders yet</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ mt: 1 }}>
            Place your first order
          </Button>
        </Paper>
      )}

      {/* Mobile: cards */}
      {!loading && !error && orders.length > 0 && isMobile && (
        <Grid container spacing={2}>
          {orders.map(o => (
            <Grid item xs={12} key={o.id}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">{o.product.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        ₹{o.product.price.toLocaleString()} × {o.quantity}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
                        Total: ₹{o.totalPrice.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(o.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={o.status} size="small"
                      color={statusColor[o.status] ?? 'default'}
                    />
                  </Stack>
                </CardContent>
                {o.status !== 'CANCELLED' && (
                  <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                    <Button size="small" color="error" startIcon={<CancelIcon />}
                      onClick={() => setCancelConfirm(o)}>
                      Cancel Order
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Desktop: table */}
      {!loading && !error && orders.length > 0 && !isMobile && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell align="right"><strong>Unit Price</strong></TableCell>
                <TableCell align="right"><strong>Qty</strong></TableCell>
                <TableCell align="right"><strong>Total</strong></TableCell>
                <TableCell align="center"><strong>Status</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(o => (
                <TableRow key={o.id} hover>
                  <TableCell>{o.id}</TableCell>
                  <TableCell>{o.product.name}</TableCell>
                  <TableCell align="right">₹{o.product.price.toLocaleString()}</TableCell>
                  <TableCell align="right">{o.quantity}</TableCell>
                  <TableCell align="right"><strong>₹{o.totalPrice.toLocaleString()}</strong></TableCell>
                  <TableCell align="center">
                    <Chip label={o.status} size="small" color={statusColor[o.status] ?? 'default'} />
                  </TableCell>
                  <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    {o.status !== 'CANCELLED' && (
                      <Tooltip title="Cancel Order">
                        <IconButton size="small" color="error" onClick={() => setCancelConfirm(o)}>
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Place Order Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Place New Order</DialogTitle>
        <DialogContent>
          <Box component="form" id="order-form" onSubmit={handleSubmit(onSubmit)} sx={{ pt: 1 }}>
            <Stack spacing={2.5}>
              <Controller name="productId" control={control} defaultValue=""
                rules={{ required: 'Please select a product' }}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.productId}>
                    <InputLabel>Product</InputLabel>
                    <Select {...field} label="Product">
                      {availableProducts.length === 0 && (
                        <MenuItem disabled value="">No products in stock</MenuItem>
                      )}
                      {availableProducts.map(p => (
                        <MenuItem key={p.id} value={String(p.id)}>
                          {p.name} — ₹{p.price.toLocaleString()} (stock: {p.stock})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.productId && <FormHelperText>{errors.productId.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <TextField fullWidth label="Quantity" type="number" required
                error={!!errors.quantity} helperText={errors.quantity?.message}
                inputProps={{ min: 1, max: selectedProduct?.stock ?? 9999 }}
                {...register('quantity', {
                  required: 'Quantity is required',
                  min: { value: 1, message: 'Minimum 1' },
                  ...(selectedProduct ? { max: { value: selectedProduct.stock, message: `Max available: ${selectedProduct.stock}` } } : {}),
                })}
              />

              {selectedProduct && (
                <Alert severity="info">
                  <strong>{selectedProduct.name}</strong> — ₹{selectedProduct.price.toLocaleString()} per unit · {selectedProduct.stock} in stock
                </Alert>
              )}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button type="submit" form="order-form" variant="contained"
            disabled={isSubmitting || availableProducts.length === 0}>
            {isSubmitting ? <CircularProgress size={20} /> : 'Place Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel confirm */}
      <Dialog open={!!cancelConfirm} onClose={() => setCancelConfirm(null)}>
        <DialogTitle>Cancel Order?</DialogTitle>
        <DialogContent>
          <Typography>
            Cancel order <strong>#{cancelConfirm?.id}</strong> for <strong>{cancelConfirm?.product.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelConfirm(null)}>Keep Order</Button>
          <Button variant="contained" color="error" onClick={handleCancel}>Cancel Order</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

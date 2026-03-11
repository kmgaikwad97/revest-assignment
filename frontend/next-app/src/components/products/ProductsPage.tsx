'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert, Box, Button, Card, CardActions, CardContent, Chip,
  CircularProgress, Container, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, IconButton, InputAdornment, Snackbar, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Tooltip, Typography, useMediaQuery, useTheme, Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  Product, CreateProductPayload,
} from '@/lib/api';

type FormValues = CreateProductPayload;

export default function ProductsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>
    ({ open: false, message: '', severity: 'success' });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>();

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError(null);
    try { setProducts(await getProducts()); }
    catch { setError('Could not connect to product-service on port 3001. Make sure it is running.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => {
    setEditingProduct(null);
    reset({ name: '', price: 0, description: '', stock: 0 });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    reset({ name: p.name, price: p.price, description: p.description, stock: p.stock });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = { ...data, price: Number(data.price), stock: Number(data.stock) };
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        setSnackbar({ open: true, message: 'Product updated successfully', severity: 'success' });
      } else {
        const created = await createProduct(payload);
        setProducts(prev => [...prev, created]);
        setSnackbar({ open: true, message: 'Product created successfully', severity: 'success' });
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      setSnackbar({ open: true, message: err instanceof Error ? err.message : 'Something went wrong', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteProduct(deleteConfirm.id);
      setProducts(prev => prev.filter(p => p.id !== deleteConfirm.id));
      setSnackbar({ open: true, message: 'Product deleted', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete product', severity: 'error' });
    } finally { setDeleteConfirm(null); }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Products
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={fetchProducts} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add Product
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}
          action={<Button size="small" color="inherit" onClick={fetchProducts}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {loading && !error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !error && products.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }} variant="outlined">
          <Typography color="text.secondary" gutterBottom>No products found</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ mt: 1 }}>
            Add your first product
          </Button>
        </Paper>
      )}

      {/* Mobile: cards */}
      {!loading && !error && products.length > 0 && isMobile && (
        <Grid container spacing={2}>
          {products.map(p => (
            <Grid item xs={12} key={p.id}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">{p.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                        {p.description}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip label={`₹${p.price.toLocaleString()}`} size="small" color="primary" variant="outlined" />
                        <Chip
                          label={`Stock: ${p.stock}`} size="small"
                          color={p.stock === 0 ? 'error' : p.stock < 3 ? 'warning' : 'success'}
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => openEdit(p)}>Edit</Button>
                  <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteConfirm(p)}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Desktop: table */}
      {!loading && !error && products.length > 0 && !isMobile && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell align="right"><strong>Price</strong></TableCell>
                <TableCell align="right"><strong>Stock</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.description}
                  </TableCell>
                  <TableCell align="right">₹{p.price.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Chip label={p.stock} size="small"
                      color={p.stock === 0 ? 'error' : p.stock < 3 ? 'warning' : 'success'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(p)} color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => setDeleteConfirm(p)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <Box component="form" id="product-form" onSubmit={handleSubmit(onSubmit)} sx={{ pt: 1 }}>
            <Stack spacing={2.5}>
              <TextField fullWidth label="Product Name" required
                error={!!errors.name} helperText={errors.name?.message}
                {...register('name', { required: 'Name is required' })} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField fullWidth label="Price" type="number" required
                    error={!!errors.price} helperText={errors.price?.message}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                    {...register('price', { required: 'Price is required', min: { value: 0, message: 'Must be 0 or more' } })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Stock" type="number" required
                    error={!!errors.stock} helperText={errors.stock?.message}
                    {...register('stock', { required: 'Stock is required', min: { value: 0, message: 'Must be 0 or more' } })} />
                </Grid>
              </Grid>
              <TextField fullWidth label="Description" multiline rows={3} required
                error={!!errors.description} helperText={errors.description?.message}
                {...register('description', { required: 'Description is required' })} />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button type="submit" form="product-form" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={20} /> : editingProduct ? 'Save Changes' : 'Create Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Product?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
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

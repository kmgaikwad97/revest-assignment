'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert, Box, Button, Card, CardContent,
  Container, Divider, Snackbar, Stack, Typography,
} from '@mui/material';
import FieldRenderer from './FieldRenderer';
import { formConfig } from '@/data/form-config';
import { saveFormData, loadFormData, clearFormData } from '@/utils/storage';

type FormValues = Record<string, unknown>;

export default function DynamicForm() {
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' }>
    ({ open: false, message: '', severity: 'success' });
  const [savedData, setSavedData] = useState<FormValues | null>(null);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();

  useEffect(() => {
    const stored = loadFormData();
    if (stored) { reset(stored); setSavedData(stored); }
  }, [reset]);

  const onSubmit = (data: FormValues) => {
    saveFormData(data);
    setSavedData(data);
    setSnackbar({ open: true, message: 'Form submitted successfully!', severity: 'success' });
  };

  const handleClear = () => {
    clearFormData();
    reset(formConfig.reduce((acc, f) => ({ ...acc, [`field_${f.id}`]: '' }), {} as FormValues));
    setSavedData(null);
    setSnackbar({ open: true, message: 'Form cleared.', severity: 'info' });
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Sign Up
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please fill in the details below to create your account.
      </Typography>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2.5}>
              {formConfig.map((field) => (
                <FieldRenderer key={field.id} field={field} control={control} errors={errors} />
              ))}
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button type="submit" variant="contained" fullWidth>
                Submit
              </Button>
              <Button type="button" variant="outlined" color="error" fullWidth onClick={handleClear}>
                Clear
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {savedData && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Saved data (localStorage)
            </Typography>
            <Box component="pre" sx={{ fontSize: '0.8rem', overflowX: 'auto', m: 0 }}>
              {JSON.stringify(
                Object.fromEntries(formConfig.map((f) => [f.name, savedData[`field_${f.id}`] ?? ''])),
                null, 2
              )}
            </Box>
          </CardContent>
        </Card>
      )}

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

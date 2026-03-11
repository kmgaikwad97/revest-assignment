'use client';

import {
  FormControl, FormControlLabel, FormHelperText, FormLabel,
  InputLabel, MenuItem, Radio, RadioGroup, Select, TextField,
} from '@mui/material';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { FormField } from '@/types/form-field';

interface Props {
  field: FormField;
  control: Control<any>;
  errors: FieldErrors;
}

export default function FieldRenderer({ field, control, errors }: Props) {
  const fieldName = `field_${field.id}`;
  const errorMessage = errors[fieldName]?.message as string | undefined;

  const rules: Record<string, unknown> = {};
  if (field.required) rules.required = `${field.name} is required`;
  if (field.minLength) rules.minLength = { value: field.minLength, message: `Minimum ${field.minLength} characters` };
  if (field.maxLength) rules.maxLength = { value: field.maxLength, message: `Maximum ${field.maxLength} characters` };
  if (field.name.toLowerCase().includes('email')) {
    rules.pattern = { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' };
  }

  if (field.fieldType === 'TEXT') {
    return (
      <Controller name={fieldName} control={control} defaultValue={field.defaultValue ?? ''} rules={rules}
        render={({ field: f }) => (
          <TextField
            {...f} fullWidth label={field.name} required={field.required}
            error={!!errorMessage} helperText={errorMessage}
            inputProps={{ minLength: field.minLength, maxLength: field.maxLength }}
          />
        )}
      />
    );
  }

  if (field.fieldType === 'LIST') {
    return (
      <Controller name={fieldName} control={control} defaultValue={field.defaultValue ?? ''} rules={rules}
        render={({ field: f }) => (
          <FormControl fullWidth required={field.required} error={!!errorMessage}>
            <InputLabel>{field.name}</InputLabel>
            <Select {...f} label={field.name}>
              {field.listOfValues1?.map((v) => (
                <MenuItem key={v} value={v}>{v}</MenuItem>
              ))}
            </Select>
            {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
          </FormControl>
        )}
      />
    );
  }

  if (field.fieldType === 'RADIO') {
    return (
      <Controller name={fieldName} control={control} defaultValue={field.defaultValue ?? ''} rules={rules}
        render={({ field: f }) => (
          <FormControl required={field.required} error={!!errorMessage}>
            <FormLabel>{field.name}</FormLabel>
            <RadioGroup {...f} row>
              {field.listOfValues1?.map((v) => (
                <FormControlLabel key={v} value={v} control={<Radio />} label={v} />
              ))}
            </RadioGroup>
            {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
          </FormControl>
        )}
      />
    );
  }

  return null;
}

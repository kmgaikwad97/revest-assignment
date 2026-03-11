export type FieldType = 'TEXT' | 'LIST' | 'RADIO';

export interface FormField {
  id: number;
  name: string;
  fieldType: FieldType;
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
  required?: boolean;
  listOfValues1?: string[];
}

const FORM_STORAGE_KEY = 'dynamic-signup-form';

export function saveFormData(data: Record<string, unknown>): void {
  try {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save form data to localStorage:', err);
  }
}

export function loadFormData(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(FORM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to load form data from localStorage:', err);
    return null;
  }
}

export function clearFormData(): void {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear form data from localStorage:', err);
  }
}

import { Theme } from '@mui/material/styles';

export function getContrastText(theme: Theme, background: string) {
  return theme.palette.getContrastText(background);
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
} 
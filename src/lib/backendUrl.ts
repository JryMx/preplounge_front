export function getBackendURL(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  return '';
}

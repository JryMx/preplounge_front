export function getBackendURL(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:3001';
  }

  const hostname = window.location.hostname;
  
  if (hostname.includes('replit.dev')) {
    return `https://${hostname}:4200`;
  }
  
  return 'http://localhost:3001';
}

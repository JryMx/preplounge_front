export function getBackendURL(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  if (hostname.includes('replit.dev')) {
    return `${protocol}//${hostname}`;
  }
  
  return 'http://localhost:5000';
}

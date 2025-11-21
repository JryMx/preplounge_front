export function getBackendURL(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  return '';
}

// Helper function to construct API v1 endpoints
export function getAPIv1URL(path: string): string {
  const baseURL = getBackendURL();
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseURL}/api/v1/${cleanPath}`;
}

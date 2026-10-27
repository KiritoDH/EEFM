const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // If unauthorized, clear token
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
      window.location.href = '/login';
    }
  }

  // Handle CSV export or other blob types
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/csv')) {
    const blob = await response.blob();
    return blob;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'An unexpected error occurred.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export default apiClient;

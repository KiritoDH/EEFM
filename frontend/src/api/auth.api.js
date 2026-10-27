import apiClient from './client';

export const authApi = {
  login: (credentials) => apiClient('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => apiClient('/auth/register', { method: 'POST', body: userData }),
  getMe: () => apiClient('/auth/me'),
  changePassword: (passwords) => apiClient('/auth/change-password', { method: 'POST', body: passwords }),
};

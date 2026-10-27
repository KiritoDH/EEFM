import apiClient from './client';

export const settingsApi = {
  get: () => apiClient('/settings'),
  update: (data) => apiClient('/settings', { method: 'PUT', body: data }),
};

import apiClient from './client';

export const reportsApi = {
  getOverview: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/reports/overview${query ? `?${query}` : ''}`);
  },
  getAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/reports/analytics${query ? `?${query}` : ''}`);
  },
  exportCSV: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const blob = await apiClient(`/reports/export/csv${query ? `?${query}` : ''}`);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense_tracker_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

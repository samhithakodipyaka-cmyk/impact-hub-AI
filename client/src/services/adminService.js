import apiRequest from './api';

export const adminService = {
  getOverview: () => apiRequest('/admin/overview'),
  getOrganizations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/organizations${query ? `?${query}` : ''}`);
  },
  verifyOrganization: (id, data) => apiRequest(`/admin/organizations/${id}/verify`, { method: 'PUT', body: data }),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users${query ? `?${query}` : ''}`);
  },
  updateUserStatus: (id, status, reason) => apiRequest(`/admin/users/${id}/status`, { method: 'PUT', body: { status, reason } }),
  getReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/reports${query ? `?${query}` : ''}`);
  },
  resolveReport: (id, data) => apiRequest(`/admin/reports/${id}/resolve`, { method: 'PUT', body: data }),
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/audit-logs${query ? `?${query}` : ''}`);
  },
};

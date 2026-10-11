import apiRequest from './api';

export const impactService = {
  getMyDashboard: () => apiRequest('/impact/my-dashboard'),
  getPlatformOverview: () => apiRequest('/impact/platform-overview'),
};

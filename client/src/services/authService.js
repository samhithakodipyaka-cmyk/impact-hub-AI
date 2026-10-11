import apiRequest from './api';

export const authService = {
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: data }),
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: data }),
  me: () => apiRequest('/auth/me'),
  forgotPassword: (email) => apiRequest('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, newPassword) => apiRequest('/auth/reset-password', { method: 'POST', body: { token, newPassword } }),
  updatePassword: (currentPassword, newPassword) => apiRequest('/auth/update-password', { method: 'PUT', body: { currentPassword, newPassword } }),
};

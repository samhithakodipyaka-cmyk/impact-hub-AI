const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Centralized API request wrapper
 */
export async function apiRequest(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const token = localStorage.getItem('impacthub_token');

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...headers,
  };

  const config = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('impacthub_token');
        localStorage.removeItem('impacthub_user');
      }
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${method} ${endpoint}:`, err.message);
    throw err;
  }
}

export default apiRequest;

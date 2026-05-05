import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor — attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto-logout on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // Auto-logout on 401 (expired token) - but not during login itself
    if (status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Auto-logout on 403 (pending account trying to use protected routes) - but not during signup/otp
    if (status === 403 && !url.includes('/auth/verify-otp') && !url.includes('/auth/login')) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;

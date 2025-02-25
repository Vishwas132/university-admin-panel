import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only redirect to login if not trying to refresh the auth and not on login page
    if (
      error.response?.status === 401 && 
      !error.config.url.includes('/admin/profile') &&
      !error.config.url.includes('/auth/admin/login') &&
      !window.location.pathname.includes('/login')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Use history API instead of window.location for a smoother experience
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
); 
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

// Track if we're currently redirecting to avoid multiple redirects
let isRedirecting = false;

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Don't handle errors if we're already redirecting
    if (isRedirecting) {
      return Promise.reject(error);
    }

    // Check if the error is due to an expired token or unauthorized access
    if (
      error.response?.status === 401 && 
      // Don't redirect for auth verification endpoints
      !error.config.url.includes('/admin/profile') &&
      !error.config.url.includes('/students/') &&
      !error.config.url.includes('/auth/admin/login') &&
      !error.config.url.includes('/auth/student/login') &&
      // Don't redirect if we're already on the login page
      !window.location.pathname.includes('/login')
    ) {
      isRedirecting = true;
      
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Use a timeout to ensure we don't get into a redirect loop
      setTimeout(() => {
        // Redirect to login page
        window.location.href = '/login';
        isRedirecting = false;
      }, 100);
    }
    
    // For network errors, don't automatically logout the user
    if (error.message === 'Network Error') {
      console.warn('Network error occurred. Check your connection.');
      // Only reject the specific request, don't logout
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
); 
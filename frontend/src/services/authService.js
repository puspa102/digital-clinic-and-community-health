import axios from 'axios';

// API Base URL - adjust this based on your backend configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies (refresh token)
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await api.get('/auth/refresh-token');
        const { accessToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth Service Functions
const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.full_name - Full name of the user
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Password
   * @param {string} userData.role - User role (Patient, Doctor, etc.)
   * @param {string} userData.phone - Phone number
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Verify OTP for account activation
   * @param {string} email - User email
   * @param {string} otp - OTP code
   */
  verifyOtp: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Resend OTP to user email
   * @param {string} email - User email
   */
  resendOtp: async (email) => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user } = response.data;

      // Store access token and user info
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    try {
      const response = await api.get('/auth/refresh-token');
      const { accessToken } = response.data;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }

      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Get current user from local storage
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get access token
   */
  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },

  /**
   * Handle API errors
   * @param {Error} error - Axios error object
   */
  handleError: (error) => {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message ||
                      error.response.data?.error ||
                      'An error occurred';
      const errors = error.response.data?.errors || [];

      return {
        message,
        errors,
        status: error.response.status,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'Unable to connect to server. Please check your internet connection.',
        status: 0,
      };
    } else {
      // Error setting up request
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0,
      };
    }
  },
};

export default authService;
export { api };

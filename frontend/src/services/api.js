import axios from "axios";

// API Base URL - adjust based on your backend configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies (refresh token)
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
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
        // Try to refresh the token
        // Backend wraps response in { success, message, data: { accessToken } }
        const response = await api.get("/auth/refresh-token");
        const { accessToken } = response.data.data;

        // Save new access token
        localStorage.setItem("accessToken", accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Auth API endpoints
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (data) => {
    const response = await api.post("/auth/verify-otp", data);
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email) => {
    const response = await api.post("/auth/resend-otp", { email });
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post("/auth/logout");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (data) => {
    const response = await api.put("/auth/profile", data);
    return response.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await api.put("/auth/change-password", data);
    return response.data;
  },

  // Refresh access token
  refreshToken: async () => {
    const response = await api.get("/auth/refresh-token");
    return response.data;
  },
};

export default api;

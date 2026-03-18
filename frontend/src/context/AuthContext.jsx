import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { getRoleDashboardPath } from "../utils/roleRoutes";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        try {
          const response = await api.get("/auth/profile");
          setUser(response.data.data);
          setToken(storedToken);
        } catch {
          // Token might be expired, try to refresh
          try {
            const refreshResponse = await api.get("/auth/refresh-token");
            // Backend wraps response in { success, message, data: { accessToken } }
            const newToken = refreshResponse.data.data.accessToken;
            localStorage.setItem("accessToken", newToken);
            setToken(newToken);

            // Retry getting profile
            const profileResponse = await api.get("/auth/profile");
            setUser(profileResponse.data.data);
          } catch {
            // Refresh failed, clear auth state
            localStorage.removeItem("accessToken");
            setToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const register = async (userData) => {
    setError(null);
    try {
      const response = await api.post("/auth/register", userData);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const verifyOtp = async (email, otp) => {
    setError(null);
    try {
      const response = await api.post("/auth/verify-otp", { email, otp });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "OTP verification failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resendOtp = async (email) => {
    setError(null);
    try {
      const response = await api.post("/auth/resend-otp", { email });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to resend OTP";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post("/auth/login", { email, password });
      // Backend wraps response in { success, message, data: { accessToken, user } }
      const { accessToken, user: userData } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      setToken(accessToken);
      setUser(userData);

      // Return success with user data and redirect path based on role
      return {
        success: true,
        data: response.data.data,
        redirectPath: getRoleDashboardPath(userData?.role),
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed";
      const errorCode = err.response?.data?.code || null;
      const errorData = err.response?.data?.data || null;
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        code: errorCode,
        email: errorData?.email || null,
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get("/auth/profile");
      setUser(response.data.data);
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
    }
  };

  const clearError = () => setError(null);

  /**
   * Get the dashboard path for the current user based on their role
   * @returns {string} - Dashboard path
   */
  const getDashboardPath = () => {
    return getRoleDashboardPath(user?.role);
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    register,
    verifyOtp,
    resendOtp,
    login,
    logout,
    refreshUser,
    clearError,
    getDashboardPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

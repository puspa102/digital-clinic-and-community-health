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

// ============================================
// Auth API endpoints
// ============================================
export const authAPI = {
  // Register a new patient (public registration is Patient-only)
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

  // Get all users (Admin only)
  getAllUsers: async (params = {}) => {
    const response = await api.get("/auth/users", { params });
    return response.data;
  },

  // Get user by ID (Admin only)
  getUserById: async (userId) => {
    const response = await api.get(`/auth/users/${userId}`);
    return response.data;
  },

  // Update user status (Admin only)
  updateUserStatus: async (userId, status) => {
    const response = await api.put(`/auth/users/${userId}/status`, { status });
    return response.data;
  },

  // Delete user (Admin only)
  deleteUser: async (userId) => {
    const response = await api.delete(`/auth/users/${userId}`);
    return response.data;
  },

  // Get all patients (Admin, Doctor, Pharmacy)
  getPatients: async (params = {}) => {
    const response = await api.get("/auth/patients", { params });
    return response.data;
  },

  // Get doctor's patients (patients with appointments for this doctor)
  getDoctorPatients: async (params = {}) => {
    const response = await api.get("/doctors/my-patients", { params });
    return response.data;
  },
};

// ============================================
// Pharmacy API endpoints
// ============================================
export const pharmacyAPI = {
  // Create a new pharmacy (Admin only)
  createPharmacy: async (data) => {
    const response = await api.post("/pharmacies", data);
    return response.data;
  },

  // Get all pharmacies (public)
  getAllPharmacies: async (params = {}) => {
    const response = await api.get("/pharmacies", { params });
    return response.data;
  },

  // Get pharmacy by ID (public)
  getPharmacyById: async (pharmacyId) => {
    const response = await api.get(`/pharmacies/${pharmacyId}`);
    return response.data;
  },

  // Update pharmacy profile (Pharmacy owner or Admin)
  updatePharmacy: async (pharmacyId, data) => {
    const response = await api.put(`/pharmacies/${pharmacyId}`, data);
    return response.data;
  },

  // Delete pharmacy (Admin only)
  deletePharmacy: async (pharmacyId) => {
    const response = await api.delete(`/pharmacies/${pharmacyId}`);
    return response.data;
  },

  // Get my pharmacy profile (Pharmacy user)
  getMyPharmacy: async () => {
    const response = await api.get("/pharmacies/me");
    return response.data;
  },

  // Create a doctor under this pharmacy (Pharmacy only)
  createDoctor: async (data) => {
    const response = await api.post("/pharmacies/doctors", data);
    return response.data;
  },

  // Get my doctors (Pharmacy only)
  getMyDoctors: async (params = {}) => {
    const response = await api.get("/pharmacies/my-doctors", { params });
    return response.data;
  },

  // Get doctors of a specific pharmacy (public)
  getPharmacyDoctors: async (pharmacyId, params = {}) => {
    const response = await api.get(`/pharmacies/${pharmacyId}/doctors`, { params });
    return response.data;
  },

  // Get my appointments (Pharmacy only)
  getMyAppointments: async (params = {}) => {
    const response = await api.get("/pharmacies/my-appointments", { params });
    return response.data;
  },

  // Assign a doctor to an appointment (Pharmacy only)
  assignDoctorToAppointment: async (appointmentId, doctorId) => {
    const response = await api.put(
      `/pharmacies/appointments/${appointmentId}/assign-doctor`,
      { doctor_id: doctorId }
    );
    return response.data;
  },
};

// ============================================
// Inventory API endpoints
// ============================================
export const inventoryAPI = {
  // Get inventory items (Pharmacy only)
  getInventory: async (params = {}) => {
    const response = await api.get("/inventory", { params });
    return response.data;
  },

  // Get inventory item by ID (Pharmacy only)
  getInventoryItem: async (itemId) => {
    const response = await api.get(`/inventory/${itemId}`);
    return response.data;
  },

  // Create inventory item (Pharmacy only)
  createInventoryItem: async (data) => {
    const response = await api.post("/inventory", data);
    return response.data;
  },

  // Update inventory item (Pharmacy only)
  updateInventoryItem: async (itemId, data) => {
    const response = await api.put(`/inventory/${itemId}`, data);
    return response.data;
  },

  // Delete inventory item (Pharmacy only)
  deleteInventoryItem: async (itemId) => {
    const response = await api.delete(`/inventory/${itemId}`);
    return response.data;
  },

  // Get inventory stats (Pharmacy only)
  getInventoryStats: async () => {
    const response = await api.get("/inventory/stats");
    return response.data;
  },
};

// ============================================
// Order API endpoints
// ============================================
export const orderAPI = {
  // Get orders (Pharmacy only)
  getOrders: async (params = {}) => {
    const response = await api.get("/orders", { params });
    return response.data;
  },

  // Get order by ID (Pharmacy only)
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Create order (Pharmacy only)
  createOrder: async (data) => {
    const response = await api.post("/orders", data);
    return response.data;
  },

  // Update order details (Pharmacy only)
  updateOrder: async (orderId, data) => {
    const response = await api.put(`/orders/${orderId}`, data);
    return response.data;
  },

  // Update order status (Pharmacy only)
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Delete order (Pharmacy only)
  deleteOrder: async (orderId) => {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  },

  // Get order stats (Pharmacy only)
  getOrderStats: async () => {
    const response = await api.get("/orders/stats");
    return response.data;
  },
};

// ============================================
// Prescription API endpoints
// ============================================
export const prescriptionAPI = {
  // Get my prescriptions (Doctor)
  getMyPrescriptions: async (params = {}) => {
    const response = await api.get("/prescriptions/my-prescriptions", { params });
    return response.data;
  },

  // Get prescription by ID
  getPrescriptionById: async (id) => {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data;
  },

  // Create prescription (Doctor)
  createPrescription: async (data) => {
    const response = await api.post("/prescriptions", data);
    return response.data;
  },

  // Update prescription (Doctor)
  updatePrescription: async (id, data) => {
    const response = await api.put(`/prescriptions/${id}`, data);
    return response.data;
  },

  // Delete prescription
  deletePrescription: async (id) => {
    const response = await api.delete(`/prescriptions/${id}`);
    return response.data;
  },

  // Get prescription stats (Doctor)
  getPrescriptionStats: async () => {
    const response = await api.get("/prescriptions/stats");
    return response.data;
  },

  // Get prescriptions for a patient
  getPatientPrescriptions: async (patientId, params = {}) => {
    const response = await api.get(`/prescriptions/patient/${patientId}`, { params });
    return response.data;
  },
};

// ============================================
// Doctor API endpoints
// ============================================
export const doctorAPI = {
  // Get all doctors (public)
  getAllDoctors: async (params = {}) => {
    const response = await api.get("/doctors", { params });
    return response.data;
  },

  // Get doctor by ID (public)
  getDoctorById: async (doctorId) => {
    const response = await api.get(`/doctors/${doctorId}`);
    return response.data;
  },

  // Get my doctor profile (Doctor user)
  getMyProfile: async () => {
    const response = await api.get("/doctors/me");
    return response.data;
  },

  // Update my doctor profile (Doctor user)
  updateMyProfile: async (data) => {
    const response = await api.put("/doctors/me", data);
    return response.data;
  },

  // Get doctor availability
  getDoctorAvailability: async (doctorId) => {
    const response = await api.get(`/doctors/${doctorId}/availability`);
    return response.data;
  },

  // Update doctor profile (Doctor, Pharmacy owner, or Admin)
  updateDoctor: async (doctorId, data) => {
    const response = await api.put(`/doctors/${doctorId}`, data);
    return response.data;
  },

  // Delete doctor (Pharmacy owner or Admin)
  deleteDoctor: async (doctorId) => {
    const response = await api.delete(`/doctors/${doctorId}`);
    return response.data;
  },
};

// ============================================
// Appointment API endpoints
// ============================================
export const appointmentAPI = {
  // Create an appointment at a pharmacy (Patient only)
  createAppointment: async (data) => {
    const response = await api.post("/appointments", data);
    return response.data;
  },

  // Get all appointments (Admin only)
  getAllAppointments: async (params = {}) => {
    const response = await api.get("/appointments", { params });
    return response.data;
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId) => {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data;
  },

  // Get my appointments (Patient)
  getMyAppointments: async (params = {}) => {
    const response = await api.get("/appointments/my-appointments", { params });
    return response.data;
  },

  // Get my doctor appointments (Doctor)
  getMyDoctorAppointments: async (params = {}) => {
    const response = await api.get("/appointments/my-doctor-appointments", { params });
    return response.data;
  },

  // Get appointments for a specific patient
  getPatientAppointments: async (patientId, params = {}) => {
    const response = await api.get(`/appointments/patient/${patientId}`, { params });
    return response.data;
  },

  // Get appointments for a specific doctor
  getDoctorAppointments: async (doctorId, params = {}) => {
    const response = await api.get(`/appointments/doctor/${doctorId}`, { params });
    return response.data;
  },

  // Confirm an appointment with consultation details (Doctor)
  confirmAppointment: async (appointmentId, data) => {
    const response = await api.put(`/appointments/${appointmentId}/confirm`, data);
    return response.data;
  },

  // Complete an appointment (Doctor)
  completeAppointment: async (appointmentId) => {
    const response = await api.put(`/appointments/${appointmentId}/complete`);
    return response.data;
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId, status) => {
    const response = await api.put(`/appointments/${appointmentId}/status`, { status });
    return response.data;
  },

  // Cancel an appointment
  cancelAppointment: async (appointmentId, reason = "") => {
    const response = await api.put(`/appointments/${appointmentId}/cancel`, { reason });
    return response.data;
  },

  // Verify appointment by QR token
  verifyQrToken: async (qrToken) => {
    const response = await api.get(`/appointments/verify-qr/${qrToken}`);
    return response.data;
  },
};

// ============================================
// Payment API endpoints
// ============================================
export const paymentAPI = {
  // Initiate payment
  initiatePayment: async (appointmentId, paymentMethod) => {
    const response = await api.post("/payments/initiate", {
      appointment_id: appointmentId,
      payment_method: paymentMethod,
    });
    return response.data;
  },

  // Verify payment
  verifyPayment: async (transactionId) => {
    const response = await api.post("/payments/verify", {
      transaction_id: transactionId,
    });
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async (params = {}) => {
    const response = await api.get("/payments/history", { params });
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },
};

// ============================================
// Emergency API endpoints
// ============================================
export const emergencyAPI = {
  // Create emergency request
  createEmergency: async (data) => {
    const response = await api.post("/emergencies", data);
    return response.data;
  },

  // Get all emergencies
  getAllEmergencies: async (params = {}) => {
    const response = await api.get("/emergencies", { params });
    return response.data;
  },

  // Get emergency by ID
  getEmergencyById: async (emergencyId) => {
    const response = await api.get(`/emergencies/${emergencyId}`);
    return response.data;
  },

  // Get my emergencies (Patient)
  getMyEmergencies: async (params = {}) => {
    const response = await api.get("/emergencies/my-emergencies", { params });
    return response.data;
  },

  // Accept emergency (Doctor, Pharmacy)
  acceptEmergency: async (emergencyId) => {
    const response = await api.put(`/emergencies/${emergencyId}/accept`);
    return response.data;
  },

  // Update emergency status
  updateEmergencyStatus: async (emergencyId, status) => {
    const response = await api.put(`/emergencies/${emergencyId}/status`, { status });
    return response.data;
  },

  // Get nearby emergencies (Doctor, Pharmacy)
  getNearbyEmergencies: async (params = {}) => {
    const response = await api.get("/emergencies/nearby", { params });
    return response.data;
  },
};

// ============================================
// Utility functions
// ============================================
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      "An error occurred";
    const errors = error.response.data?.errors || [];

    return {
      message,
      errors,
      status: error.response.status,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: "Unable to connect to server. Please check your internet connection.",
      status: 0,
    };
  } else {
    // Error setting up request
    return {
      message: error.message || "An unexpected error occurred",
      status: 0,
    };
  }
};

// Appointment status constants
export const APPOINTMENT_STATUS = {
  REQUESTED: "requested",
  ASSIGNED: "assigned",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
};

// User roles constants
export const USER_ROLES = {
  PATIENT: "Patient",
  DOCTOR: "Doctor",
  ADMIN: "Admin",
  PHARMACY: "Pharmacy",
};

// User status constants
export const USER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  BLOCKED: "blocked",
};

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
};

// Order status constants
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// Prescription status constants
export const PRESCRIPTION_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Status badge color mapping
export const getStatusBadgeClass = (status) => {
  const statusClasses = {
    // Appointment statuses
    requested: "bg-yellow-100 text-yellow-700",
    assigned: "bg-blue-100 text-blue-700",
    confirmed: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-700",
    cancelled: "bg-red-100 text-red-700",
    no_show: "bg-orange-100 text-orange-700",
    // User statuses
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    blocked: "bg-red-100 text-red-700",
    active: "bg-green-100 text-green-700",
    // Payment statuses
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    // Order statuses
    confirmed: "bg-blue-100 text-blue-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
  };
  return statusClasses[status] || "bg-gray-100 text-gray-700";
};

// Role badge color mapping
export const getRoleBadgeClass = (role) => {
  const roleClasses = {
    Patient: "bg-blue-100 text-blue-700",
    Doctor: "bg-green-100 text-green-700",
    Pharmacy: "bg-orange-100 text-orange-700",
    Admin: "bg-purple-100 text-purple-700",
  };
  return roleClasses[role] || "bg-gray-100 text-gray-700";
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format time for display
export const formatTime = (timeString) => {
  if (!timeString) return "";
  // Handle HH:MM format
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Format datetime for display
export const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default api;
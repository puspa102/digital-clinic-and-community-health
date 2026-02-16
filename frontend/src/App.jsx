import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";

// Dashboard Pages
import PatientDashboard from "./pages/patient/Dashboard";
import DoctorDashboard from "./pages/doctor/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import PharmacyDashboard from "./pages/pharmacy/Dashboard";

// Component to redirect to role-based dashboard
const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Redirect based on user role
  switch (user?.role) {
    case "Admin":
      return <Navigate to="/admin/dashboard" replace />;
    case "Doctor":
      return <Navigate to="/doctor/dashboard" replace />;
    case "Pharmacy":
      return <Navigate to="/pharmacy/dashboard" replace />;
    case "Patient":
    default:
      return <Navigate to="/patient/dashboard" replace />;
  }
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* Dashboard redirect - redirects to role-based dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* Patient Routes */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute roles={["Patient", "Admin"]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

      {/* Doctor Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute roles={["Doctor", "Admin"]}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Pharmacy Routes */}
      <Route
        path="/pharmacy/dashboard"
        element={
          <ProtectedRoute roles={["Pharmacy", "Admin"]}>
            <PharmacyDashboard />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

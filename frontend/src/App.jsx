import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Home from "./pages/Home";
import Success from "./pages/Success";
import Failure from "./pages/Failure";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Patient Pages
import PatientDashboard from "./pages/patient/Dashboard";
import PatientAppointments from "./pages/patient/Appointments";
import PatientRecords from "./pages/patient/Records";
import PatientPrescriptions from "./pages/patient/Prescriptions";
import PatientPharmacies from "./pages/patient/Pharmacies";
import PatientProfile from "./pages/patient/Profile";
import PatientSettings from "./pages/patient/Settings";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorAppointments from "./pages/doctor/Appointments";
import DoctorPatients from "./pages/doctor/Patients";
import DoctorSchedule from "./pages/doctor/Schedule";
import DoctorPrescriptions from "./pages/doctor/Prescriptions";
import DoctorProfile from "./pages/doctor/Profile";
import DoctorSettings from "./pages/doctor/Settings";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminPharmacies from "./pages/admin/Pharmacies";
import AdminDoctors from "./pages/admin/Doctors";
import AdminAppointments from "./pages/admin/Appointments";
import AdminReports from "./pages/admin/Reports";
import AdminProfile from "./pages/admin/Profile";
import AdminSettings from "./pages/admin/Settings";

// Pharmacy Pages
import PharmacyDashboard from "./pages/pharmacy/Dashboard";
import PharmacyAppointments from "./pages/pharmacy/Appointments";
import PharmacyDoctors from "./pages/pharmacy/Doctors";
import PharmacyPrescriptions from "./pages/pharmacy/Prescriptions";
import PharmacyInventory from "./pages/pharmacy/Inventory";
import PharmacyOrders from "./pages/pharmacy/Orders";
import PharmacyReports from "./pages/pharmacy/Reports";
import PharmacyProfile from "./pages/pharmacy/Profile";
import PharmacySettings from "./pages/pharmacy/Settings";

// Shared Pages
import Emergency from "./pages/Emergency";

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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/success" element={<Success />} />
      <Route path="/failure" element={<Failure />} />

      {/* Dashboard redirect - redirects to role-based dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* ==================== Patient Routes ==================== */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute roles={["Patient", "Admin"]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute roles={["Patient", "Admin"]}>
            <PatientAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/pharmacies"
        element={
          <ProtectedRoute roles={["Patient", "Admin"]}>
            <PatientPharmacies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/records"
        element={
          <ProtectedRoute roles={["Patient", "Admin"]}>
            <PatientRecords />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/history"
        element={
          <ProtectedRoute roles={["Patient", "Admin"]}>
            <PatientRecords />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/prescriptions"
        element={
          <ProtectedRoute roles={["Patient", "Admin"]}>
            <PatientPrescriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute roles={["Patient", "Admin"]}>
            <PatientProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/settings"
        element={
          <ProtectedRoute roles={["Patient", "Admin"]}>
            <PatientSettings />
          </ProtectedRoute>
        }
      />

      {/* ==================== Doctor Routes ==================== */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute roles={["Doctor", "Admin"]}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute roles={["Doctor", "Admin"]}>
            <DoctorAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute roles={["Doctor", "Admin"]}>
            <DoctorPatients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/schedule"
        element={
          <ProtectedRoute roles={["Doctor", "Admin"]}>
            <DoctorSchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/prescriptions"
        element={
          <ProtectedRoute roles={["Doctor", "Admin"]}>
            <DoctorPrescriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute roles={["Doctor", "Admin"]}>
            <DoctorProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/settings"
        element={
          <ProtectedRoute roles={["Doctor", "Admin"]}>
            <DoctorSettings />
          </ProtectedRoute>
        }
      />

      {/* ==================== Admin Routes ==================== */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pharmacies"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <AdminPharmacies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <AdminDoctors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <AdminAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <AdminReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <AdminProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <AdminSettings />
          </ProtectedRoute>
        }
      />

      {/* ==================== Pharmacy Routes ==================== */}
      <Route
        path="/pharmacy/dashboard"
        element={
          <ProtectedRoute roles={["Pharmacy", "Admin"]}>
            <PharmacyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/appointments"
        element={
          <ProtectedRoute roles={["Pharmacy", "Admin"]}>
            <PharmacyAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/doctors"
        element={
          <ProtectedRoute roles={["Pharmacy", "Admin"]}>
            <PharmacyDoctors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/doctors/add"
        element={
          <ProtectedRoute roles={["Pharmacy", "Admin"]}>
            <PharmacyDoctors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/prescriptions"
        element={
          <ProtectedRoute roles={["Pharmacy", "Admin"]}>
            <PharmacyPrescriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/reports"
        element={
          <ProtectedRoute roles={["Pharmacy", "Admin"]}>
            <PharmacyReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/inventory"
        element={
          <ProtectedRoute roles={["Pharmacy", "Admin"]}>
            <PharmacyInventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/orders"
        element={
          <ProtectedRoute roles={["Pharmacy", "Admin"]}>
            <PharmacyOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/settings"
        element={
          <ProtectedRoute roles={["Pharmacy", "Admin"]}>
            <PharmacySettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/profile"
        element={
          <ProtectedRoute roles={["Pharmacy", "Admin"]}>
            <PharmacyProfile />
          </ProtectedRoute>
        }
      />

      {/* ==================== Shared Routes ==================== */}
      <Route
        path="/emergency"
        element={
          <ProtectedRoute roles={["Patient", "Doctor", "Admin", "Pharmacy"]}>
            <Emergency />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Home />} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import api, {
  authAPI,
  doctorAPI,
  appointmentAPI,
  pharmacyAPI,
  handleApiError,
  formatDate,
  APPOINTMENT_STATUS,
} from "../../services/api";
import {
  BarChart3,
  Users,
  UserCheck,
  UserX,
  Calendar,
  Building2,
  Stethoscope,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Activity,
  Shield,
  HeartPulse,
  Pill,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [userStats, setUserStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    patients: 0,
    doctors: 0,
    pharmacies: 0,
    admins: 0,
  });

  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    requested: 0,
    assigned: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  const [doctorStats, setDoctorStats] = useState({
    total: 0,
    verified: 0,
    unverified: 0,
  });

  const [pharmacyStats, setPharmacyStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [
        allUsersRes,
        approvedUsersRes,
        pendingUsersRes,
        rejectedUsersRes,
        doctorsRes,
        pharmaciesRes,
        appointmentsRes,
      ] = await Promise.all([
        authAPI.getAllUsers({ limit: 1000 }).catch(() => ({ data: [], pagination: {} })),
        authAPI.getAllUsers({ status: "approved", limit: 1000 }).catch(() => ({ data: [], pagination: {} })),
        authAPI.getAllUsers({ status: "pending", limit: 1000 }).catch(() => ({ data: [], pagination: {} })),
        authAPI.getAllUsers({ status: "rejected", limit: 1000 }).catch(() => ({ data: [], pagination: {} })),
        doctorAPI.getAllDoctors({ limit: 1000 }).catch(() => ({ data: [], pagination: {} })),
        pharmacyAPI.getAllPharmacies({ limit: 1000 }).catch(() => ({ data: [], pagination: {} })),
        appointmentAPI.getAllAppointments({ limit: 1000 }).catch(() => ({ data: [], pagination: {} })),
      ]);

      // Process user stats
      const allUsers = allUsersRes?.data || [];
      const patients = allUsers.filter((u) => u.role === "Patient").length;
      const doctors = allUsers.filter((u) => u.role === "Doctor").length;
      const pharmacies = allUsers.filter((u) => u.role === "Pharmacy").length;
      const admins = allUsers.filter((u) => u.role === "Admin").length;

      setUserStats({
        total: allUsersRes?.pagination?.totalItems || allUsers.length,
        approved: approvedUsersRes?.pagination?.totalItems || approvedUsersRes?.data?.length || 0,
        pending: pendingUsersRes?.pagination?.totalItems || pendingUsersRes?.data?.length || 0,
        rejected: rejectedUsersRes?.pagination?.totalItems || rejectedUsersRes?.data?.length || 0,
        patients,
        doctors,
        pharmacies,
        admins,
      });

      // Recent users (last 10)
      setRecentUsers(allUsers.slice(0, 10));

      // Process doctor stats
      const allDoctors = doctorsRes?.data || [];
      setDoctorStats({
        total: doctorsRes?.pagination?.totalItems || allDoctors.length,
        verified: allDoctors.filter((d) => d.is_verified).length,
        unverified: allDoctors.filter((d) => !d.is_verified).length,
      });

      // Process pharmacy stats
      const allPharmacies = pharmaciesRes?.data || [];
      setPharmacyStats({
        total: pharmaciesRes?.pagination?.totalItems || allPharmacies.length,
        active: allPharmacies.filter((p) => p.is_active).length,
        inactive: allPharmacies.filter((p) => !p.is_active).length,
      });

      // Process appointment stats
      const allAppointments = appointmentsRes?.data || [];
      setRecentAppointments(allAppointments.slice(0, 10));

      setAppointmentStats({
        total: appointmentsRes?.pagination?.totalItems || allAppointments.length,
        requested: allAppointments.filter(
          (a) => a.status === APPOINTMENT_STATUS.REQUESTED
        ).length,
        assigned: allAppointments.filter(
          (a) => a.status === APPOINTMENT_STATUS.ASSIGNED
        ).length,
        confirmed: allAppointments.filter(
          (a) => a.status === APPOINTMENT_STATUS.CONFIRMED
        ).length,
        completed: allAppointments.filter(
          (a) => a.status === APPOINTMENT_STATUS.COMPLETED
        ).length,
        cancelled: allAppointments.filter(
          (a) => a.status === APPOINTMENT_STATUS.CANCELLED
        ).length,
      });
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAllStats(true);
  };

  const getPercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "Doctor":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Patient":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Pharmacy":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Loading reports...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-4 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                System Reports
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Platform-wide analytics and statistics
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm rounded-lg transition-colors font-medium"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {userStats.total}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total Users
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Stethoscope className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {doctorStats.total}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Doctors
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {pharmacyStats.total}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pharmacies
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {appointmentStats.total}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Appointments
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Distribution Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs">Patients</p>
                <p className="text-xl font-bold">{userStats.patients}</p>
              </div>
              <HeartPulse className="w-6 h-6 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs">Doctors</p>
                <p className="text-xl font-bold">{userStats.doctors}</p>
              </div>
              <Stethoscope className="w-6 h-6 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs">Pharmacies</p>
                <p className="text-xl font-bold">{userStats.pharmacies}</p>
              </div>
              <Pill className="w-6 h-6 text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs">Admins</p>
                <p className="text-xl font-bold">{userStats.admins}</p>
              </div>
              <Shield className="w-6 h-6 text-purple-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* User Status Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  User Status
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Account approval breakdown
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {/* Approved */}
              <div className="flex items-center justify-between p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Approved Users
                  </span>
                </div>
                <span className="text-base font-bold text-green-600 dark:text-green-400">
                  {userStats.approved}
                </span>
              </div>

              {/* Pending */}
              <div className="flex items-center justify-between p-2.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Pending Approval
                  </span>
                </div>
                <span className="text-base font-bold text-yellow-600 dark:text-yellow-400">
                  {userStats.pending}
                </span>
              </div>

              {/* Rejected */}
              <div className="flex items-center justify-between p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Rejected Users
                  </span>
                </div>
                <span className="text-base font-bold text-red-600 dark:text-red-400">
                  {userStats.rejected}
                </span>
              </div>
            </div>
          </div>

          {/* Doctor & Pharmacy Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Provider Stats
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Doctors and pharmacies
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Doctor Verification */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Doctor Verification
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {doctorStats.verified}/{doctorStats.total} verified
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 bg-green-50 dark:bg-green-900/20 rounded-md text-center">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {doctorStats.verified}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Verified
                    </p>
                  </div>
                  <div className="flex-1 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md text-center">
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {doctorStats.unverified}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Unverified
                    </p>
                  </div>
                </div>
              </div>

              {/* Pharmacy Status */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Pharmacy Status
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {pharmacyStats.active}/{pharmacyStats.total} active
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 bg-green-50 dark:bg-green-900/20 rounded-md text-center">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {pharmacyStats.active}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Active
                    </p>
                  </div>
                  <div className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-center">
                    <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
                      {pharmacyStats.inactive}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Inactive
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Appointment Analytics
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Breakdown by status
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {appointmentStats.requested}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Requested
              </p>
            </div>

            <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {appointmentStats.assigned}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Assigned
              </p>
            </div>

            <div className="text-center p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {appointmentStats.confirmed}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Confirmed
              </p>
            </div>

            <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {appointmentStats.completed}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Completed
              </p>
            </div>

            <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {appointmentStats.cancelled}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Cancelled
              </p>
            </div>

            <div className="text-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {appointmentStats.total}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Total
              </p>
            </div>
          </div>

          {/* Completion Rate */}
          {appointmentStats.total > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Completion Rate
                </span>
                <span className="text-base font-semibold text-blue-600 dark:text-blue-400">
                  {getPercentage(
                    appointmentStats.completed,
                    appointmentStats.total
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${getPercentage(
                      appointmentStats.completed,
                      appointmentStats.total
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* User Distribution Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  User Distribution by Role
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Breakdown of users by their roles
                </p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Patients", value: userStats.patients, color: "#3b82f6" },
                      { name: "Doctors", value: userStats.doctors, color: "#22c55e" },
                      { name: "Pharmacies", value: userStats.pharmacies, color: "#f97316" },
                      { name: "Admins", value: userStats.admins, color: "#a855f7" },
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {[
                      { name: "Patients", value: userStats.patients, color: "#3b82f6" },
                      { name: "Doctors", value: userStats.doctors, color: "#22c55e" },
                      { name: "Pharmacies", value: userStats.pharmacies, color: "#f97316" },
                      { name: "Admins", value: userStats.admins, color: "#a855f7" },
                    ].filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Appointment Status Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Appointment Status Overview
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Distribution of appointments by status
                </p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Requested", value: appointmentStats.requested, fill: "#eab308" },
                    { name: "Assigned", value: appointmentStats.assigned, fill: "#3b82f6" },
                    { name: "Confirmed", value: appointmentStats.confirmed, fill: "#6366f1" },
                    { name: "Completed", value: appointmentStats.completed, fill: "#22c55e" },
                    { name: "Cancelled", value: appointmentStats.cancelled, fill: "#ef4444" },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {[
                      { name: "Requested", value: appointmentStats.requested, fill: "#eab308" },
                      { name: "Assigned", value: appointmentStats.assigned, fill: "#3b82f6" },
                      { name: "Confirmed", value: appointmentStats.confirmed, fill: "#6366f1" },
                      { name: "Completed", value: appointmentStats.completed, fill: "#22c55e" },
                      { name: "Cancelled", value: appointmentStats.cancelled, fill: "#ef4444" },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Status Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
                <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  User Account Status
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Approval status breakdown
                </p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Approved", value: userStats.approved, color: "#22c55e" },
                      { name: "Pending", value: userStats.pending, color: "#eab308" },
                      { name: "Rejected", value: userStats.rejected, color: "#ef4444" },
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {[
                      { name: "Approved", value: userStats.approved, color: "#22c55e" },
                      { name: "Pending", value: userStats.pending, color: "#eab308" },
                      { name: "Rejected", value: userStats.rejected, color: "#ef4444" },
                    ].filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Provider Status Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-md">
                <Stethoscope className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Providers Status
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Doctor verification & pharmacy status
                </p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Doctors",
                      Verified: doctorStats.verified,
                      Unverified: doctorStats.unverified,
                    },
                    {
                      name: "Pharmacies",
                      Active: pharmacyStats.active,
                      Inactive: pharmacyStats.inactive,
                    },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Verified" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Unverified" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Active" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Inactive" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Users */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Recent Users
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Latest registered accounts
                  </p>
                </div>
              </div>
            </div>

            {recentUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-sm">No users yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-60 overflow-y-auto">
                {recentUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                          {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.full_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                  <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Recent Appointments
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Latest appointment activity
                  </p>
                </div>
              </div>
            </div>

            {recentAppointments.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-sm">No appointments yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-60 overflow-y-auto">
                {recentAppointments.map((appointment) => (
                  <div
                    key={appointment.appointment_id}
                    className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-sm">
                          {appointment.Patient?.full_name
                            ?.charAt(0)
                            ?.toUpperCase() || "P"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {appointment.Patient?.full_name || "Patient"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(appointment.appointment_date)} •{" "}
                            {appointment.Pharmacy?.pharmacy_name || "Pharmacy"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                          appointment.status === APPOINTMENT_STATUS.COMPLETED
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : appointment.status === APPOINTMENT_STATUS.CANCELLED
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : appointment.status === APPOINTMENT_STATUS.CONFIRMED
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : appointment.status === APPOINTMENT_STATUS.ASSIGNED
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {appointment.status?.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Report Generation Note */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Export Reports
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Detailed report generation with PDF/Excel export functionality
                will be available in future updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;

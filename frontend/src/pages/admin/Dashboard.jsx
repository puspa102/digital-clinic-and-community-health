import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import StatCard from "../../components/dashboard/StatCard";
import QuickActions from "../../components/dashboard/QuickActions";
import {
  Users,
  Stethoscope,
  CalendarDays,
  UserCheck,
  Settings,
  Loader2,
  Server,
  Database,
  Activity,
  ChevronRight,
} from "lucide-react";
import { authAPI, doctorAPI, appointmentAPI, handleApiError, formatDate, getStatusBadgeClass, getRoleBadgeClass } from "../../services/api";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingUsers: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [usersResponse, doctorsResponse, appointmentsResponse, pendingUsersResponse] = await Promise.all([
        authAPI.getAllUsers({ page: 1, limit: 5 }),
        doctorAPI.getAllDoctors({ page: 1, limit: 10 }),
        appointmentAPI.getAllAppointments({ page: 1, limit: 10 }),
        authAPI.getAllUsers({ page: 1, limit: 10, status: "pending" }),
      ]);

      console.log("Dashboard API Responses:", {
        users: usersResponse,
        doctors: doctorsResponse,
        appointments: appointmentsResponse,
        pendingUsers: pendingUsersResponse,
      });

      // Set stats
      setStats({
        totalUsers: usersResponse.pagination?.totalItems || 0,
        totalDoctors: doctorsResponse.pagination?.totalItems || 0,
        totalAppointments: appointmentsResponse.pagination?.totalItems || 0,
        pendingUsers: pendingUsersResponse.pagination?.totalItems || 0,
      });

      // Set recent users
      if (usersResponse.success && usersResponse.data) {
        setRecentUsers(usersResponse.data);
      }

      // Set pending approvals
      if (pendingUsersResponse.success && pendingUsersResponse.data) {
        setPendingApprovals(pendingUsersResponse.data);
      }
    } catch (err) {
      console.error("Dashboard API Error:", err);
      const errorData = handleApiError(err);
      setError(errorData.message || "Failed to connect to server. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const response = await authAPI.updateUserStatus(userId, "approved");
      if (response.success) {
        fetchDashboardData();
      }
    } catch (err) {
      const errorData = handleApiError(err);
      alert(errorData.message);
    }
  };

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, colorClass: "bg-[#0ea5e9] dark:bg-[#0284c7]" },
    { label: "Total Doctors", value: stats.totalDoctors, icon: Stethoscope, colorClass: "bg-[#8b5cf6] dark:bg-[#7c3aed]" },
    { label: "Total Appointments", value: stats.totalAppointments, icon: CalendarDays, colorClass: "bg-[#f59e0b] dark:bg-[#d97706]" },
    { label: "Pending Approvals", value: stats.pendingUsers, icon: UserCheck, colorClass: "bg-[#ef4444] dark:bg-[#dc2626]" },
  ];

  const quickActionsList = [
    { label: "Manage Users", icon: Users, href: "/admin/users", accent: false },
    { label: "Manage Doctors", icon: Stethoscope, href: "/admin/doctors", accent: false },
    { label: "View Appointments", icon: CalendarDays, href: "/admin/appointments", accent: false },
    { label: "Settings", icon: Settings, href: "/admin/settings", accent: true },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              Welcome back! Here's an overview of your platform's performance.
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-red-700 dark:text-red-400 font-medium text-sm">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((stat, i) => (
            <StatCard key={i} {...stat} loading={loading} />
          ))}
        </div>

        {/* Quick Actions */}
        <QuickActions actions={quickActionsList} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Users */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                Recent Users
              </h2>
              <Link
                to="/admin/users"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold transition-colors flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">User</th>
                      <th className="text-left px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Role</th>
                      <th className="text-left px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                    {recentUsers.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center justify-center">
                            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                            <span className="font-medium">No users found</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      recentUsers.map((user) => (
                        <tr key={user.user_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                                {user.full_name?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white text-[15px]">{user.full_name}</p>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-[11px] font-black rounded-full uppercase tracking-widest ${getRoleBadgeClass(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-[11px] font-black rounded-full uppercase tracking-widest ${getStatusBadgeClass(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                            {formatDate(user.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                Pending Approvals
              </h2>
              {pendingApprovals.length > 0 && (
                <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-red-200 dark:border-red-800">
                  {pendingApprovals.length} New
                </span>
              )}
            </div>
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 overflow-hidden shadow-lg divide-y divide-gray-100 dark:divide-gray-800/50">
              {pendingApprovals.length === 0 ? (
                <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="font-medium">No pending approvals</p>
                </div>
              ) : (
                pendingApprovals.slice(0, 5).map((user) => (
                  <div key={user.user_id} className="p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900 dark:text-white text-[15px]">{user.full_name}</h3>
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-widest ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveUser(user.user_id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-xl hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 transition-all"
                      >
                        Approve
                      </button>
                      <Link
                        to="/admin/users"
                        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center border border-gray-200 dark:border-gray-700"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-4">
            System Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Server className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Server</h3>
                </div>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">Operational</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">API processing normally</p>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Database</h3>
                </div>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">Connected</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">PostgreSQL responding</p>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Activity</h3>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-500 dark:text-gray-400">Total Users</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-gray-100 dark:border-gray-800 pt-2">
                  <span className="font-medium text-gray-500 dark:text-gray-400">Appointments</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.totalAppointments.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
import { useState, useEffect } from "react";
import {
  Heart,
  Calendar,
  Users,
  Pill,
  Activity,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  TrendingUp,
  User,
} from "lucide-react";
import api, { handleApiError } from "../../services/api";

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const ProfileCompletionBar = ({ percentage }) => {
  const getColor = () => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900 dark:text-white">
            Profile Completion
          </span>
        </div>
        <span className={`text-lg font-bold ${
          percentage >= 80 ? "text-green-600" : percentage >= 50 ? "text-yellow-600" : "text-red-600"
        }`}>
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {percentage < 100 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Complete your profile for better healthcare recommendations
        </p>
      )}
    </div>
  );
};

const PatientHealthSummary = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/patient-stats");
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                </div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Profile Completion */}
      <ProfileCompletionBar percentage={stats.profileCompletion} />

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Upcoming Appointments"
          value={stats.upcomingAppointments}
          subtitle="Scheduled visits"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Completed Visits"
          value={stats.completedAppointments}
          subtitle={`${stats.totalAppointments} total`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Active Prescriptions"
          value={stats.activePrescriptions}
          subtitle={`${stats.totalPrescriptions} total`}
          icon={Pill}
          color="purple"
        />
        <StatCard
          title="Doctors Consulted"
          value={stats.doctorsConsulted}
          subtitle="Healthcare providers"
          icon={Users}
          color="pink"
        />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Total Healthcare Spent"
          value={`Rs. ${stats.totalSpent?.toLocaleString() || 0}`}
          subtitle="All time expenses"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Pending Payments"
          value={`Rs. ${stats.pendingPayments?.toLocaleString() || 0}`}
          subtitle="Awaiting payment"
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Status Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Appointment History
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {stats.statusBreakdown && Object.entries(stats.statusBreakdown).map(([status, count]) => {
            const statusConfig = {
              requested: { label: "Requested", color: "bg-gray-500" },
              assigned: { label: "Assigned", color: "bg-blue-500" },
              confirmed: { label: "Confirmed", color: "bg-green-500" },
              completed: { label: "Completed", color: "bg-purple-500" },
              cancelled: { label: "Cancelled", color: "bg-red-500" },
              no_show: { label: "Missed", color: "bg-orange-500" },
            };
            const config = statusConfig[status] || { label: status, color: "bg-gray-500" };

            return (
              <div key={status} className="text-center">
                <div className={`w-full h-2 ${config.color} rounded-full mb-2`} />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {count}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {config.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {stats.recentActivity && stats.recentActivity.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => {
              const statusColors = {
                requested: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
                assigned: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                completed: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
                cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                no_show: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
              };

              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      Appointment on {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[activity.status]}`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Healthcare Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Health Summary</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="opacity-90">Pharmacies Visited</span>
              <span className="font-semibold">{stats.pharmaciesVisited}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-90">This Month Visits</span>
              <span className="font-semibold">{stats.thisMonthAppointments}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-90">Prescriptions Completed</span>
              <span className="font-semibold">{stats.completedPrescriptions}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Quick Stats</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="opacity-90">Total Appointments</span>
              <span className="font-semibold">{stats.totalAppointments}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-90">Total Prescriptions</span>
              <span className="font-semibold">{stats.totalPrescriptions}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-90">Completion Rate</span>
              <span className="font-semibold">
                {stats.totalAppointments > 0
                  ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHealthSummary;

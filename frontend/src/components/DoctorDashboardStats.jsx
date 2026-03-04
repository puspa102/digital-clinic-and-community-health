import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
} from "lucide-react";
import api, { handleApiError } from "../../services/api";

const DoctorStatsCard = ({ title, value, subtitle, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    cyan: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
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
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              trend >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              <TrendingUp className={`w-3 h-3 ${trend < 0 ? "rotate-180" : ""}`} />
              <span>{Math.abs(trend)}% from last week</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const DoctorDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/doctors/dashboard-stats");
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
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DoctorStatsCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          subtitle={`${stats.completedToday} completed, ${stats.pendingToday} pending`}
          icon={Calendar}
          color="blue"
        />
        <DoctorStatsCard
          title="Total Patients"
          value={stats.totalPatients}
          subtitle="Unique patients treated"
          icon={Users}
          color="green"
        />
        <DoctorStatsCard
          title="Pending Appointments"
          value={stats.pendingAppointments}
          subtitle="Awaiting consultation"
          icon={Clock}
          color="orange"
        />
        <DoctorStatsCard
          title="Completed"
          value={stats.completedAppointments}
          subtitle="Total consultations done"
          icon={CheckCircle}
          color="purple"
        />
      </div>

      {/* Earnings Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DoctorStatsCard
          title="This Week Earnings"
          value={`Rs. ${stats.thisWeekEarnings?.toLocaleString() || 0}`}
          subtitle={`${stats.thisWeekCompleted} consultations`}
          icon={DollarSign}
          color="cyan"
        />
        <DoctorStatsCard
          title="This Month Earnings"
          value={`Rs. ${stats.thisMonthEarnings?.toLocaleString() || 0}`}
          subtitle={`${stats.thisMonthCompleted} consultations`}
          icon={TrendingUp}
          color="green"
        />
        <DoctorStatsCard
          title="Total Earnings"
          value={`Rs. ${stats.totalEarnings?.toLocaleString() || 0}`}
          subtitle="All time earnings"
          icon={BarChart3}
          color="purple"
        />
      </div>

      {/* Status Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Appointment Status Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {stats.statusBreakdown && Object.entries(stats.statusBreakdown).map(([status, count]) => {
            const statusConfig = {
              requested: { label: "Requested", color: "bg-gray-500" },
              assigned: { label: "Assigned", color: "bg-blue-500" },
              confirmed: { label: "Confirmed", color: "bg-green-500" },
              completed: { label: "Completed", color: "bg-purple-500" },
              cancelled: { label: "Cancelled", color: "bg-red-500" },
              no_show: { label: "No Show", color: "bg-orange-500" },
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

      {/* Period Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            This Week Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Appointments</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.thisWeekAppointments}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Completed</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {stats.thisWeekCompleted}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Earnings</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Rs. {stats.thisWeekEarnings?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            This Month Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Appointments</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.thisMonthAppointments}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Completed</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {stats.thisMonthCompleted}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Earnings</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Rs. {stats.thisMonthEarnings?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardStats;

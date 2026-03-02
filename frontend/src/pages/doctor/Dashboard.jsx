import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import api, { handleApiError } from "../../services/api";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    completedToday: 0,
    totalPatients: 0,
    pendingAppointments: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch doctor's appointments
      const appointmentsResponse = await api.get("/appointments/doctor/me");
      const allAppointments = appointmentsResponse.data.data || [];

      // Calculate today's date
      const today = new Date().toISOString().split("T")[0];

      // Filter today's appointments
      const todayAppts = allAppointments.filter(
        (apt) => apt.appointment_date === today,
      );

      // Calculate completed today
      const completedToday = todayAppts.filter(
        (apt) => apt.status === "completed",
      ).length;

      // Calculate pending appointments
      const pendingAppts = allAppointments.filter(
        (apt) => apt.status === "assigned" || apt.status === "confirmed",
      ).length;

      // Get unique patients
      const uniquePatients = new Set(
        allAppointments.map((apt) => apt.patient_id),
      );

      // Calculate total earnings (paid appointments)
      const totalEarnings = allAppointments
        .filter((apt) => apt.payment_status === "paid")
        .reduce((sum, apt) => sum + (apt.payment_amount || 0), 0);

      // Calculate this month's earnings
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthEarnings = allAppointments
        .filter((apt) => {
          const aptDate = new Date(apt.appointment_date);
          return (
            aptDate.getMonth() === currentMonth &&
            aptDate.getFullYear() === currentYear &&
            apt.payment_status === "paid"
          );
        })
        .reduce((sum, apt) => sum + (apt.payment_amount || 0), 0);

      setStats({
        todayAppointments: todayAppts.length,
        completedToday: completedToday,
        totalPatients: uniquePatients.size,
        pendingAppointments: pendingAppts,
        totalEarnings: totalEarnings,
        thisMonthEarnings: thisMonthEarnings,
      });

      // Set recent appointments (upcoming and today)
      const upcomingAppointments = allAppointments
        .filter(
          (apt) =>
            apt.status !== "completed" &&
            apt.status !== "cancelled" &&
            apt.status !== "no_show",
        )
        .sort((a, b) => {
          const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
          const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
          return dateA - dateB;
        })
        .slice(0, 5);

      setAppointments(upcomingAppointments);

      // Get recent patients (from recent completed appointments)
      const completedAppointments = allAppointments
        .filter((apt) => apt.status === "completed")
        .sort(
          (a, b) => new Date(b.appointment_date) - new Date(a.appointment_date),
        )
        .slice(0, 5);

      setRecentPatients(completedAppointments);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      requested: { label: "Requested", class: "bg-gray-100 text-gray-700" },
      assigned: { label: "Assigned", class: "bg-blue-100 text-blue-700" },
      confirmed: { label: "Confirmed", class: "bg-green-100 text-green-700" },
      completed: { label: "Completed", class: "bg-purple-100 text-purple-700" },
      cancelled: { label: "Cancelled", class: "bg-red-100 text-red-700" },
      no_show: { label: "No Show", class: "bg-orange-100 text-orange-700" },
    };
    const config = statusConfig[status] || statusConfig.requested;
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}
      >
        {config.label}
      </span>
    );
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Doctor Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Today's Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Today's Appointments
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {stats.todayAppointments}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              {stats.completedToday} completed
            </div>
          </div>

          {/* Total Patients */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Patients
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {stats.totalPatients}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              {stats.pendingAppointments} pending
            </div>
          </div>

          {/* This Month Earnings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This Month
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  Rs. {stats.thisMonthEarnings.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
              Total: Rs. {stats.totalEarnings.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Upcoming Appointments
                </h2>
                <Link
                  to="/doctor/appointments"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {appointments.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming appointments</p>
                </div>
              ) : (
                appointments.map((appointment) => (
                  <div
                    key={appointment.appointment_id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {appointment.Patient?.full_name
                              ?.charAt(0)
                              ?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {appointment.Patient?.full_name ||
                                "Unknown Patient"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(appointment.appointment_date)} at{" "}
                              {formatTime(appointment.appointment_time)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                    {appointment.reason && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 ml-13">
                        {appointment.reason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Patients */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recent Patients
                </h2>
                <Link
                  to="/doctor/patients"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentPatients.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recent patients</p>
                </div>
              ) : (
                recentPatients.map((appointment) => (
                  <div
                    key={appointment.appointment_id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {appointment.Patient?.full_name
                            ?.charAt(0)
                            ?.toUpperCase() || "P"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {appointment.Patient?.full_name ||
                              "Unknown Patient"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Last visit:{" "}
                            {formatDate(appointment.appointment_date)}
                          </p>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/doctor/appointments"
              className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Appointments
              </span>
            </Link>
            <Link
              to="/doctor/patients"
              className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Patients
              </span>
            </Link>
            <Link
              to="/doctor/schedule"
              className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Clock className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Schedule
              </span>
            </Link>
            <Link
              to="/doctor/profile"
              className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <Users className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Profile
              </span>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

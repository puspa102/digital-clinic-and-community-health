import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import StatCard from "../../components/dashboard/StatCard";
import QuickActions from "../../components/dashboard/QuickActions";
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Loader2,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { appointmentAPI } from "../../services/api";

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

      // Fetch all doctor appointments across pages so dashboard totals are accurate.
      const allAppointments = [];
      let page = 1;
      const limit = 100;
      let totalPages = 1;

      do {
        const response = await appointmentAPI.getMyDoctorAppointments({
          page,
          limit,
        });
        const pageData = response.data || [];
        allAppointments.push(...pageData);
        totalPages = response.pagination?.totalPages || 1;
        page += 1;
      } while (page <= totalPages);

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
        allAppointments.map(
          (apt) => apt.patient_id || apt.Patient?.user_id,
        ).filter(Boolean),
      );

      // Calculate total earnings (paid appointments)
      const totalEarnings = allAppointments
        .filter((apt) => apt.payment_status === "paid")
        .reduce((sum, apt) => sum + (Number(apt.payment_amount) || 0), 0);

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
        .reduce((sum, apt) => sum + (Number(apt.payment_amount) || 0), 0);

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
      requested: { label: "Requested", class: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700" },
      assigned: { label: "Assigned", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800" },
      confirmed: { label: "Confirmed", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800" },
      completed: { label: "Completed", class: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800" },
      cancelled: { label: "Cancelled", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800" },
      no_show: { label: "No Show", class: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800" },
    };
    const config = statusConfig[status] || statusConfig.requested;
    return (
      <span
        className={`px-3 py-1 text-[11px] font-black rounded-full uppercase tracking-widest ${config.class}`}
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

  const statCards = [
    { label: "Today's Appts", value: stats.todayAppointments, icon: CalendarDays, colorClass: "bg-[#0ea5e9] dark:bg-[#0284c7]" },
    { label: "Total Patients", value: stats.totalPatients, icon: Users, colorClass: "bg-[#8b5cf6] dark:bg-[#7c3aed]" },
    { label: "This Month", value: `Rs. ${stats.thisMonthEarnings.toFixed(2)}`, icon: DollarSign, colorClass: "bg-[#10b981] dark:bg-[#059669]" },
  ];

  const quickActionsList = [
    { label: "Appointments", icon: Calendar, href: "/doctor/appointments", accent: false },
    { label: "Patients", icon: Users, href: "/doctor/patients", accent: false },
    { label: "Schedule", icon: Clock, href: "/doctor/schedule", accent: false },
    { label: "Profile", icon: Users, href: "/doctor/profile", accent: true },
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
              Doctor Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              Welcome back! Here's what's happening today.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {statCards.map((stat, i) => (
            <StatCard key={i} {...stat} loading={loading} />
          ))}
        </div>

        {/* Quick Actions */}
        <QuickActions actions={quickActionsList} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                Upcoming Appointments
              </h2>
              <Link
                to="/doctor/appointments"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 overflow-hidden shadow-lg">
              {appointments.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-700">
                    <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">No upcoming appointments</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.appointment_id}
                      className="p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-300"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                            <span className="font-bold text-lg">
                              {appointment.Patient?.full_name?.charAt(0)?.toUpperCase() || "P"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white text-[15px] truncate">
                              {appointment.Patient?.full_name || "Unknown Patient"}
                            </p>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                      {appointment.reason && (
                        <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                          <span className="font-bold text-gray-900 dark:text-gray-200">Reason:</span> {appointment.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Patients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                Recent Patients
              </h2>
              <Link
                to="/doctor/patients"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 overflow-hidden shadow-lg">
              {recentPatients.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-700">
                    <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">No recent patients</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                  {recentPatients.map((appointment) => (
                    <div
                      key={appointment.appointment_id}
                      className="p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-300"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
                            <span className="font-bold text-lg">
                              {appointment.Patient?.full_name?.charAt(0)?.toUpperCase() || "P"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white text-[15px] truncate">
                              {appointment.Patient?.full_name || "Unknown Patient"}
                            </p>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                              Last visit: {formatDate(appointment.appointment_date)}
                            </p>
                          </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-xl text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;


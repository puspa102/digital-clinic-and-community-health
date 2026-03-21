import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import StatCard from "../../components/dashboard/StatCard";
import QuickActions from "../../components/dashboard/QuickActions";
import NextAppointment from "../../components/dashboard/NextAppointment";
import PendingPayments from "../../components/dashboard/PendingPayments";

import api, {
  appointmentAPI,
  formatDate,
  formatTime,
  handleApiError,
  APPOINTMENT_STATUS,
} from "../../services/api";

import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Wallet,
  PlusCircle,
  FileText,
  Siren,
  Info,
  Loader2,
  XCircle,
  Calendar,
} from "lucide-react";

const healthTips = [
  "Drinking at least 8 glasses of water a day helps maintain your blood pressure and kidney function.",
  "A 30-minute walk every day can reduce the risk of heart disease by up to 35%.",
  "Getting 7-8 hours of sleep each night improves your immune system significantly.",
  "Regular hand washing is the simplest way to prevent the spread of infections.",
  "Eating a balanced breakfast boosts your metabolism and concentration throughout the day.",
  "Taking short breaks every hour during work reduces eye strain and back pain.",
];

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [dailyTip] = useState(() => {
    const dayIndex = new Date().getDate() % healthTips.length;
    return healthTips[dayIndex];
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getMyAppointments({ limit: 50 });
      setAppointments(response.data || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Compute stats
  const upcomingAppointments = appointments.filter((a) =>
    [
      APPOINTMENT_STATUS.REQUESTED,
      APPOINTMENT_STATUS.ASSIGNED,
      APPOINTMENT_STATUS.CONFIRMED,
    ].includes(a.status),
  );
  const nonConfirmedUpcoming = appointments.filter((a) =>
    [APPOINTMENT_STATUS.REQUESTED, APPOINTMENT_STATUS.ASSIGNED].includes(
      a.status,
    ),
  );
  const confirmedAppointments = appointments.filter(
    (a) => a.status === APPOINTMENT_STATUS.CONFIRMED,
  );
  const completedCount = appointments.filter(
    (a) => a.status === APPOINTMENT_STATUS.COMPLETED,
  ).length;
  const pendingPaymentsList = confirmedAppointments.filter(
    (a) => a.payment_status !== "paid" && a.payment_amount > 0,
  );
  const totalPendingAmount = pendingPaymentsList.reduce(
    (sum, a) => sum + (a.payment_amount || 0),
    0,
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getFirstName = () => {
    return user.full_name?.split(" ")[0] || "there";
  };

  const handleCancel = async (appointmentId) => {
    const reason = window.prompt("Reason for cancellation (optional):");
    if (reason === null) return;
    try {
      setCancellingId(appointmentId);
      await appointmentAPI.cancelAppointment(appointmentId, reason);
      fetchDashboardData();
    } catch (err) {
      const errorInfo = handleApiError(err);
      alert(errorInfo.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handlePay = async (appointment, method) => {
    try {
      setPayingId(`${appointment.appointment_id}-${method}`);
      const response = await api.post("/payments/initiate", {
        appointment_id: appointment.appointment_id,
        amount: appointment.payment_amount,
        payment_method: method,
      });

      const { data } = response.data;

      if (data.payment_method === "esewa") {
        const { params, url } = data;
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", url);

        for (const key in params) {
          if (Object.prototype.hasOwnProperty.call(params, key)) {
            const hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);
            form.appendChild(hiddenField);
          }
        }

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      } else if (data.payment_method === "khalti") {
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      alert(errorInfo.message);
    } finally {
      setPayingId(null);
    }
  };

  // Get the nearest confirmed appointment for the main card
  const nextConfirmed = confirmedAppointments.sort(
    (a, b) => new Date(a.appointment_date) - new Date(b.appointment_date),
  )[0];

  // Time until meeting helper
  const getMeetingTimeLabel = (apt) => {
    if (!apt) return null;
    const aptDate = new Date(apt.appointment_date);
    const [hours, minutes] = (
      apt.scheduled_time ||
      apt.appointment_time ||
      "00:00"
    ).split(":");
    aptDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const now = new Date();
    const diffMs = aptDate - now;
    if (diffMs < 0) return null;
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60)
      return `Starts in ${diffMins} min${diffMins !== 1 ? "s" : ""}`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `Starts in ${diffHrs}h ${diffMins % 60}m`;
    return `In ${Math.floor(diffHrs / 24)} day${Math.floor(diffHrs / 24) !== 1 ? "s" : ""}`;
  };

  const stats = [
    {
      label: "Upcoming",
      value: upcomingAppointments.length,
      icon: CalendarDays,
      colorClass: "bg-sky-500 dark:bg-sky-600",
    },
    {
      label: "Confirmed",
      value: confirmedAppointments.length,
      icon: CheckCircle2,
      colorClass: "bg-emerald-500 dark:bg-emerald-600",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: ClipboardCheck,
      colorClass: "bg-violet-500 dark:bg-violet-600",
    },
    {
      label: "Pending Fee",
      value: `Rs. ${totalPendingAmount}`,
      icon: Wallet,
      colorClass: "bg-amber-500 dark:bg-amber-600",
    },
  ];

  const quickActionsList = [
    {
      label: "Book Appointment",
      icon: PlusCircle,
      href: "/patient/pharmacies",
      accent: false,
    },
    {
      label: "My Appointments",
      icon: CalendarDays,
      href: "/patient/appointments",
      accent: false,
    },
    {
      label: "Medical Records",
      icon: FileText,
      href: "/patient/records",
      accent: false,
    },
    { label: "Emergency", icon: Siren, href: "/emergency", accent: true },
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Row: Greeting + Book Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {getGreeting()},{" "}
              <span className="text-teal-600 dark:text-teal-400">
                {getFirstName()}
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              Here's what's happening with your health today.
            </p>
          </div>
          <Link
            to="/patient/pharmacies"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-300 hover:scale-[1.02]"
          >
            <PlusCircle className="w-5 h-5" />
            Book New Appointment
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} loading={loading} />
          ))}
        </div>

        {/* Quick Actions */}
        <QuickActions actions={quickActionsList} />

        {/* Two-Column Layout: Main + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Confirmed Appointment Card */}
            <NextAppointment
              nextConfirmed={nextConfirmed}
              confirmedAppointments={confirmedAppointments}
              getMeetingTimeLabel={getMeetingTimeLabel}
            />

            {/* Upcoming Appointments List */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Upcoming Appointments
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Loading appointments...
                    </p>
                  </div>
                ) : nonConfirmedUpcoming.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {nonConfirmedUpcoming.slice(0, 5).map((apt) => (
                      <div
                        key={apt.appointment_id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                apt.status === APPOINTMENT_STATUS.ASSIGNED
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                  : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                {apt.reason || "General Checkup"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                {apt.Doctor?.User?.full_name
                                  ? `Dr. ${apt.Doctor.User.full_name}`
                                  : apt.Pharmacy?.pharmacy_name ||
                                    "Pending Assignment"}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                  {formatDate(apt.appointment_date)} •{" "}
                                  {formatTime(
                                    apt.scheduled_time || apt.appointment_time,
                                  )}
                                </span>
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    apt.status === APPOINTMENT_STATUS.ASSIGNED
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                  }`}
                                >
                                  {apt.status?.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCancel(apt.appointment_id)}
                            disabled={cancellingId === apt.appointment_id}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 shrink-0"
                            title="Cancel appointment"
                          >
                            {cancellingId === apt.appointment_id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      No upcoming appointments
                    </p>
                    <Link
                      to="/patient/pharmacies"
                      className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 mt-2 inline-block"
                    >
                      Book an appointment
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-8">
            <PendingPayments
              pendingPayments={pendingPaymentsList}
              handlePay={handlePay}
              payingId={payingId}
            />

            {/* Health Tip */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-2xl border border-teal-100 dark:border-teal-800/30 p-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white dark:bg-teal-800/30 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-teal-100 dark:border-teal-700/50">
                  <Info className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="font-bold text-teal-900 dark:text-teal-100 text-sm uppercase tracking-wide">
                    Daily Health Tip
                  </h3>
                  <p className="text-sm text-teal-800/80 dark:text-teal-200/80 mt-1 leading-relaxed">
                    {dailyTip}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Confirmed Appointments (if more than 1) */}
            {confirmedAppointments.length > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
                  Upcoming Confirmed ({confirmedAppointments.length - 1})
                </h3>
                <div className="space-y-3">
                  {confirmedAppointments.slice(1, 4).map((apt) => (
                    <div
                      key={apt.appointment_id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          Dr. {apt.Doctor?.User?.full_name || "Doctor"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(apt.appointment_date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

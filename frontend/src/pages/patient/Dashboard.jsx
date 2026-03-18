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
      colorClass: "bg-[#0ea5e9] dark:bg-[#0284c7]",
    },
    {
      label: "Confirmed",
      value: confirmedAppointments.length,
      icon: CheckCircle2,
      colorClass: "bg-[#10b981] dark:bg-[#059669]",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: ClipboardCheck,
      colorClass: "bg-[#8b5cf6] dark:bg-[#7c3aed]",
    },
    {
      label: "Pending Fee",
      value: `Rs. ${totalPendingAmount}`,
      icon: Wallet,
      colorClass: "bg-[#f59e0b] dark:bg-[#d97706]",
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
              <span className="text-blue-600 dark:text-blue-400">
                {getFirstName()}
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              Here's what's happening with your health today.
            </p>
          </div>
          <Link
            to="/patient/pharmacies"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02]"
          >
            <PlusCircle className="w-5 h-5" />
            Book New Appointment
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
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
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 overflow-hidden shadow-lg">
                {loading ? (
                  <div className="p-10 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Loading appointments...
                    </p>
                  </div>
                ) : nonConfirmedUpcoming.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                    {nonConfirmedUpcoming.slice(0, 5).map((apt) => (
                      <div
                        key={apt.appointment_id}
                        className="p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-300"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                                apt.status === APPOINTMENT_STATUS.ASSIGNED
                                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800"
                                  : "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800"
                              }`}
                            >
                              <Calendar className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 dark:text-white text-[15px] truncate">
                                {apt.reason || "General Checkup"} -{" "}
                                {apt.Doctor?.User?.full_name
                                  ? `Dr. ${apt.Doctor.User.full_name}`
                                  : apt.Pharmacy?.pharmacy_name || "Pending"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  {formatDate(apt.appointment_date)},{" "}
                                  {formatTime(
                                    apt.scheduled_time || apt.appointment_time,
                                  )}
                                </p>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                  {apt.status?.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCancel(apt.appointment_id)}
                            disabled={cancellingId === apt.appointment_id}
                            className="p-2 text-red-500 hover:text-white dark:text-red-400 dark:hover:text-white hover:bg-red-500 border border-transparent hover:border-red-600 rounded-xl transition-all duration-300 shrink-0 hover:shadow-lg hover:shadow-red-500/20"
                            title="Cancel appointment"
                          >
                            {cancellingId === apt.appointment_id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <XCircle className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-700">
                      <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      No upcoming appointments
                    </p>
                    <Link
                      to="/patient/pharmacies"
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 mt-2 inline-block"
                    >
                      Book an appointment now
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
            <div className="bg-gradient-to-br from-[#0ca2e8]/10 to-[#0ca2e8]/5 dark:from-[#0ca2e8]/20 dark:to-[#0ca2e8]/10 rounded-3xl border border-[#0ca2e8]/20 p-6 shadow-sm">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/50 dark:bg-[#0ca2e8]/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/50 dark:border-[#0ca2e8]/30">
                  <Info className="w-5 h-5 text-[#0ca2e8] dark:text-[#38bdf8]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#082f49] dark:text-[#bae6fd] tracking-tight">
                    Today's Health Tip
                  </h3>
                  <p className="text-sm font-medium text-[#0c4a6e]/80 dark:text-[#7dd3fc]/80 mt-2 leading-relaxed">
                    {dailyTip}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Confirmed Appointments (if more than 1) */}
            {confirmedAppointments.length > 1 && (
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 p-6 shadow-lg">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 tracking-tight uppercase">
                  More Confirmed ({confirmedAppointments.length - 1})
                </h3>
                <div className="space-y-4">
                  {confirmedAppointments.slice(1, 4).map((apt) => (
                    <div
                      key={apt.appointment_id}
                      className="flex items-center gap-4 bg-gray-50/50 dark:bg-gray-800/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                          Dr. {apt.Doctor?.User?.full_name || "Doctor"}
                        </p>
                        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
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

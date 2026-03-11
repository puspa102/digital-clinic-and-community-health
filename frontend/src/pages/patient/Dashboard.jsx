import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Layout from "../../components/Layout";
import {
  appointmentAPI,
  paymentAPI,
  getStatusBadgeClass,
  formatDate,
  formatTime,
  handleApiError,
  APPOINTMENT_STATUS,
} from "../../services/api";
import {
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Wallet,
  PlusCircle,
  CalendarDays,
  FileText,
  Siren,
  X,
  Video,
  MapPin,
  Clock,
  Stethoscope,
  Building2,
  QrCode,
  XCircle,
  Info,
  CreditCard,
  Loader2,
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
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrAppointment, setQrAppointment] = useState(null);
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
    [APPOINTMENT_STATUS.REQUESTED, APPOINTMENT_STATUS.ASSIGNED, APPOINTMENT_STATUS.CONFIRMED].includes(a.status)
  );
  const nonConfirmedUpcoming = appointments.filter((a) =>
    [APPOINTMENT_STATUS.REQUESTED, APPOINTMENT_STATUS.ASSIGNED].includes(a.status)
  );
  const confirmedAppointments = appointments.filter((a) => a.status === APPOINTMENT_STATUS.CONFIRMED);
  const completedCount = appointments.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED).length;
  const pendingPayments = confirmedAppointments.filter((a) => a.payment_status !== "paid" && a.payment_amount > 0);
  const totalPendingAmount = pendingPayments.reduce((sum, a) => sum + (a.payment_amount || 0), 0);

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
      const response = await paymentAPI.initiatePayment(appointment.appointment_id, method);
      if (response.data?.payment_url) {
        window.open(response.data.payment_url, "_blank", "noopener,noreferrer");
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
    (a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)
  )[0];

  // Time until meeting helper
  const getMeetingTimeLabel = (apt) => {
    if (!apt) return null;
    const aptDate = new Date(apt.appointment_date);
    const [hours, minutes] = (apt.scheduled_time || apt.appointment_time || "00:00").split(":");
    aptDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const now = new Date();
    const diffMs = aptDate - now;
    if (diffMs < 0) return null;
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) return `Starts in ${diffMins} min${diffMins !== 1 ? "s" : ""}`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `Starts in ${diffHrs}h ${diffMins % 60}m`;
    return `In ${Math.floor(diffHrs / 24)} day${Math.floor(diffHrs / 24) !== 1 ? "s" : ""}`;
  };

  const stats = [
    { label: "UPCOMING", value: upcomingAppointments.length, icon: CalendarDays, cardBg: "bg-sky-600 dark:bg-sky-700" },
    { label: "CONFIRMED", value: confirmedAppointments.length, icon: CheckCircle2, cardBg: "bg-emerald-600 dark:bg-emerald-700" },
    { label: "COMPLETED", value: completedCount, icon: ClipboardCheck, cardBg: "bg-violet-600 dark:bg-violet-700" },
    { label: "PENDING FEE", value: `Rs. ${totalPendingAmount}`, icon: Wallet, cardBg: "bg-amber-500 dark:bg-amber-600" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Row: Greeting + Book Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getGreeting()}, {getFirstName()}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Here is what's happening with your health today.
            </p>
          </div>
          <Link
            to="/patient/pharmacies"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Book New Appointment
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className={`${stat.cardBg} rounded-xl p-5 shadow-md`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold tracking-wider text-white/70 uppercase">{stat.label}</span>
                  <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">
                  {loading ? "..." : stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Book Appointment", icon: PlusCircle, href: "/patient/pharmacies", accent: false },
              { label: "My Appointments", icon: CalendarDays, href: "/patient/appointments", accent: false },
              { label: "Medical Records", icon: FileText, href: "/patient/records", accent: false },
              { label: "Emergency", icon: Siren, href: "/emergency", accent: true },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <Link
                  key={i}
                  to={action.href}
                  className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-200 group ${
                    action.accent
                      ? "bg-linear-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-100 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                      : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    action.accent
                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 group-hover:bg-red-500 group-hover:text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-teal-600 group-hover:text-white"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-medium ${action.accent ? "text-red-700 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Two-Column Layout: Main + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Confirmed Appointment Card */}
            {nextConfirmed && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmed Appointment</h2>
                  {confirmedAppointments.length > 1 && (
                    <Link to="/patient/appointments" className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 font-medium">
                      View All
                    </Link>
                  )}
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Doctor Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center shrink-0">
                          <Stethoscope className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Dr. {nextConfirmed.Doctor?.User?.full_name || "Doctor"}
                            </h3>
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 uppercase tracking-wide">
                              Confirmed
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {nextConfirmed.Doctor?.specialization || "Specialist"} • {nextConfirmed.Doctor?.hospital_name || ""}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {nextConfirmed.Pharmacy?.pharmacy_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Wallet className="w-3.5 h-3.5" />
                              Fee: Rs. {nextConfirmed.payment_amount || 0}{" "}
                              <span className={`text-xs font-medium ${nextConfirmed.payment_status === "paid" ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                                ({nextConfirmed.payment_status === "paid" ? "Paid" : "Pending"})
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* QR Code */}
                      {nextConfirmed.qr_token && (
                        <button
                          onClick={() => { setQrAppointment(nextConfirmed); setShowQrModal(true); }}
                          className="flex flex-col items-center gap-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0"
                          title="View QR Code"
                        >
                          <QRCodeSVG
                            value={JSON.stringify({ type: "appointment", token: nextConfirmed.qr_token, id: nextConfirmed.appointment_id })}
                            size={64}
                            level="L"
                          />
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">Appt ID #{nextConfirmed.appointment_id}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Meeting / Notes Bar */}
                  {(nextConfirmed.consultation_type === "online" && nextConfirmed.meeting_link) || nextConfirmed.doctor_notes ? (
                    <div className="px-5 py-3 bg-teal-50 dark:bg-teal-900/20 border-t border-teal-100 dark:border-teal-800/30">
                      {nextConfirmed.consultation_type === "online" && nextConfirmed.meeting_link && (
                        <a
                          href={nextConfirmed.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 dark:text-teal-400 hover:text-teal-800"
                        >
                          <Video className="w-4 h-4" />
                          Join Video Meeting
                          {getMeetingTimeLabel(nextConfirmed) && (
                            <span className="text-teal-500 dark:text-teal-300 font-normal">
                              ({getMeetingTimeLabel(nextConfirmed)})
                            </span>
                          )}
                        </a>
                      )}
                      {nextConfirmed.doctor_notes && (
                        <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                          <span className="font-medium">Note:</span> {nextConfirmed.doctor_notes}
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Upcoming Appointments */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Upcoming Appointments</h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-7 h-7 animate-spin text-teal-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading appointments...</p>
                  </div>
                ) : nonConfirmedUpcoming.length > 0 ? (
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {nonConfirmedUpcoming.slice(0, 5).map((apt) => (
                      <div key={apt.appointment_id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              apt.status === APPOINTMENT_STATUS.ASSIGNED
                                ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                            }`}>
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {apt.reason || "General Checkup"} - {apt.Doctor?.User?.full_name ? `Dr. ${apt.Doctor.User.full_name}` : apt.Pharmacy?.pharmacy_name || "Pending"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Requested: {formatDate(apt.appointment_date)}, {formatTime(apt.scheduled_time || apt.appointment_time)} • {" "}
                                <span className="capitalize">{apt.status?.replace("_", " ")}</span>
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCancel(apt.appointment_id)}
                            disabled={cancellingId === apt.appointment_id}
                            className="p-1.5 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors shrink-0"
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
                  <div className="p-8 text-center">
                    <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming appointments</p>
                    <Link to="/patient/pharmacies" className="text-sm text-teal-600 dark:text-teal-400 hover:underline mt-2 inline-block">
                      Book an appointment
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">
            {/* Pending Payments Card */}
            {pendingPayments.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Payments</h3>
                  {pendingPayments.slice(0, 2).map((apt) => (
                    <div key={apt.appointment_id} className="mb-4 last:mb-0">
                      <div className="flex flex-col items-center text-center mb-3">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-2">
                          <Wallet className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">Rs. {apt.payment_amount}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          Due for Dr. {apt.Doctor?.User?.full_name || "Doctor"}
                        </p>
                      </div>

                      {/* Payment Gateway Section */}
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center mb-3">
                          Pay via Secure Gateway
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handlePay(apt, "esewa")}
                            disabled={payingId === `${apt.appointment_id}-esewa`}
                            className="flex flex-col items-center gap-1 px-3 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg transition-colors"
                          >
                            {payingId === `${apt.appointment_id}-esewa` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <span className="text-sm font-bold">eSewa</span>
                            )}
                            <span className="text-[10px] opacity-80">Pay with eSewa</span>
                          </button>
                          <button
                            onClick={() => handlePay(apt, "khalti")}
                            disabled={payingId === `${apt.appointment_id}-khalti`}
                            className="flex flex-col items-center gap-1 px-3 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg transition-colors"
                          >
                            {payingId === `${apt.appointment_id}-khalti` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <span className="text-sm font-bold">Khalti</span>
                            )}
                            <span className="text-[10px] opacity-80">Pay with Khalti</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingPayments.length > 2 && (
                    <Link to="/patient/appointments" className="block text-center text-sm text-teal-600 dark:text-teal-400 hover:underline mt-3">
                      +{pendingPayments.length - 2} more pending
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 text-center">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500 dark:text-green-400" />
                </div>
                <p className="font-medium text-gray-900 dark:text-white">All Paid Up!</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">No pending payments</p>
              </div>
            )}

            {/* Health Tip */}
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800/30 p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-teal-100 dark:bg-teal-800/50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-teal-900 dark:text-teal-300 text-sm">Health Tip</h3>
                  <p className="text-sm text-teal-700 dark:text-teal-400 mt-1 leading-relaxed">
                    {dailyTip}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Confirmed Appointments (if more than 1) */}
            {confirmedAppointments.length > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  More Confirmed ({confirmedAppointments.length - 1})
                </h3>
                <div className="space-y-3">
                  {confirmedAppointments.slice(1, 4).map((apt) => (
                    <div key={apt.appointment_id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
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

      {/* QR Code Modal */}
      {showQrModal && qrAppointment && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { setShowQrModal(false); setQrAppointment(null); }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Appointment QR Code</h2>
              <button
                onClick={() => { setShowQrModal(false); setQrAppointment(null); }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl border-2 border-gray-100 mb-4">
                <QRCodeSVG
                  value={JSON.stringify({
                    type: "appointment",
                    token: qrAppointment.qr_token,
                    id: qrAppointment.appointment_id,
                    date: qrAppointment.appointment_date,
                    time: qrAppointment.scheduled_time || qrAppointment.appointment_time,
                    consultation: qrAppointment.consultation_type,
                    fee: qrAppointment.payment_amount,
                  })}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
              <div className="w-full space-y-2 text-sm">
                {[
                  { label: "Pharmacy", value: qrAppointment.Pharmacy?.pharmacy_name },
                  { label: "Doctor", value: qrAppointment.Doctor?.User?.full_name ? `Dr. ${qrAppointment.Doctor.User.full_name}` : "—" },
                  { label: "Date", value: formatDate(qrAppointment.appointment_date) },
                  { label: "Time", value: formatTime(qrAppointment.scheduled_time || qrAppointment.appointment_time) },
                  { label: "Type", value: qrAppointment.consultation_type || "—" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{item.value}</span>
                  </div>
                ))}
                {qrAppointment.payment_amount > 0 && (
                  <div className="flex justify-between py-2 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 mt-2">
                    <span className="text-green-700 dark:text-green-400 font-medium">Doctor Fee</span>
                    <span className="font-bold text-green-800 dark:text-green-300 text-lg">Rs. {qrAppointment.payment_amount}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
                Show this QR code at the pharmacy for verification
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;

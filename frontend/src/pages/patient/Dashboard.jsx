import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Layout from "../../components/Layout";
import {
  appointmentAPI,
  getStatusBadgeClass,
  formatDate,
  formatTime,
  APPOINTMENT_STATUS,
} from "../../services/api";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrAppointment, setQrAppointment] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

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

  // Compute stats from real data
  const upcomingAppointments = appointments.filter((a) =>
    [APPOINTMENT_STATUS.REQUESTED, APPOINTMENT_STATUS.ASSIGNED, APPOINTMENT_STATUS.CONFIRMED].includes(a.status)
  );
  const confirmedAppointments = appointments.filter((a) => a.status === APPOINTMENT_STATUS.CONFIRMED);
  const completedCount = appointments.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED).length;
  const pendingPayments = confirmedAppointments.filter((a) => a.payment_status !== "paid" && a.payment_amount > 0);
  const totalPendingAmount = pendingPayments.reduce((sum, a) => sum + (a.payment_amount || 0), 0);

  const stats = [
    {
      label: "Upcoming",
      value: upcomingAppointments.length,
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      color: "blue",
    },
    {
      label: "Confirmed",
      value: confirmedAppointments.length,
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      color: "green",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      color: "purple",
    },
    {
      label: "Pending Fee",
      value: `Rs.${totalPendingAmount}`,
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      color: "orange",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  const quickActions = [
    {
      label: "Book Appointment",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="12" y1="14" x2="12" y2="18" />
          <line x1="10" y1="16" x2="14" y2="16" />
        </svg>
      ),
      href: "/patient/pharmacies",
    },
    {
      label: "My Appointments",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      href: "/patient/appointments",
    },
    {
      label: "Medical Records",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
      href: "/patient/records",
    },
    {
      label: "Emergency",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      href: "/emergency",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user.full_name || "Patient"}!</h1>
          <p className="text-blue-100">
            Here's an overview of your health dashboard. Stay healthy!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{loading ? "..." : stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md hover:border-blue-500 border-2 border-transparent transition-all duration-200 group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {action.icon}
                </div>
                <span className="font-medium text-gray-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Confirmed Appointments with Fee & QR */}
        {confirmedAppointments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Confirmed Appointments
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Doctor fee & QR code available)
                </span>
              </h2>
              <Link to="/patient/appointments" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {confirmedAppointments.map((appointment) => (
                <div key={appointment.appointment_id} className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Date Box */}
                      <div className="flex-shrink-0 w-14 h-14 bg-green-50 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xs font-medium text-green-600 uppercase">
                          {new Date(appointment.appointment_date).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-lg font-bold text-green-700">
                          {new Date(appointment.appointment_date).getDate()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">
                            {appointment.Doctor?.User?.full_name || "Doctor"}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                            appointment.consultation_type === "online"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-teal-100 text-teal-700"
                          }`}>
                            {appointment.consultation_type === "online" ? "🎥 Online" : "🏥 Physical"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {appointment.Pharmacy?.pharmacy_name} •{" "}
                          {formatTime(appointment.scheduled_time || appointment.appointment_time)}
                        </p>
                        {appointment.doctor_notes && (
                          <p className="text-sm text-blue-600 mt-1">
                            📝 {appointment.doctor_notes}
                          </p>
                        )}
                        {/* Meeting Link */}
                        {appointment.consultation_type === "online" && appointment.meeting_link && (
                          <a
                            href={appointment.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mt-1"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
                            </svg>
                            Join Meeting
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right: Fee + QR */}
                    <div className="flex items-center gap-3">
                      {/* Doctor Fee */}
                      {appointment.payment_amount > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Doctor Fee</p>
                          <p className="text-xl font-bold text-green-700">Rs. {appointment.payment_amount}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            appointment.payment_status === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {appointment.payment_status === "paid" ? "Paid" : "Pending"}
                          </span>
                        </div>
                      )}

                      {/* QR Code Button */}
                      {appointment.qr_token && (
                        <button
                          onClick={() => { setQrAppointment(appointment); setShowQrModal(true); }}
                          className="flex flex-col items-center gap-1 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-colors"
                        >
                          <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                          </svg>
                          <span className="text-xs font-medium text-blue-700">QR Code</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Appointments (not yet confirmed) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link to="/patient/appointments" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {upcomingAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.appointment_id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                          {appointment.Doctor?.User?.full_name?.charAt(0) ||
                            appointment.Pharmacy?.pharmacy_name?.charAt(0) || "A"}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {appointment.Doctor?.User?.full_name || appointment.Pharmacy?.pharmacy_name || "Pending"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {appointment.Doctor?.specialization || "Doctor not yet assigned"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatDate(appointment.appointment_date)}</p>
                        <p className="text-sm text-gray-500">{formatTime(appointment.scheduled_time || appointment.appointment_time)}</p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(
                          appointment.status
                        )}`}
                      >
                        {appointment.status?.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-gray-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p>No upcoming appointments</p>
                <Link to="/patient/pharmacies" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                  Book an appointment
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Pending Payments Section */}
        {pendingPayments.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Payments</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {pendingPayments.map((appointment) => (
                  <div key={appointment.appointment_id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Dr. {appointment.Doctor?.User?.full_name || "Doctor"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(appointment.appointment_date)} • {appointment.Pharmacy?.pharmacy_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-700 text-lg">Rs. {appointment.payment_amount}</p>
                      <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">Pending</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 bg-orange-50 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-700">Total Pending</span>
                  <span className="text-lg font-bold text-orange-800">Rs. {totalPendingAmount}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQrModal && qrAppointment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Appointment QR Code</h2>
              <button
                onClick={() => { setShowQrModal(false); setQrAppointment(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
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
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Pharmacy</span>
                  <span className="font-medium text-gray-900">{qrAppointment.Pharmacy?.pharmacy_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Doctor</span>
                  <span className="font-medium text-gray-900">{qrAppointment.Doctor?.User?.full_name || "—"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-900">{formatDate(qrAppointment.appointment_date)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium text-gray-900">{formatTime(qrAppointment.scheduled_time || qrAppointment.appointment_time)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Type</span>
                  <span className={`font-medium capitalize ${
                    qrAppointment.consultation_type === "online" ? "text-purple-700" : "text-teal-700"
                  }`}>
                    {qrAppointment.consultation_type || "—"}
                  </span>
                </div>
                {qrAppointment.payment_amount > 0 && (
                  <div className="flex justify-between py-2 bg-green-50 rounded-lg px-3 mt-2">
                    <span className="text-green-700 font-medium">Doctor Fee</span>
                    <span className="font-bold text-green-800 text-lg">Rs. {qrAppointment.payment_amount}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">
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

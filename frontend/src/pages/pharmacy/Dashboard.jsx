import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  pharmacyAPI,
  getStatusBadgeClass,
  formatDate,
  formatTime,
  handleApiError,
  APPOINTMENT_STATUS,
} from "../../services/api";

const Dashboard = () => {
  const [pharmacy, setPharmacy] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [pharmacyRes, appointmentsRes, doctorsRes] = await Promise.all([
        pharmacyAPI.getMyPharmacy().catch(() => null),
        pharmacyAPI.getMyAppointments({ limit: 5 }).catch(() => ({ data: [] })),
        pharmacyAPI.getMyDoctors({ limit: 10 }).catch(() => ({ data: [] })),
      ]);
      
      if (pharmacyRes?.data) {
        setPharmacy(pharmacyRes.data);
      }
      setAppointments(appointmentsRes?.data || []);
      setDoctors(doctorsRes?.data || []);
      setError(null);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    pendingAssignment: appointments.filter((a) => a.status === APPOINTMENT_STATUS.REQUESTED).length,
    assigned: appointments.filter((a) => a.status === APPOINTMENT_STATUS.ASSIGNED).length,
    confirmed: appointments.filter((a) => a.status === APPOINTMENT_STATUS.CONFIRMED).length,
    totalDoctors: doctors.length,
  };

  const quickActions = [
    {
      label: "Manage Appointments",
      description: "View and assign doctors",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      href: "/pharmacy/appointments",
      color: "orange",
    },
    {
      label: "My Doctors",
      description: "View and add doctors",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      href: "/pharmacy/doctors",
      color: "blue",
    },
    {
      label: "Add Doctor",
      description: "Register a new doctor",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      ),
      href: "/pharmacy/doctors/add",
      color: "green",
    },
    {
      label: "Prescriptions",
      description: "Manage prescriptions",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="2" />
          <path d="M9 14h.01" />
          <path d="M13 14h2" />
          <path d="M9 17h.01" />
          <path d="M13 17h2" />
        </svg>
      ),
      href: "/pharmacy/prescriptions",
      color: "purple",
    },
  ];

  const colorClasses = {
    orange: {
      bg: "bg-orange-100",
      text: "text-orange-600",
      hover: "hover:bg-orange-600 hover:text-white",
    },
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      hover: "hover:bg-blue-600 hover:text-white",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
      hover: "hover:bg-green-600 hover:text-white",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      hover: "hover:bg-purple-600 hover:text-white",
    },
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            {pharmacy?.pharmacy_name || "Pharmacy Dashboard"}
          </h1>
          <p className="text-orange-100">
            {stats.pendingAssignment > 0
              ? `You have ${stats.pendingAssignment} appointment${stats.pendingAssignment > 1 ? "s" : ""} waiting for doctor assignment.`
              : "All appointments are up to date!"}
          </p>
          {pharmacy?.address && (
            <p className="text-orange-200 text-sm mt-2">
              📍 {pharmacy.address}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-yellow-500">
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingAssignment}</p>
            <p className="text-sm text-gray-500">Pending Assignment</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
            <p className="text-2xl font-bold text-blue-600">{stats.assigned}</p>
            <p className="text-sm text-gray-500">Awaiting Confirmation</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-sm text-gray-500">Confirmed</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
            <p className="text-2xl font-bold text-purple-600">{stats.totalDoctors}</p>
            <p className="text-sm text-gray-500">Total Doctors</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md border-2 border-transparent hover:border-orange-500 transition-all duration-200 group"
              >
                <div
                  className={`w-12 h-12 rounded-full ${colorClasses[action.color].bg} ${colorClasses[action.color].text} flex items-center justify-center mb-3 group-hover:bg-orange-600 group-hover:text-white transition-colors`}
                >
                  {action.icon}
                </div>
                <span className="font-medium text-gray-700 text-center">{action.label}</span>
                <span className="text-xs text-gray-400 text-center mt-1">{action.description}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Appointments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
              <Link to="/pharmacy/appointments" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                View All →
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {appointments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-gray-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <p>No appointments yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {appointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.appointment_id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                            {appointment.Patient?.full_name?.charAt(0)?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.Patient?.full_name || "Patient"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(appointment.appointment_date)} • {formatTime(appointment.appointment_time)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(
                            appointment.status
                          )}`}
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

          {/* My Doctors */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Doctors</h2>
              <Link to="/pharmacy/doctors" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                View All →
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {doctors.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-gray-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <p>No doctors yet</p>
                  <Link to="/pharmacy/doctors/add" className="text-orange-600 hover:underline text-sm mt-2 inline-block">
                    Add your first doctor
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {doctors.slice(0, 5).map((doctor) => (
                    <div key={doctor.doctor_id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                            {doctor.User?.full_name?.charAt(0)?.toUpperCase() || "D"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {doctor.User?.full_name}
                            </p>
                            <p className="text-sm text-gray-500">{doctor.specialization}</p>
                          </div>
                        </div>
                        {doctor.consultation_fee && (
                          <span className="text-sm text-gray-600">
                            Rs. {doctor.consultation_fee}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Workflow Guide */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-sm shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Patient Books</p>
                <p className="text-sm text-gray-500">Patient requests appointment at your pharmacy</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">You Assign</p>
                <p className="text-sm text-gray-500">Assign one of your doctors to the appointment</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Doctor Confirms</p>
                <p className="text-sm text-gray-500">The doctor confirms the appointment</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-sm shrink-0">
                4
              </div>
              <div>
                <p className="font-medium text-gray-900">Completed</p>
                <p className="text-sm text-gray-500">Doctor marks appointment as completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
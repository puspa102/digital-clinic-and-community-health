import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import StatCard from "../../components/dashboard/StatCard";
import QuickActions from "../../components/dashboard/QuickActions";
import {
  Clock,
  Users,
  CheckCircle2,
  UserPlus,
  Calendar,
  ClipboardList,
  Loader2,
} from "lucide-react";

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

  const pendingAssignmentCount = appointments.filter(
    (a) => a.status === APPOINTMENT_STATUS.REQUESTED,
  ).length;
  const assignedCount = appointments.filter(
    (a) => a.status === APPOINTMENT_STATUS.ASSIGNED,
  ).length;
  const confirmedCount = appointments.filter(
    (a) => a.status === APPOINTMENT_STATUS.CONFIRMED,
  ).length;
  const totalDoctorsCount = doctors.length;

  const stats = [
    {
      label: "Pending Assignment",
      value: pendingAssignmentCount,
      icon: Clock,
      colorClass: "bg-[#f59e0b] dark:bg-[#d97706]",
    },
    {
      label: "Awaiting Conf.",
      value: assignedCount,
      icon: Calendar,
      colorClass: "bg-[#0ea5e9] dark:bg-[#0284c7]",
    },
    {
      label: "Confirmed",
      value: confirmedCount,
      icon: CheckCircle2,
      colorClass: "bg-[#10b981] dark:bg-[#059669]",
    },
    {
      label: "Total Doctors",
      value: totalDoctorsCount,
      icon: Users,
      colorClass: "bg-[#8b5cf6] dark:bg-[#7c3aed]",
    },
  ];

  const quickActionsList = [
    {
      label: "Appointments",
      icon: Calendar,
      href: "/pharmacy/appointments",
      accent: false,
    },
    {
      label: "My Doctors",
      icon: Users,
      href: "/pharmacy/doctors",
      accent: false,
    },
    {
      label: "Prescriptions",
      icon: ClipboardList,
      href: "/pharmacy/prescriptions",
      accent: false,
    },
    {
      label: "Add Doctor",
      icon: UserPlus,
      href: "/pharmacy/doctors/add",
      accent: true,
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
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
              {pharmacy?.pharmacy_name || "Pharmacy Dashboard"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              {pendingAssignmentCount > 0
                ? `You have ${pendingAssignmentCount} appointment${pendingAssignmentCount > 1 ? "s" : ""} waiting for doctor assignment.`
                : "All appointments are up to date!"}
            </p>
            {pharmacy?.address && (
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 font-medium">
                📍 {pharmacy.address}
              </p>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} loading={loading} />
          ))}
        </div>

        {/* Quick Actions */}
        <QuickActions actions={quickActionsList} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Appointments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                Recent Appointments
              </h2>
              <Link
                to="/pharmacy/appointments"
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
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    No appointments yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                  {appointments.slice(0, 5).map((appointment) => (
                    <div
                      key={appointment.appointment_id}
                      className="p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-300"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                            <span className="font-bold text-lg">
                              {appointment.Patient?.full_name
                                ?.charAt(0)
                                ?.toUpperCase() || "P"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white text-[15px] truncate">
                              {appointment.Patient?.full_name || "Patient"}
                            </p>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(appointment.appointment_date)} •{" "}
                              {formatTime(appointment.appointment_time)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 text-[11px] font-black rounded-full uppercase tracking-widest ${
                            appointment.status === APPOINTMENT_STATUS.COMPLETED
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                              : appointment.status ===
                                  APPOINTMENT_STATUS.CONFIRMED
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                                : appointment.status ===
                                    APPOINTMENT_STATUS.ASSIGNED
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                                  : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
                          }`}
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
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                My Doctors
              </h2>
              <Link
                to="/pharmacy/doctors"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 overflow-hidden shadow-lg">
              {doctors.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-700">
                    <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    No doctors yet
                  </p>
                  <Link
                    to="/pharmacy/doctors/add"
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 mt-2 inline-block"
                  >
                    Add your first doctor
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                  {doctors.slice(0, 5).map((doctor) => (
                    <div
                      key={doctor.doctor_id}
                      className="p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-300"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800">
                            <span className="font-bold text-lg">
                              {doctor.User?.full_name
                                ?.charAt(0)
                                ?.toUpperCase() || "D"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white text-[15px] truncate">
                              Dr. {doctor.User?.full_name}
                            </p>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                              {doctor.specialization}
                            </p>
                          </div>
                        </div>
                        {doctor.consultation_fee && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                              Rs. {doctor.consultation_fee}
                            </span>
                          </div>
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
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 p-6 shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                num: "1",
                title: "Patient Books",
                desc: "Patient requests appointment at your pharmacy",
                color:
                  "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800",
              },
              {
                num: "2",
                title: "You Assign",
                desc: "Assign one of your doctors to the appointment",
                color:
                  "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800",
              },
              {
                num: "3",
                title: "Doctor Confirmed",
                desc: "The doctor confirms the appointment",
                color:
                  "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800",
              },
              {
                num: "4",
                title: "Completed",
                desc: "Doctor marks appointment as completed",
                color:
                  "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800",
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm shrink-0 shadow-sm border ${step.color}`}
                >
                  {step.num}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {step.title}
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

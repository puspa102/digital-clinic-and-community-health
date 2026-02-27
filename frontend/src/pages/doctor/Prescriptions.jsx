import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import {
  prescriptionAPI,
  appointmentAPI,
  handleApiError,
  formatDate,
  getStatusBadgeClass,
} from "../../services/api";

const FREQUENCIES = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "As needed",
  "Before meals",
  "After meals",
  "At bedtime",
];

const DURATIONS = [
  "3 days",
  "5 days",
  "7 days",
  "10 days",
  "14 days",
  "21 days",
  "30 days",
  "60 days",
  "90 days",
  "Ongoing",
];

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Create/edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  // View modal
  const [viewPrescription, setViewPrescription] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Completed appointments for patient selection
  const [completedAppointments, setCompletedAppointments] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    patient_id: "",
    appointment_id: "",
    diagnosis: "",
    notes: "",
    items: [
      { medicine_name: "", dosage: "", frequency: "Twice daily", duration: "7 days", quantity: "", instructions: "" },
    ],
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchStats();
  }, [pagination.page, statusFilter, search]);

  useEffect(() => {
    if (showModal) {
      fetchCompletedAppointments();
    }
  }, [showModal]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const response = await prescriptionAPI.getMyPrescriptions(params);
      setPrescriptions(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.totalItems || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
      setError(null);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await prescriptionAPI.getPrescriptionStats();
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchCompletedAppointments = async () => {
    try {
      const response = await appointmentAPI.getMyDoctorAppointments({
        status: "completed",
        limit: 50,
      });
      setCompletedAppointments(response.data || []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: "",
      appointment_id: "",
      diagnosis: "",
      notes: "",
      items: [
        { medicine_name: "", dosage: "", frequency: "Twice daily", duration: "7 days", quantity: "", instructions: "" },
      ],
    });
    setEditingId(null);
    setModalError(null);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { medicine_name: "", dosage: "", frequency: "Twice daily", duration: "7 days", quantity: "", instructions: "" },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleAppointmentSelect = (appointmentId) => {
    setFormData((prev) => ({ ...prev, appointment_id: appointmentId }));
    if (appointmentId) {
      const apt = completedAppointments.find(
        (a) => a.appointment_id === parseInt(appointmentId)
      );
      if (apt && apt.Patient) {
        setFormData((prev) => ({
          ...prev,
          appointment_id: appointmentId,
          patient_id: apt.patient_id || apt.Patient?.user_id || "",
        }));
      }
    }
  };

  const handleEdit = (prescription) => {
    setEditingId(prescription.prescription_id);
    setFormData({
      patient_id: prescription.patient_id,
      appointment_id: prescription.appointment_id || "",
      diagnosis: prescription.diagnosis,
      notes: prescription.notes || "",
      items: prescription.PrescriptionItems?.map((item) => ({
        medicine_name: item.medicine_name,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        quantity: item.quantity || "",
        instructions: item.instructions || "",
      })) || [{ medicine_name: "", dosage: "", frequency: "Twice daily", duration: "7 days", quantity: "", instructions: "" }],
    });
    setModalError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setModalError(null);

      const payload = {
        ...formData,
        patient_id: parseInt(formData.patient_id),
        appointment_id: formData.appointment_id ? parseInt(formData.appointment_id) : null,
        items: formData.items.map((item) => ({
          ...item,
          quantity: item.quantity ? parseInt(item.quantity) : null,
        })),
      };

      if (editingId) {
        await prescriptionAPI.updatePrescription(editingId, payload);
      } else {
        await prescriptionAPI.createPrescription(payload);
      }

      setShowModal(false);
      resetForm();
      fetchPrescriptions();
      fetchStats();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setModalError(errorInfo.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (prescriptionId, newStatus) => {
    try {
      await prescriptionAPI.updatePrescription(prescriptionId, { status: newStatus });
      fetchPrescriptions();
      fetchStats();
      if (viewPrescription?.prescription_id === prescriptionId) {
        const updated = await prescriptionAPI.getPrescriptionById(prescriptionId);
        setViewPrescription(updated.data);
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await prescriptionAPI.deletePrescription(id);
      setDeleteConfirm(null);
      fetchPrescriptions();
      fetchStats();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    }
  };

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  if (loading && prescriptions.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading prescriptions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Prescriptions
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Create and manage patient prescriptions
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Prescription
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
              <p className="text-2xl font-bold text-blue-600">{stats.totalPrescriptions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500">
              <p className="text-2xl font-bold text-green-600">{stats.activePrescriptions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-gray-500">
              <p className="text-2xl font-bold text-gray-600">{stats.completedPrescriptions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-red-500">
              <p className="text-2xl font-bold text-red-600">{stats.cancelledPrescriptions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
              <p className="text-2xl font-bold text-purple-600">{stats.uniquePatients}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Patients</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by patient name or diagnosis..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Prescriptions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">ID</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Patient</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Diagnosis</th>
                  <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-medium">Medicines</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Status</th>
                  <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {prescriptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">No prescriptions found</p>
                        <p className="text-sm">Create your first prescription to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  prescriptions.map((rx) => (
                    <tr key={rx.prescription_id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setViewPrescription(rx)}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          #{rx.prescription_id}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {rx.Patient?.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">{rx.Patient?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        <p className="max-w-xs truncate">{rx.diagnosis}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                        {rx.PrescriptionItems?.length || 0}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {formatDate(rx.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(rx.status)}`}>
                          {rx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {rx.status === "active" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(rx.prescription_id, "completed")}
                                className="px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 border border-green-200 rounded-lg"
                                title="Mark completed"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleEdit(rx)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setViewPrescription(rx)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(rx)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} prescriptions)
              </p>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? "Edit Prescription" : "New Prescription"}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {modalError}
                </div>
              )}

              {/* Link to appointment or enter patient ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Link to Appointment (optional)
                  </label>
                  <select
                    value={formData.appointment_id}
                    onChange={(e) => handleAppointmentSelect(e.target.value)}
                    disabled={!!editingId}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    <option value="">-- No linked appointment --</option>
                    {completedAppointments.map((apt) => (
                      <option key={apt.appointment_id} value={apt.appointment_id}>
                        #{apt.appointment_id} - {apt.Patient?.full_name || "Patient"} ({formatDate(apt.appointment_date)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Patient ID *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    disabled={!!editingId}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    placeholder="Enter patient user ID"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Diagnosis *
                </label>
                <textarea
                  required
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Upper respiratory tract infection, Hypertension..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Additional notes for the patient or pharmacist..."
                />
              </div>

              {/* Prescription Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Medicines *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    + Add Medicine
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Medicine #{index + 1}
                        </span>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={item.medicine_name}
                          onChange={(e) => handleItemChange(index, "medicine_name", e.target.value)}
                          className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 dark:text-white"
                          placeholder="Medicine name *"
                        />
                        <input
                          type="text"
                          required
                          value={item.dosage}
                          onChange={(e) => handleItemChange(index, "dosage", e.target.value)}
                          className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 dark:text-white"
                          placeholder="Dosage (e.g., 500mg) *"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select
                          required
                          value={item.frequency}
                          onChange={(e) => handleItemChange(index, "frequency", e.target.value)}
                          className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 dark:text-white"
                        >
                          {FREQUENCIES.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                        <select
                          required
                          value={item.duration}
                          onChange={(e) => handleItemChange(index, "duration", e.target.value)}
                          className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 dark:text-white"
                        >
                          {DURATIONS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 dark:text-white"
                          placeholder="Qty (optional)"
                        />
                      </div>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={(e) => handleItemChange(index, "instructions", e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 dark:text-white"
                        placeholder="Special instructions (e.g., Take after meals)"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {saving ? "Saving..." : editingId ? "Update Prescription" : "Create Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Prescription Modal */}
      {viewPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Prescription #{viewPrescription.prescription_id}
              </h2>
              <button
                onClick={() => setViewPrescription(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Patient & status info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Patient</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {viewPrescription.Patient?.full_name || "Unknown"}
                  </p>
                  {viewPrescription.Patient?.phone && (
                    <p className="text-sm text-gray-500">{viewPrescription.Patient.phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(viewPrescription.status)}`}>
                    {viewPrescription.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(viewPrescription.created_at)}
                  </p>
                </div>
                {viewPrescription.Appointment && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Linked Appointment</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      #{viewPrescription.Appointment.appointment_id} ({formatDate(viewPrescription.Appointment.appointment_date)})
                    </p>
                  </div>
                )}
              </div>

              {/* Diagnosis */}
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Diagnosis</p>
                <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  {viewPrescription.diagnosis}
                </p>
              </div>

              {viewPrescription.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                  <p className="text-gray-700 dark:text-gray-300">{viewPrescription.notes}</p>
                </div>
              )}

              {/* Medicines Table */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prescribed Medicines</p>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Medicine</th>
                        <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Dosage</th>
                        <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Frequency</th>
                        <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Duration</th>
                        <th className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
                      {(viewPrescription.PrescriptionItems || []).map((item) => (
                        <tr key={item.prescription_item_id}>
                          <td className="px-3 py-2 text-gray-900 dark:text-white font-medium">
                            {item.medicine_name}
                            {item.instructions && (
                              <p className="text-xs text-gray-500 font-normal mt-0.5">{item.instructions}</p>
                            )}
                          </td>
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{item.dosage}</td>
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{item.frequency}</td>
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{item.duration}</td>
                          <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">{item.quantity || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              {viewPrescription.status === "active" && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      handleStatusChange(viewPrescription.prescription_id, "completed");
                    }}
                    className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(viewPrescription.prescription_id, "cancelled");
                    }}
                    className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Cancel Prescription
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Delete Prescription
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete prescription{" "}
              <span className="font-medium">#{deleteConfirm.prescription_id}</span> for{" "}
              <span className="font-medium">{deleteConfirm.Patient?.full_name || "this patient"}</span>?
              This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.prescription_id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Prescriptions;

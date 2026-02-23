import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import {
  pharmacyAPI,
  appointmentAPI,
  formatTime,
  handleApiError,
} from "../../services/api";

const Pharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [bookingData, setBookingData] = useState({
    appointment_date: "",
    appointment_time: "",
    reason: "",
  });
  const [bookingErrors, setBookingErrors] = useState({});
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchPharmacies();
  }, [pagination.page, searchTerm]);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const response = await pharmacyAPI.getAllPharmacies({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
      });
      // API returns { success, data: [...], pagination: {...} }
      setPharmacies(response.data || []);
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

  const handleOpenBooking = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setBookingData({
      appointment_date: "",
      appointment_time: "",
      reason: "",
    });
    setBookingErrors({});
    setBookingSuccess(false);
    setShowBookingModal(true);
  };

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
    if (bookingErrors[name]) {
      setBookingErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateBooking = () => {
    const errors = {};
    if (!bookingData.appointment_date) {
      errors.appointment_date = "Date is required";
    } else {
      const selectedDate = new Date(bookingData.appointment_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.appointment_date = "Date cannot be in the past";
      }
    }
    if (!bookingData.appointment_time) {
      errors.appointment_time = "Time is required";
    }
    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBooking = async () => {
    if (!validateBooking()) return;

    try {
      setBooking(true);
      setBookingErrors({});
      await appointmentAPI.createAppointment({
        pharmacy_id: selectedPharmacy.pharmacy_id,
        appointment_date: bookingData.appointment_date,
        appointment_time: bookingData.appointment_time,
        reason: bookingData.reason || undefined,
      });
      setBookingSuccess(true);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setBookingErrors({ submit: errorInfo.message });
    } finally {
      setBooking(false);
    }
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedPharmacy(null);
    setBookingSuccess(false);
  };

  // Get minimum date for appointment (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Pharmacies</h1>
          <p className="text-gray-500">
            Browse pharmacies and book an appointment
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Pharmacies Grid */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading pharmacies...</p>
          </div>
        ) : pharmacies.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 21h18" />
              <path d="M5 21V7l8-4v18" />
              <path d="M19 21V11l-6-4" />
            </svg>
            <p>No pharmacies found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 text-blue-600 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacies.map((pharmacy) => (
              <div
                key={pharmacy.pharmacy_id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Pharmacy Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 21h18" />
                        <path d="M5 21V7l8-4v18" />
                        <path d="M19 21V11l-6-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">{pharmacy.pharmacy_name}</h3>
                      <p className="text-sm text-blue-100">{pharmacy.address}</p>
                    </div>
                  </div>
                </div>

                {/* Pharmacy Details */}
                <div className="p-4 space-y-3">
                  {/* Hours */}
                  {(pharmacy.opening_time || pharmacy.closing_time) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>
                        {pharmacy.opening_time
                          ? formatTime(pharmacy.opening_time)
                          : "—"}{" "}
                        -{" "}
                        {pharmacy.closing_time
                          ? formatTime(pharmacy.closing_time)
                          : "—"}
                      </span>
                    </div>
                  )}

                  {/* Phone */}
                  {pharmacy.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>{pharmacy.phone}</span>
                    </div>
                  )}

                  {/* Description */}
                  {pharmacy.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {pharmacy.description}
                    </p>
                  )}

                  {/* License */}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>License: {pharmacy.license_number}</span>
                  </div>
                </div>

                {/* Book Button */}
                <div className="px-4 pb-4">
                  <button
                    onClick={() => handleOpenBooking(pharmacy)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <line x1="12" y1="14" x2="12" y2="18" />
                      <line x1="10" y1="16" x2="14" y2="16" />
                    </svg>
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} pharmacies
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedPharmacy && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Book Appointment
                </h2>
                <button
                  onClick={handleCloseBookingModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {bookingSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Appointment Requested!
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Your appointment request has been sent to{" "}
                    <strong>{selectedPharmacy.pharmacy_name}</strong>. The
                    pharmacy will assign a doctor and you'll be notified once
                    confirmed.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCloseBookingModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <a
                      href="/patient/appointments"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                    >
                      View Appointments
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Pharmacy Info */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">
                      Booking at
                    </p>
                    <p className="font-semibold text-gray-900">
                      {selectedPharmacy.pharmacy_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedPharmacy.address}
                    </p>
                  </div>

                  {/* Error */}
                  {bookingErrors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                      {bookingErrors.submit}
                    </div>
                  )}

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Appointment Date *
                    </label>
                    <input
                      type="date"
                      name="appointment_date"
                      value={bookingData.appointment_date}
                      onChange={handleBookingInputChange}
                      min={getMinDate()}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        bookingErrors.appointment_date
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {bookingErrors.appointment_date && (
                      <p className="text-red-500 text-xs mt-1">
                        {bookingErrors.appointment_date}
                      </p>
                    )}
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time *
                    </label>
                    <input
                      type="time"
                      name="appointment_time"
                      value={bookingData.appointment_time}
                      onChange={handleBookingInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        bookingErrors.appointment_time
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {bookingErrors.appointment_time && (
                      <p className="text-red-500 text-xs mt-1">
                        {bookingErrors.appointment_time}
                      </p>
                    )}
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Visit (Optional)
                    </label>
                    <textarea
                      name="reason"
                      value={bookingData.reason}
                      onChange={handleBookingInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your symptoms or reason for the appointment..."
                    />
                  </div>

                  {/* Info Notice */}
                  <div className="flex items-start gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                    <svg
                      className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>
                      The pharmacy will assign a doctor to your appointment.
                      You'll receive confirmation once the doctor accepts.
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={handleCloseBookingModal}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitBooking}
                      disabled={booking}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {booking && (
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      )}
                      {booking ? "Booking..." : "Request Appointment"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Pharmacies;
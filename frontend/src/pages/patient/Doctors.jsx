import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import api, { handleApiError } from "../../services/api";
import {
  Search,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  Clock,
  Building2,
  Award,
  ChevronLeft,
  ChevronRight,
  User,
  Filter,
  X,
  Banknote,
} from "lucide-react";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Doctor detail modal
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Available specializations
  const specializations = [
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Orthopedic",
    "Pediatrician",
    "Gynecologist",
    "Neurologist",
    "ENT Specialist",
    "Ophthalmologist",
    "Psychiatrist",
    "Dentist",
    "Surgeon",
  ];

  useEffect(() => {
    fetchDoctors();
  }, [pagination.page, search, specialization]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (search) {
        const response = await api.get("/doctors/search", {
          params: { q: search, specialization, ...params },
        });
        setDoctors(response.data.data?.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data.data?.pagination?.totalItems || 0,
          totalPages: response.data.data?.pagination?.totalPages || 0,
        }));
      } else {
        const response = await api.get("/doctors", {
          params: { specialization, ...params },
        });
        setDoctors(response.data.data?.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data.data?.pagination?.totalItems || 0,
          totalPages: response.data.data?.pagination?.totalPages || 0,
        }));
      }
      setError(null);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchDoctors();
  };

  const clearFilters = () => {
    setSearch("");
    setSpecialization("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const viewDoctorDetail = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const closeDetail = () => {
    setSelectedDoctor(null);
  };

  const formatAvailability = (availabilityJson) => {
    if (!availabilityJson) return "Not set";
    const days = Object.entries(availabilityJson)
      .filter(([_, slots]) => slots && slots.length > 0)
      .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1, 3));
    return days.length > 0 ? days.join(", ") : "Not set";
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Find Doctors
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Browse and search for doctors by specialization
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition sm:hidden"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, hospital..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className={`${showFilters ? "block" : "hidden"} sm:block`}>
                <select
                  value={specialization}
                  onChange={(e) => {
                    setSpecialization(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="w-full sm:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Search
              </button>
            </div>

            {(search || specialization) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Active filters:
                </span>
                {search && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                    Search: {search}
                    <button
                      onClick={() => setSearch("")}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {specialization && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                    {specialization}
                    <button
                      onClick={() => setSpecialization("")}
                      className="hover:text-green-900 dark:hover:text-green-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </form>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No doctors found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div
                  key={doctor.doctor_id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition cursor-pointer"
                  onClick={() => viewDoctorDetail(doctor)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        Dr. {doctor.User?.full_name || "Unknown"}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                        {doctor.specialization}
                      </p>
                      {doctor.hospital_name && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm truncate mt-1">
                          <Building2 className="w-3 h-3 inline mr-1" />
                          {doctor.hospital_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Award className="w-4 h-4" />
                      <span>{doctor.experience_years} yrs exp</span>
                    </div>
                    {doctor.consultation_fee && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Banknote className="w-4 h-4" />
                        <span>Rs. {doctor.consultation_fee}</span>
                      </div>
                    )}
                  </div>

                  {doctor.Pharmacy && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {doctor.Pharmacy.pharmacy_name}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map(
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (
                        pagination.page >= pagination.totalPages - 2
                      ) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() =>
                            setPagination((prev) => ({ ...prev, page: pageNum }))
                          }
                          className={`w-10 h-10 rounded-lg font-medium transition ${
                            pagination.page === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(pagination.totalPages, prev.page + 1),
                    }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {!loading && doctors.length > 0 && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} doctors
          </p>
        )}
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeDetail}
          />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Doctor Profile
                </h2>
                <button
                  onClick={closeDetail}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                  <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Dr. {selectedDoctor.User?.full_name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium text-lg">
                      {selectedDoctor.specialization}
                    </p>
                    {selectedDoctor.hospital_name && (
                      <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center sm:justify-start gap-2">
                        <Building2 className="w-4 h-4" />
                        {selectedDoctor.hospital_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Experience
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedDoctor.experience_years} Years
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Banknote className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Consultation Fee
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedDoctor.consultation_fee
                            ? `Rs. ${selectedDoctor.consultation_fee}`
                            : "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Available Days
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatAvailability(selectedDoctor.availability_json)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          License No.
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedDoctor.license_number}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedDoctor.bio && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      About
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedDoctor.bio}
                    </p>
                  </div>
                )}

                {selectedDoctor.User && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Contact Information
                    </h4>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        {selectedDoctor.User.email}
                      </p>
                      {selectedDoctor.User.phone && (
                        <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4" />
                          {selectedDoctor.User.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedDoctor.Pharmacy && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Associated Pharmacy
                    </h4>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedDoctor.Pharmacy.pharmacy_name}
                    </p>
                    {selectedDoctor.Pharmacy.address && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {selectedDoctor.Pharmacy.address}
                      </p>
                    )}
                    {selectedDoctor.Pharmacy.phone && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {selectedDoctor.Pharmacy.phone}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Doctors;

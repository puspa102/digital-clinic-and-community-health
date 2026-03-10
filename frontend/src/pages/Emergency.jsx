import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { emergencyAPI, pharmacyAPI, handleApiError } from "../services/api";
import {
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  Heart,
  Pill,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Search,
  Droplets,
  Activity,
  Stethoscope,
  X,
  Send,
  HeartPulse,
  UserPlus,
} from "lucide-react";

const EMERGENCY_TYPES = {
  BLOOD: "Blood",
  MEDICINE: "Medicine",
  DOCTOR: "Doctor",
};

const URGENCY_LEVELS = {
  CRITICAL: "critical",
  URGENT: "urgent",
  NORMAL: "normal",
};

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const Emergency = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  
  const [activeTab, setActiveTab] = useState("blood");
  const [requestType, setRequestType] = useState("receive");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Emergency data from API
  const [emergencies, setEmergencies] = useState([]);
  const [myEmergencies, setMyEmergencies] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  
  // Form states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState("A+");
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [formData, setFormData] = useState({
    emergency_type: EMERGENCY_TYPES.BLOOD,
    description: "",
    units: "",
    medicine_name: "",
    quantity: "",
    urgency: URGENCY_LEVELS.URGENT,
    location: "",
    contact: user?.phone || "",
  });
  const [donorFormData, setDonorFormData] = useState({
    bloodType: "O+",
    location: "",
    phone: user?.phone || "",
    available: true,
  });

  // Stats
  const [stats, setStats] = useState({
    activeBloodRequests: 0,
    activeMedicineRequests: 0,
    activeDoctorRequests: 0,
    resolvedRequests: 0,
  });

  // Check if user can accept emergencies (Doctor/Pharmacy/Admin)
  const canAcceptEmergency = user && ["Doctor", "Pharmacy", "Admin"].includes(user.role);

  // Get user's geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Geolocation not available:", error.message);
        }
      );
    }
  }, []);

  // Fetch emergencies
  const fetchEmergencies = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Use public endpoint for viewing emergencies (accessible by all authenticated users)
      const [allRes, myRes, pharmacyRes] = await Promise.all([
        emergencyAPI.getPublicEmergencies({ limit: 50 }).catch(() => ({ data: [] })),
        user ? emergencyAPI.getMyEmergencies({ limit: 20 }).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        pharmacyAPI.getAllPharmacies({ limit: 20 }).catch(() => ({ data: [] })),
      ]);

      const allEmergencies = allRes?.data || [];
      setEmergencies(allEmergencies);
      setMyEmergencies(myRes?.data || []);
      setPharmacies(pharmacyRes?.data || []);

      // Calculate stats
      const bloodRequests = allEmergencies.filter(e => e.emergency_type === EMERGENCY_TYPES.BLOOD && e.status !== "resolved" && e.status !== "expired");
      const medicineRequests = allEmergencies.filter(e => e.emergency_type === EMERGENCY_TYPES.MEDICINE && e.status !== "resolved" && e.status !== "expired");
      const doctorRequests = allEmergencies.filter(e => e.emergency_type === EMERGENCY_TYPES.DOCTOR && e.status !== "resolved" && e.status !== "expired");
      const resolved = allEmergencies.filter(e => e.status === "resolved");

      setStats({
        activeBloodRequests: bloodRequests.length,
        activeMedicineRequests: medicineRequests.length,
        activeDoctorRequests: doctorRequests.length,
        resolvedRequests: resolved.length,
      });
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEmergencies();
  }, [fetchEmergencies]);

  const handleRefresh = () => {
    fetchEmergencies(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle donor form input change
  const handleDonorInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDonorFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Submit emergency request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError("Please log in to submit an emergency request");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const requestData = {
        emergency_type: formData.emergency_type,
        description: buildDescription(),
        ...(location.latitude && { latitude: location.latitude }),
        ...(location.longitude && { longitude: location.longitude }),
      };

      await emergencyAPI.createEmergency(requestData);
      
      setSuccess("Emergency request submitted successfully!");
      setShowRequestModal(false);
      setFormData({
        emergency_type: EMERGENCY_TYPES.BLOOD,
        description: "",
        units: "",
        medicine_name: "",
        quantity: "",
        urgency: URGENCY_LEVELS.URGENT,
        location: "",
        contact: user?.phone || "",
      });
      
      fetchEmergencies();
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  // Cancel emergency request
  const handleCancelEmergency = async (emergencyId) => {
    if (!window.confirm("Are you sure you want to cancel this emergency request?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await emergencyAPI.cancelEmergency(emergencyId);
      setSuccess("Emergency request cancelled successfully");
      fetchEmergencies();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  // Accept emergency request (Doctor/Pharmacy/Admin)
  const handleAcceptEmergency = async (emergencyId) => {
    if (!canAcceptEmergency) {
      setError("Only doctors, pharmacies, or admins can accept emergency requests");
      return;
    }

    if (!window.confirm("Are you sure you want to accept this emergency request? You will be responsible for helping this person.")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await emergencyAPI.acceptEmergency(emergencyId, user.user_id);
      setSuccess("Emergency request accepted! Please contact the requester.");
      fetchEmergencies();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit donor registration (this would need backend support - for now show success)
  const handleDonorRegistration = async (e) => {
    e.preventDefault();
    // Note: Backend donor registration would need to be implemented
    setSuccess("Thank you for registering as a donor! You will be contacted when there's a matching request.");
    setShowDonorModal(false);
    setTimeout(() => setSuccess(null), 5000);
  };

  const buildDescription = () => {
    if (formData.emergency_type === EMERGENCY_TYPES.BLOOD) {
      return `Blood Type: ${selectedBloodType}, Units: ${formData.units || "N/A"}, Location: ${formData.location || "N/A"}, Contact: ${formData.contact || "N/A"}, Urgency: ${formData.urgency}`;
    } else if (formData.emergency_type === EMERGENCY_TYPES.MEDICINE) {
      return `Medicine: ${formData.medicine_name || "N/A"}, Quantity: ${formData.quantity || "N/A"}, Location: ${formData.location || "N/A"}, Contact: ${formData.contact || "N/A"}, Urgency: ${formData.urgency}`;
    } else if (formData.emergency_type === EMERGENCY_TYPES.DOCTOR) {
      return `Symptoms: ${formData.description || "N/A"}, Location: ${formData.location || "N/A"}, Contact: ${formData.contact || "N/A"}, Urgency: ${formData.urgency}`;
    }
    return formData.description;
  };

  // Parse emergency description for display
  const parseDescription = (description) => {
    const parts = {};
    if (description) {
      description.split(", ").forEach(part => {
        const [key, value] = part.split(": ");
        if (key && value) {
          parts[key.toLowerCase().replace(" ", "_")] = value;
        }
      });
    }
    return parts;
  };

  // Get urgency styling
  const getUrgencyStyle = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "critical":
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-700 dark:text-red-400",
          border: "border-red-200 dark:border-red-800",
          dot: "bg-red-500",
        };
      case "urgent":
        return {
          bg: "bg-orange-100 dark:bg-orange-900/30",
          text: "text-orange-700 dark:text-orange-400",
          border: "border-orange-200 dark:border-orange-800",
          dot: "bg-orange-500",
        };
      default:
        return {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-700 dark:text-green-400",
          border: "border-green-200 dark:border-green-800",
          dot: "bg-green-500",
        };
    }
  };

  // Get status styling
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "accepted":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "in_progress":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "resolved":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  // Filter emergencies by type
  const bloodEmergencies = emergencies.filter(e => e.emergency_type === EMERGENCY_TYPES.BLOOD);
  const medicineEmergencies = emergencies.filter(e => e.emergency_type === EMERGENCY_TYPES.MEDICINE);
  const doctorEmergencies = emergencies.filter(e => e.emergency_type === EMERGENCY_TYPES.DOCTOR);

  // Mock blood donors for display (in real app, this would come from API - donor registration system)
  const bloodDonors = [
    { id: 1, name: "John Smith", bloodType: "O+", lastDonation: "3 months ago", location: "Downtown Area", available: true, contact: "+1 234 567 897" },
    { id: 2, name: "Emily Davis", bloodType: "A-", lastDonation: "6 months ago", location: "Westside", available: true, contact: "+1 234 567 898" },
    { id: 3, name: "Michael Brown", bloodType: "B+", lastDonation: "1 month ago", location: "Uptown", available: false, contact: "+1 234 567 899" },
  ];

  if (loading && emergencies.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading emergency portal...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-4 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Critical Care Portal
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Real-time emergency resource management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-green-700 dark:text-green-400 text-sm font-semibold">LIVE</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm rounded-lg transition-colors font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-green-700 dark:text-green-400">{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto text-green-500 hover:text-green-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Droplets className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.activeBloodRequests}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Blood Requests</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.activeMedicineRequests}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Medicine Requests</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.resolvedRequests}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Resolved</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{bloodDonors.filter(d => d.available).length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Available Donors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Request Blood Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Droplets className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Request Blood</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Find blood donors nearby</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                LIFE-SAVING
              </span>
            </div>
            
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                Select Blood Group
              </label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map(bt => (
                  <button
                    key={bt}
                    onClick={() => setSelectedBloodType(bt)}
                    className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                      selectedBloodType === bt
                        ? "bg-red-500 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setFormData(prev => ({ ...prev, emergency_type: EMERGENCY_TYPES.BLOOD }));
                setShowRequestModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
              Request Blood
            </button>
          </div>

          {/* Request Medicine Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Request Medicine</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Get help with urgent medication</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded">
                URGENT
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                  Medicine Name
                </label>
                <input
                  type="text"
                  name="medicine_name"
                  value={formData.medicine_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Insulin, Antibiotics"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setFormData(prev => ({ ...prev, emergency_type: EMERGENCY_TYPES.MEDICINE }));
                setShowRequestModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              Request Medicine
            </button>
          </div>

          {/* Request Doctor Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Need a Doctor</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Request emergency medical help</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                MEDICAL
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                  Describe Symptoms
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g. Chest pain, difficulty breathing"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setFormData(prev => ({ ...prev, emergency_type: EMERGENCY_TYPES.DOCTOR }));
                setShowRequestModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
            >
              <Stethoscope className="w-4 h-4" />
              Request Doctor
            </button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Tab Header */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {[
              { key: "blood", label: "Blood Requests", icon: Droplets, count: stats.activeBloodRequests },
              { key: "medicine", label: "Medicine Requests", icon: Pill, count: stats.activeMedicineRequests },
              { key: "doctor", label: "Doctor Requests", icon: Stethoscope, count: stats.activeDoctorRequests },
              { key: "donors", label: "Donors & Pharmacies", icon: Users },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-px"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {/* Blood Requests Tab */}
            {activeTab === "blood" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Urgent Blood Requests</h2>
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, emergency_type: EMERGENCY_TYPES.BLOOD }));
                      setShowRequestModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Post Request
                  </button>
                </div>

                {bloodEmergencies.length === 0 ? (
                  <div className="text-center py-12">
                    <Droplets className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No active blood requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bloodEmergencies.map(emergency => {
                      const details = parseDescription(emergency.description);
                      const urgencyStyle = getUrgencyStyle(details.urgency || emergency.priority);
                      const isOwnRequest = user && emergency.patient_id === user.user_id;
                      
                      return (
                        <div
                          key={emergency.emergency_id}
                          className={`p-4 rounded-xl border-l-4 ${urgencyStyle.border} bg-gray-50 dark:bg-gray-700/50`}
                          style={{ borderLeftColor: urgencyStyle.dot.replace("bg-", "") }}
                        >
                          <div className="flex items-start justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                {details.blood_type || "?"}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {details.units || "?"} Units Required
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${urgencyStyle.bg} ${urgencyStyle.text}`}>
                                    {(details.urgency || emergency.priority || "normal").toUpperCase()}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${getStatusStyle(emergency.status)}`}>
                                    {emergency.status?.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  {details.location || "Location not specified"}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {new Date(emergency.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {details.contact && (
                                <a
                                  href={`tel:${details.contact}`}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                                >
                                  <Phone className="w-4 h-4" />
                                  Contact
                                </a>
                              )}
                              {!isOwnRequest && canAcceptEmergency && emergency.status === "pending" && (
                                <button 
                                  onClick={() => handleAcceptEmergency(emergency.emergency_id)}
                                  disabled={loading}
                                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                  Accept & Help
                                </button>
                              )}
                              {!isOwnRequest && !canAcceptEmergency && emergency.status === "pending" && (
                                <button 
                                  onClick={() => setShowDonorModal(true)}
                                  className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  I Can Donate
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Blood Donors Tab */}
            {activeTab === "donors" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Blood Donors & Pharmacies</h2>
                  <button 
                    onClick={() => setShowDonorModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register as Donor
                  </button>
                </div>

                {/* Blood Donors Section */}
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Blood Donors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {bloodDonors.map(donor => (
                    <div
                      key={donor.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                          {donor.bloodType}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{donor.name}</span>
                            <span className={`w-2 h-2 rounded-full ${donor.available ? "bg-green-500" : "bg-gray-400"}`}></span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{donor.location}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Last donation: {donor.lastDonation}</p>
                        </div>
                      </div>
                      <a
                        href={donor.available ? `tel:${donor.contact}` : undefined}
                        className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg font-medium transition-colors ${
                          donor.available
                            ? "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                            : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <Phone className="w-4 h-4" />
                        {donor.available ? "Contact" : "Unavailable"}
                      </a>
                    </div>
                  ))}
                </div>

                {/* Pharmacies Section */}
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Pharmacies & Medicine Providers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pharmacies.length > 0 ? pharmacies.map(pharmacy => (
                    <div
                      key={pharmacy.pharmacy_id}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                          <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">{pharmacy.name}</span>
                            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
                              Pharmacy
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{pharmacy.address || "Address not specified"}</p>
                          {pharmacy.User && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">Contact: {pharmacy.User.phone || pharmacy.User.email}</p>
                          )}
                        </div>
                      </div>
                      <a
                        href={pharmacy.User?.phone ? `tel:${pharmacy.User.phone}` : `mailto:${pharmacy.User?.email}`}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Contact
                      </a>
                    </div>
                  )) : (
                    <div className="col-span-2 text-center py-8">
                      <Pill className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No pharmacies registered yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Medicine Requests Tab */}
            {activeTab === "medicine" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Medicine Requests</h2>
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, emergency_type: EMERGENCY_TYPES.MEDICINE }));
                      setShowRequestModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Post Request
                  </button>
                </div>

                {medicineEmergencies.length === 0 ? (
                  <div className="text-center py-12">
                    <Pill className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No active medicine requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {medicineEmergencies.map(emergency => {
                      const details = parseDescription(emergency.description);
                      const urgencyStyle = getUrgencyStyle(details.urgency || emergency.priority);
                      const isOwnRequest = user && emergency.patient_id === user.user_id;
                      
                      return (
                        <div
                          key={emergency.emergency_id}
                          className={`p-4 rounded-xl border-l-4 ${urgencyStyle.border} bg-gray-50 dark:bg-gray-700/50`}
                        >
                          <div className="flex items-start justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-center">
                                <Pill className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {details.medicine || "Medicine Request"}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${urgencyStyle.bg} ${urgencyStyle.text}`}>
                                    {(details.urgency || emergency.priority || "normal").toUpperCase()}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${getStatusStyle(emergency.status)}`}>
                                    {emergency.status?.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Qty: {details.quantity || "N/A"}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  {details.location || "Location not specified"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {details.contact && (
                                <a
                                  href={`tel:${details.contact}`}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                                >
                                  <Phone className="w-4 h-4" />
                                  Contact
                                </a>
                              )}
                              {!isOwnRequest && canAcceptEmergency && emergency.status === "pending" && (
                                <button 
                                  onClick={() => handleAcceptEmergency(emergency.emergency_id)}
                                  disabled={loading}
                                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                  Accept & Help
                                </button>
                              )}
                              {!isOwnRequest && !canAcceptEmergency && emergency.status === "pending" && (
                                <button 
                                  onClick={() => {
                                    if (details.contact) {
                                      window.location.href = `tel:${details.contact}`;
                                    }
                                  }}
                                  className="px-4 py-2 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                >
                                  I Can Help
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Doctor Requests Tab */}
            {activeTab === "doctor" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Doctor Requests</h2>
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, emergency_type: EMERGENCY_TYPES.DOCTOR }));
                      setShowRequestModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Post Request
                  </button>
                </div>

                {doctorEmergencies.length === 0 ? (
                  <div className="text-center py-12">
                    <Stethoscope className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No active doctor requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {doctorEmergencies.map(emergency => {
                      const details = parseDescription(emergency.description);
                      const urgencyStyle = getUrgencyStyle(details.urgency || emergency.priority);
                      const isOwnRequest = user && emergency.patient_id === user.user_id;
                      
                      return (
                        <div
                          key={emergency.emergency_id}
                          className={`p-4 rounded-xl border-l-4 ${urgencyStyle.border} bg-gray-50 dark:bg-gray-700/50`}
                        >
                          <div className="flex items-start justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center justify-center">
                                <Stethoscope className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    Medical Emergency
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${urgencyStyle.bg} ${urgencyStyle.text}`}>
                                    {(details.urgency || emergency.priority || "normal").toUpperCase()}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${getStatusStyle(emergency.status)}`}>
                                    {emergency.status?.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Symptoms: {details.symptoms || emergency.description || "Not specified"}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  {details.location || "Location not specified"}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {new Date(emergency.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {details.contact && (
                                <a
                                  href={`tel:${details.contact}`}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                                >
                                  <Phone className="w-4 h-4" />
                                  Contact
                                </a>
                              )}
                              {!isOwnRequest && canAcceptEmergency && emergency.status === "pending" && (
                                <button 
                                  onClick={() => handleAcceptEmergency(emergency.emergency_id)}
                                  disabled={loading}
                                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                  Accept & Respond
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* My Emergency Requests */}
        {user && myEmergencies.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">My Emergency Requests</h2>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                {myEmergencies.filter(e => e.status !== "resolved" && e.status !== "expired").length} Active
              </span>
            </div>
            <div className="space-y-3">
              {myEmergencies.map(emergency => {
                const details = parseDescription(emergency.description);
                const statusStyle = getStatusStyle(emergency.status);
                const isActive = !["resolved", "expired"].includes(emergency.status);
                
                return (
                  <div
                    key={emergency.emergency_id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          emergency.emergency_type === EMERGENCY_TYPES.BLOOD 
                            ? "bg-red-100 dark:bg-red-900/30" 
                            : emergency.emergency_type === EMERGENCY_TYPES.MEDICINE
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : "bg-purple-100 dark:bg-purple-900/30"
                        }`}>
                          {emergency.emergency_type === EMERGENCY_TYPES.BLOOD 
                            ? <Droplets className="w-5 h-5 text-red-600 dark:text-red-400" />
                            : emergency.emergency_type === EMERGENCY_TYPES.MEDICINE
                              ? <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              : <Stethoscope className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {emergency.emergency_type === EMERGENCY_TYPES.BLOOD 
                                ? `Blood (${details.blood_type || "N/A"})` 
                                : emergency.emergency_type === EMERGENCY_TYPES.MEDICINE
                                  ? details.medicine || "Medicine Request"
                                  : "Doctor Emergency Request"
                              }
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${statusStyle}`}>
                              {emergency.status?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(emergency.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {isActive && (
                        <button
                          onClick={() => handleCancelEmergency(emergency.emergency_id)}
                          disabled={loading}
                          className="flex items-center gap-2 px-3 py-1.5 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Emergency Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Emergency Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Droplets,
                iconColor: "text-red-500",
                bgColor: "bg-red-100 dark:bg-red-900/30",
                title: "Blood Donation Eligibility",
                text: "You can donate blood if you're 18-65 years old, weigh at least 50kg, and are in good health.",
              },
              {
                icon: Clock,
                iconColor: "text-blue-500",
                bgColor: "bg-blue-100 dark:bg-blue-900/30",
                title: "Response Time",
                text: "In critical emergencies, every minute counts. Contact multiple donors simultaneously.",
              },
              {
                icon: CheckCircle,
                iconColor: "text-green-500",
                bgColor: "bg-green-100 dark:bg-green-900/30",
                title: "Verify Before Use",
                text: "Always verify medicine expiry dates and proper storage conditions before accepting donations.",
              },
            ].map((tip, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className={`w-10 h-10 ${tip.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                  <tip.icon className={`w-5 h-5 ${tip.iconColor}`} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{tip.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Hotline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 border-l-red-500 border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Phone className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">24/7 Emergency Hotline</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">1-800-EMERGENCY</p>
              </div>
            </div>
            <a
              href="tel:1800363743629"
              className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call Now
            </a>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {formData.emergency_type === EMERGENCY_TYPES.BLOOD 
                  ? "Blood Request" 
                  : formData.emergency_type === EMERGENCY_TYPES.MEDICINE 
                    ? "Medicine Request"
                    : "Doctor Request"
                }
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitRequest} className="p-4 space-y-4">
              {formData.emergency_type === EMERGENCY_TYPES.BLOOD && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Blood Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {BLOOD_TYPES.map(bt => (
                        <button
                          key={bt}
                          type="button"
                          onClick={() => setSelectedBloodType(bt)}
                          className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                            selectedBloodType === bt
                              ? "bg-red-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {bt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Units Required
                    </label>
                    <input
                      type="number"
                      name="units"
                      value={formData.units}
                      onChange={handleInputChange}
                      placeholder="Number of units"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </>
              )}
              
              {formData.emergency_type === EMERGENCY_TYPES.MEDICINE && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Medicine Name
                    </label>
                    <input
                      type="text"
                      name="medicine_name"
                      value={formData.medicine_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Insulin, Antibiotics"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantity
                    </label>
                    <input
                      type="text"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="e.g. 5 vials, 20 tablets"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </>
              )}

              {formData.emergency_type === EMERGENCY_TYPES.DOCTOR && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Describe Symptoms
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your symptoms or medical emergency..."
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white resize-none"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Area"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="+1 234 567 890"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Urgency Level
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value={URGENCY_LEVELS.CRITICAL}>Critical (Immediate)</option>
                  <option value={URGENCY_LEVELS.URGENT}>Urgent</option>
                  <option value={URGENCY_LEVELS.NORMAL}>Normal</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-4 py-2.5 font-medium rounded-lg transition-colors disabled:opacity-50 ${
                    formData.emergency_type === EMERGENCY_TYPES.BLOOD
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : formData.emergency_type === EMERGENCY_TYPES.MEDICINE
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-purple-500 hover:bg-purple-600 text-white"
                  }`}
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Donor Registration Modal */}
      {showDonorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Register as Blood Donor</h3>
              <button
                onClick={() => setShowDonorModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleDonorRegistration} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Blood Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_TYPES.map(bt => (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => setDonorFormData(prev => ({ ...prev, bloodType: bt }))}
                      className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                        donorFormData.bloodType === bt
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={donorFormData.location}
                  onChange={handleDonorInputChange}
                  placeholder="City, Area"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={donorFormData.phone}
                  onChange={handleDonorInputChange}
                  placeholder="+1 234 567 890"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="available"
                  checked={donorFormData.available}
                  onChange={handleDonorInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  I am currently available to donate
                </label>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  By registering, you agree to be contacted for blood donation requests matching your blood type.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDonorModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Register as Donor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Emergency;

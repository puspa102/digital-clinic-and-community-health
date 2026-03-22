import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { emergencyAPI, handleApiError } from "../services/api";
import {
  Droplets,
  Pill,
  Users,
  Clock,
  MapPin,
  Activity,
  Plus,
  X,
  HeartPulse,
  CheckCircle,
  Search,
  Stethoscope,
  Trash2,
  AlertCircle,
  Siren,
  Phone,
  Calendar,
  Filter,
  MessageCircle,
} from "lucide-react";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const URGENCY_LEVELS = ["Critical", "High", "Medium", "Low"];

const Emergency = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // -- STATE --
  const [publicEmergencies, setPublicEmergencies] = useState([]);
  const [myEmergencies, setMyEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'blood', 'medicine', 'doctor'
  const [bloodFilter, setBloodFilter] = useState("All");

  // Modal
  const [modalType, setModalType] = useState(null); // 'blood' | 'medicine' | 'doctor' | 'donor'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    bloodType: "O+",
    units: "1",
    medicineName: "",
    quantity: "1",
    location: "",
    urgency: "High",
    contact: "",
  });

  // -- DATA FETCHING --
  const fetchData = useCallback(async () => {
    try {
      const [publicRes, myRes] = await Promise.all([
        emergencyAPI.getPublicEmergencies(),
        user ? emergencyAPI.getMyEmergencies() : Promise.resolve({ data: [] }),
      ]);

      if (publicRes.success) {
        setPublicEmergencies(publicRes.data || []);
      }

      if (myRes.success || Array.isArray(myRes.data)) {
        setMyEmergencies(myRes.data || []);
      }

      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      if (loading) {
        setError(handleApiError(err).message);
      }
    } finally {
      setLoading(false);
    }
  }, [user, loading]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

  // -- HANDLERS --
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let type = "Blood";
      let description = "";

      if (modalType === "blood") {
        type = "Blood";
        description = `Blood Type: ${formData.bloodType}, Units: ${formData.units}, Location: ${formData.location}, Contact: ${formData.contact}, Urgency: ${formData.urgency}, Notes: ${formData.description}`;
      } else if (modalType === "medicine") {
        type = "Medicine";
        description = `Medicine: ${formData.medicineName}, Qty: ${formData.quantity}, Location: ${formData.location}, Contact: ${formData.contact}, Urgency: ${formData.urgency}, Notes: ${formData.description}`;
      } else if (modalType === "doctor") {
        type = "Doctor";
        description = `Symptoms: ${formData.description}, Location: ${formData.location}, Contact: ${formData.contact}, Urgency: ${formData.urgency}`;
      }

      await emergencyAPI.createEmergency({
        emergency_type: type,
        description,
        latitude: 27.7172,
        longitude: 85.324,
      });

      setSuccessMsg("Emergency broadcasted successfully!");
      fetchData();

      setTimeout(() => {
        setModalType(null);
        setSuccessMsg(null);
        setFormData({
          description: "",
          bloodType: "O+",
          units: "1",
          medicineName: "",
          quantity: "1",
          location: "",
          urgency: "High",
          contact: user?.phone || "",
        });
      }, 2000);
    } catch (err) {
      setError(handleApiError(err).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this request?"))
      return;

    try {
      await emergencyAPI.cancelEmergency(id);
      setSuccessMsg("Request cancelled.");
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(handleApiError(err).message);
    }
  };

  const handleAcceptRequest = async (id) => {
    if (
      !window.confirm(
        "Accept this emergency? You will be responsible for helping.",
      )
    )
      return;

    try {
      await emergencyAPI.acceptEmergency(id, user?.id);
      setSuccessMsg("Request accepted! Please contact the requester.");
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(handleApiError(err).message);
    }
  };

  const handleChat = (id) => {
    if (!id) return;
    navigate("/chat", { state: { recipientId: id } });
  };

  // -- HELPERS --
  const parseDescription = (desc) => {
    if (!desc) return {};
    const parts = {};
    desc.split(", ").forEach((part) => {
      const [key, ...val] = part.split(": ");
      if (key && val.length) {
        parts[key.trim()] = val.join(": ").trim();
      }
    });
    return parts;
  };

  const getBloodTypeBadge = (desc) => {
    if (!desc) return null;
    const match = desc.match(/Blood Type:\s*([ABO]+[+-])/i);
    return match ? match[1] : null;
  };

  const canAccept = user && ["Doctor", "Pharmacy", "Admin"].includes(user.role);

  // -- FILTERING --
  const filteredEmergencies = publicEmergencies.filter((e) => {
    if (activeTab === "all") return true;
    if (activeTab === "blood") return e.emergency_type === "Blood";
    if (activeTab === "medicine") return e.emergency_type === "Medicine";
    if (activeTab === "doctor") return e.emergency_type === "Doctor";
    return true;
  });

  const displayEmergencies =
    activeTab === "blood" && bloodFilter !== "All"
      ? filteredEmergencies.filter((e) =>
          e.description.includes(`Blood Type: ${bloodFilter}`),
        )
      : filteredEmergencies;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        {/* HEADER SECTION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 dark:bg-rose-900/10 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -ml-32 -mb-32 opacity-50"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <Siren className="text-rose-500 animate-pulse" size={32} />
                Emergency Response
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-xl">
                Real-time coordination for life-saving Blood, Medicine, and
                Doctor needs.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalType("blood")}
                className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-rose-200 transform hover:-translate-y-0.5"
              >
                <Droplets size={18} /> Request Blood
              </button>
              <button
                onClick={() => setModalType("medicine")}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-sky-200 transform hover:-translate-y-0.5"
              >
                <Pill size={18} /> Medicine
              </button>
              <button
                onClick={() => setModalType("doctor")}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-violet-200 transform hover:-translate-y-0.5"
              >
                <Stethoscope size={18} /> Doctor
              </button>
            </div>
          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="mb-6 bg-rose-50 text-rose-700 p-4 rounded-xl border border-rose-200 flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X size={16} />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 flex items-center gap-3 animate-in slide-in-from-top-2">
            <CheckCircle size={20} />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* TABS & FILTERS */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[
              { id: "all", label: "All Needs", icon: Activity },
              { id: "blood", label: "Blood", icon: Droplets },
              { id: "medicine", label: "Medicine", icon: Pill },
              { id: "doctor", label: "Doctor", icon: Stethoscope },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "blood" && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400 uppercase mr-2">
                Filter:
              </span>
              <button
                onClick={() => setBloodFilter("All")}
                className={`px-3 py-1 text-xs font-bold rounded-full border transition-all whitespace-nowrap ${
                  bloodFilter === "All"
                    ? "bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-600"
                    : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                }`}
              >
                All
              </button>
              {BLOOD_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setBloodFilter(type)}
                  className={`px-3 py-1 text-xs font-bold rounded-full border transition-all min-w-12 ${
                    bloodFilter === type
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-300 hover:text-rose-500"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: FEED */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Activity
                  className="animate-spin mb-4 text-indigo-500 dark:text-indigo-400"
                  size={48}
                />
                <p className="dark:text-slate-400">Scanning network...</p>
              </div>
            ) : displayEmergencies.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
                  <Siren size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                  No Active Requests
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  There are currently no emergency requests matching your
                  filters.
                </p>
              </div>
            ) : (
              displayEmergencies.map((req) => {
                const isBlood = req.emergency_type === "Blood";
                const isMed = req.emergency_type === "Medicine";
                const details = parseDescription(req.description);
                const bType =
                  isBlood && details["Blood Type"]
                    ? details["Blood Type"]
                    : getBloodTypeBadge(req.description);

                const icon = isBlood ? (
                  <Droplets size={20} className="text-rose-500" />
                ) : isMed ? (
                  <Pill size={20} className="text-sky-500" />
                ) : (
                  <HeartPulse size={20} className="text-violet-500" />
                );

                return (
                  <div
                    key={req.emergency_id}
                    className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:border-indigo-100 dark:hover:border-indigo-900 flex flex-col overflow-hidden"
                  >
                    {/* Header */}
                    <div
                      className={`flex justify-between items-start p-4 border-b ${
                        isBlood
                          ? "bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30"
                          : isMed
                            ? "bg-sky-50/50 dark:bg-sky-900/10 border-sky-100 dark:border-sky-900/30"
                            : "bg-violet-50/50 dark:bg-violet-900/10 border-violet-100 dark:border-violet-900/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm ${
                            isBlood
                              ? "text-rose-500 dark:text-rose-400"
                              : isMed
                                ? "text-sky-500 dark:text-sky-400"
                                : "text-violet-500 dark:text-violet-400"
                          }`}
                        >
                          {icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">
                            {isBlood
                              ? "Blood Needed"
                              : isMed
                                ? "Medicine Required"
                                : "Doctor Requested"}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <Clock size={12} />
                            {new Date(req.created_at).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-white dark:bg-slate-800 border ${
                          isBlood
                            ? "text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                            : isMed
                              ? "text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                              : "text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col flex-1 gap-4">
                      {/* Content Details */}
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 space-y-3">
                        {Object.keys(details).length === 0 ? (
                          <p className="text-sm text-slate-600">
                            {req.description}
                          </p>
                        ) : (
                          <>
                            {isBlood && (
                              <div className="flex gap-4">
                                <div className="flex-1 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm text-center">
                                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                                    Type
                                  </span>
                                  <span className="block text-lg font-black text-rose-600 dark:text-rose-400">
                                    {details["Blood Type"] || bType || "?"}
                                  </span>
                                </div>
                                <div className="flex-1 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm text-center">
                                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                                    Units
                                  </span>
                                  <span className="block text-lg font-black text-slate-700 dark:text-slate-200">
                                    {details["Units"] || "1"}
                                  </span>
                                </div>
                              </div>
                            )}

                            {isMed && (
                              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                                  Medicine
                                </span>
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-800 dark:text-white">
                                    {details["Medicine"] || "Unspecified"}
                                  </span>
                                  <span className="text-xs bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 px-2 py-1 rounded font-bold">
                                    Qty: {details["Qty"] || "1"}
                                  </span>
                                </div>
                              </div>
                            )}

                            {(details["Location"] || details["Symptoms"]) && (
                              <div className="space-y-2 pt-1">
                                {details["Symptoms"] && (
                                  <div className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <HeartPulse
                                      size={14}
                                      className="text-violet-500 mt-0.5 shrink-0"
                                    />
                                    <span className="font-medium">
                                      {details["Symptoms"]}
                                    </span>
                                  </div>
                                )}
                                <div className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                                  <MapPin
                                    size={14}
                                    className="text-slate-400 mt-0.5 shrink-0"
                                  />
                                  <span>
                                    {details["Location"] ||
                                      "No location provided"}
                                  </span>
                                </div>
                              </div>
                            )}

                            {details["Notes"] && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 italic pt-2 border-t border-slate-200 dark:border-slate-700">
                                "{details["Notes"]}"
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-3 mt-auto">
                        {details["Contact"] ? (
                          <a
                            href={`tel:${details["Contact"]}`}
                            className="col-span-1 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                          >
                            <Phone size={16} /> Call
                          </a>
                        ) : (
                          <button
                            disabled
                            className="col-span-1 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-100 dark:border-slate-800 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                          >
                            <Phone size={16} /> Call
                          </button>
                        )}

                        {/* Chat Button */}
                        {(user?.id === req.patient_id ? req.accepted_by : req.patient_id) && (
                          <button
                            onClick={() =>
                              handleChat(
                                user?.id === req.patient_id
                                  ? req.accepted_by
                                  : req.patient_id,
                              )
                            }
                            className="col-span-1 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                          >
                            <MessageCircle size={16} /> Chat
                          </button>
                        )}

                        {canAccept && (
                          <button
                            onClick={() =>
                              handleAcceptRequest(req.emergency_id)
                            }
                            className="col-span-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-slate-200 dark:shadow-none"
                          >
                            Accept Request <span className="opacity-75">→</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT: SIDEBAR */}
          <div className="space-y-6">
            {/* MY REQUESTS WIDGET */}
            {myEmergencies.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="text-indigo-500 dark:text-indigo-400" size={18} />
                  My Active Requests
                </h3>
                <div className="space-y-3">
                  {myEmergencies.map((req) => (
                    <div
                      key={req.emergency_id}
                      className="text-sm border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className={`font-bold text-xs ${
                            req.emergency_type === "Blood"
                              ? "text-rose-600 dark:text-rose-400"
                              : req.emergency_type === "Medicine"
                                ? "text-sky-600 dark:text-sky-400"
                                : "text-violet-600 dark:text-violet-400"
                          }`}
                        >
                          {req.emergency_type}
                        </span>
                        <button
                          onClick={() => handleCancelRequest(req.emergency_id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                          title="Cancel Request"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2">
                        {req.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DONOR CTA */}
            <div className="bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 p-6 text-center">
              <div className="bg-white dark:bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm text-emerald-600 dark:text-emerald-400">
                <Users size={24} />
              </div>
              <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                Become a Donor
              </h3>
              <p className="text-emerald-700 dark:text-emerald-400 text-xs mb-4 leading-relaxed">
                Join our verified donor network to receive alerts when someone
                nearby needs your blood type.
              </p>
              <button
                onClick={() => setModalType("donor")}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-200 transition-all"
              >
                Register Now
              </button>
            </div>

            {/* INFO WIDGET */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
              <h3 className="font-bold text-slate-800 dark:text-white mb-3 text-sm">
                Emergency Guide
              </h3>
              <ul className="space-y-3">
                <li className="flex gap-3 items-start text-xs text-slate-500">
                  <div className="bg-rose-100 text-rose-600 p-1 rounded shrink-0">
                    <Phone size={12} />
                  </div>
                  <span>
                    For immediate life-threatening emergencies, always call
                    national emergency services (100/102).
                  </span>
                </li>
                <li className="flex gap-3 items-start text-xs text-slate-500 dark:text-slate-400">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-1 rounded shrink-0">
                    <CheckCircle size={12} />
                  </div>
                  <span>
                    Your location is shared securely only with verified medical
                    responders.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {modalType === "blood" && (
                  <Droplets className="text-rose-500" />
                )}
                {modalType === "medicine" && <Pill className="text-sky-500" />}
                {modalType === "doctor" && (
                  <Stethoscope className="text-violet-500" />
                )}
                {modalType === "donor" && (
                  <Users className="text-emerald-500" />
                )}
                {modalType === "blood"
                  ? "Request Blood"
                  : modalType === "medicine"
                    ? "Request Medicine"
                    : modalType === "doctor"
                      ? "Request Doctor"
                      : "Register as Donor"}
              </h2>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleCreateRequest} className="space-y-4">
                {modalType === "donor" ? (
                  <div className="text-center py-6">
                    <div className="mx-auto w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                      <Users size={32} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                      Join the Network
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                      By registering, you agree to be contacted for emergency
                      blood donations in your area.
                    </p>
                    <div className="mb-4 text-left">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                        Blood Type
                      </label>
                      <select
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/50 transition-all outline-none text-slate-900 dark:text-white"
                        value={formData.bloodType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bloodType: e.target.value,
                          })
                        }
                      >
                        {BLOOD_TYPES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSuccessMsg("Registration feature coming soon!");
                        setModalType(null);
                      }}
                      className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Confirm Registration
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Dynamic Type Inputs */}
                      {modalType === "blood" && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                              Blood Type
                            </label>
                            <select
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900/50 transition-all outline-none text-slate-900 dark:text-white"
                              value={formData.bloodType}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  bloodType: e.target.value,
                                })
                              }
                            >
                              {BLOOD_TYPES.map((t) => (
                                <option key={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                              Units
                            </label>
                            <input
                              type="number"
                              min="1"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900/50 transition-all outline-none text-slate-900 dark:text-white"
                              value={formData.units}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  units: e.target.value,
                                })
                              }
                            />
                          </div>
                        </>
                      )}

                      {modalType === "medicine" && (
                        <>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                              Medicine Name
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900/50 transition-all outline-none text-slate-900 dark:text-white"
                              placeholder="e.g. Insulin, Ventolin"
                              value={formData.medicineName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  medicineName: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900/50 transition-all outline-none text-slate-900 dark:text-white"
                              value={formData.quantity}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  quantity: e.target.value,
                                })
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {modalType === "doctor" && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                          Symptoms / Situation
                        </label>
                        <textarea
                          rows="3"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900/50 transition-all outline-none text-slate-900 dark:text-white"
                          placeholder="Describe the medical situation..."
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          required
                        ></textarea>
                      </div>
                    )}

                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                          Location / Hospital
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all outline-none text-slate-900 dark:text-white"
                          placeholder="e.g. Bir Hospital"
                          value={formData.location}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                          Urgency Level
                        </label>
                        <select
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all outline-none text-slate-900 dark:text-white"
                          value={formData.urgency}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              urgency: e.target.value,
                            })
                          }
                        >
                          {URGENCY_LEVELS.map((u) => (
                            <option key={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all outline-none text-slate-900 dark:text-white"
                        placeholder="+977 98..."
                        value={formData.contact}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    {modalType !== "doctor" && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                          Additional Notes
                        </label>
                        <textarea
                          rows="2"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all outline-none text-slate-900 dark:text-white"
                          placeholder="Contact info, specific requirements..."
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                        ></textarea>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-4 py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all flex justify-center items-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none"
                    >
                      {isSubmitting ? (
                        <Activity className="animate-spin" size={20} />
                      ) : (
                        <>
                          <Siren size={20} /> Broadcast Request
                        </>
                      )}
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Emergency;

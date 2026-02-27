import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Clock, Plus, X, Save, Calendar, AlertCircle } from "lucide-react";
import api, { handleApiError } from "../../services/api";

const Schedule = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);

  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const [schedule, setSchedule] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/doctors/me");
      const profile = response.data.data;
      setDoctorProfile(profile);

      // Parse existing availability
      if (profile.availability_json) {
        setSchedule(profile.availability_json);
      }
      setError(null);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = (day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: [
        ...prev[day],
        {
          start_time: "09:00",
          end_time: "10:00",
          max_patients: 4,
        },
      ],
    }));
  };

  const removeTimeSlot = (day, index) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const updateTimeSlot = (day, index, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot,
      ),
    }));
  };

  const copySchedule = (fromDay, toDay) => {
    setSchedule((prev) => ({
      ...prev,
      [toDay]: [...prev[fromDay]],
    }));
  };

  const clearDay = (day) => {
    if (
      window.confirm(
        `Are you sure you want to clear all time slots for ${day}?`,
      )
    ) {
      setSchedule((prev) => ({
        ...prev,
        [day]: [],
      }));
    }
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.put(`/doctors/${doctorProfile.doctor_id}`, {
        availability_json: schedule,
      });
      setSuccess("Schedule updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              My Schedule
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your weekly availability and time slots
            </p>
          </div>
          <button
            onClick={handleSaveSchedule}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? "Saving..." : "Save Schedule"}
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-sm flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {success}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </p>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Schedule Guidelines</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                <li>Set your available time slots for each day of the week</li>
                <li>Specify the maximum number of patients per time slot</li>
                <li>
                  Patients can only book appointments during your available
                  hours
                </li>
                <li>You can copy schedules between days to save time</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="space-y-4">
          {daysOfWeek.map((day) => (
            <div
              key={day.key}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {day.label}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({schedule[day.key].length} time slots)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {schedule[day.key].length > 0 && (
                    <div className="relative group">
                      <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        Copy to...
                      </button>
                      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        {daysOfWeek
                          .filter((d) => d.key !== day.key)
                          .map((d) => (
                            <button
                              key={d.key}
                              onClick={() => copySchedule(day.key, d.key)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                            >
                              {d.label}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                  {schedule[day.key].length > 0 && (
                    <button
                      onClick={() => clearDay(day.key)}
                      className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => addTimeSlot(day.key)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Slot
                  </button>
                </div>
              </div>

              {/* Time Slots */}
              {schedule[day.key].length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No time slots set for this day</p>
                  <button
                    onClick={() => addTimeSlot(day.key)}
                    className="mt-3 text-blue-600 dark:text-blue-400 text-sm hover:underline"
                  >
                    Add your first time slot
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedule[day.key].map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) =>
                              updateTimeSlot(
                                day.key,
                                index,
                                "start_time",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) =>
                              updateTimeSlot(
                                day.key,
                                index,
                                "end_time",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Max Patients
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={slot.max_patients}
                            onChange={(e) =>
                              updateTimeSlot(
                                day.key,
                                index,
                                "max_patients",
                                parseInt(e.target.value) || 1,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeTimeSlot(day.key, index)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove time slot"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Weekly Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {Object.values(schedule).reduce(
                  (sum, day) => sum + day.length,
                  0,
                )}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total Slots
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {
                  daysOfWeek.filter((day) => schedule[day.key].length > 0)
                    .length
                }
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Active Days
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {Object.values(schedule).reduce(
                  (sum, day) =>
                    sum +
                    day.reduce(
                      (total, slot) => total + (slot.max_patients || 0),
                      0,
                    ),
                  0,
                )}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Weekly Capacity
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                ${doctorProfile?.consultation_fee || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Consultation Fee
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Schedule;

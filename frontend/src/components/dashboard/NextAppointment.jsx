import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Stethoscope, Building2, Wallet, Video } from "lucide-react";

const NextAppointment = ({ 
  nextConfirmed, 
  confirmedAppointments, 
  getMeetingTimeLabel, 
  setQrAppointment, 
  setShowQrModal 
}) => {
  if (!nextConfirmed) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Confirmed Appointment</h2>
        {confirmedAppointments.length > 1 && (
          <Link to="/patient/appointments" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold transition-colors">
            View All
          </Link>
        )}
      </div>
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            {/* Doctor Info */}
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-500 rounded-full"></div>
                <Stethoscope className="w-8 h-8 text-white relative z-10" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Dr. {nextConfirmed.Doctor?.User?.full_name || "Doctor"}
                  </h3>
                  <span className="px-3 py-1 text-[11px] font-black rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 uppercase tracking-widest border border-green-200 dark:border-green-800">
                    Confirmed
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                  {nextConfirmed.Doctor?.specialization || "Specialist"} • {nextConfirmed.Doctor?.hospital_name || "Hospital"}
                </p>
                <div className="flex items-center gap-5 mt-4 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-xl">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    {nextConfirmed.Pharmacy?.pharmacy_name}
                  </span>
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
                  <span className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-amber-500" />
                    Fee: Rs. {nextConfirmed.payment_amount || 0}
                    <span className={`text-xs ml-1 px-2 py-0.5 rounded-md ${nextConfirmed.payment_status === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"}`}>
                      {nextConfirmed.payment_status === "paid" ? "Paid" : "Pending"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {nextConfirmed.qr_token && (
              <button
                onClick={() => { setQrAppointment(nextConfirmed); setShowQrModal(true); }}
                className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-300 shrink-0 group"
                title="View QR Code"
              >
                <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                  <QRCodeSVG
                    value={JSON.stringify({ type: "appointment", token: nextConfirmed.qr_token, id: nextConfirmed.appointment_id })}
                    size={72}
                    level="L"
                  />
                </div>
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 tracking-wide">ID #{nextConfirmed.appointment_id}</span>
              </button>
            )}
          </div>
        </div>

        {/* Meeting / Notes Bar */}
        {(nextConfirmed.consultation_type === "online" && nextConfirmed.meeting_link) || nextConfirmed.doctor_notes ? (
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-t border-blue-100 dark:border-blue-800/30">
            {nextConfirmed.consultation_type === "online" && nextConfirmed.meeting_link && (
              <a
                href={nextConfirmed.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 transition-colors bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
              >
                <Video className="w-5 h-5 text-blue-500" />
                Join Video Meeting
                {getMeetingTimeLabel(nextConfirmed) && (
                  <span className="text-blue-500 dark:text-blue-300 font-medium ml-1 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">
                    ({getMeetingTimeLabel(nextConfirmed)})
                  </span>
                )}
              </a>
            )}
            {nextConfirmed.doctor_notes && (
              <div className="mt-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">Note:</span> 
                  {nextConfirmed.doctor_notes}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NextAppointment;

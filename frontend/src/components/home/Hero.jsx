import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Shield, Clock, Stethoscope, CheckCircle, Pill } from "lucide-react";

const Hero = ({ isVisible }) => {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800/50 backdrop-blur-sm">
              <Sparkles size={16} className="text-blue-500" />
              <span className="text-[12px] font-semibold text-blue-600 dark:text-blue-400">Healthcare Made Simple</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Your Health,{" "}
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Our Priority
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg">
              Connect with top healthcare professionals, manage appointments, and access your medical records - all in one seamless experience.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all"
              >
                Start Your Journey
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all backdrop-blur-sm"
              >
                Learn More
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-800 mt-8">
              <div className="flex items-center gap-2 font-medium">
                <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/40 flex items-center justify-center">
                   <Shield size={16} className="text-green-500" />
                </div>
                <span className="text-[13px] text-gray-600 dark:text-gray-400">Secure & Private</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
                   <Clock size={16} className="text-blue-500" />
                </div>
                <span className="text-[13px] text-gray-600 dark:text-gray-400">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image/Illustration */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative">
              {/* Main Card */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <Stethoscope size={32} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Book Appointment</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Quick & Easy</p>
                  </div>
                </div>

                {/* Mock Doctor Selection */}
                <div className="space-y-3 mb-6">
                  {[
                    { name: "Dr. Priya Patel", specialty: "General Physician", time: "10:00 AM" },
                    { name: "Dr. Raj Kumar", specialty: "Cardiologist", time: "2:30 PM" },
                    { name: "Dr. Sita Sharma", specialty: "Pediatrician", time: "4:00 PM" },
                  ].map((doc, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-500 cursor-default ${
                        i === 0
                          ? "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20"
                          : "border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                      }`}
                      style={{ animationDelay: `${i * 200}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
                          i === 0 ? "bg-gradient-to-br from-blue-400 to-blue-600" : i === 1 ? "bg-gradient-to-br from-green-400 to-green-600" : "bg-gradient-to-br from-purple-400 to-purple-600"
                        }`}>
                          {doc.name.charAt(4)}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900 dark:text-white">{doc.name}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">{doc.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] font-medium text-blue-600 dark:text-blue-400">{doc.time}</p>
                        <p className="text-[10px] text-gray-400">Today</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                  Confirm Booking
                </button>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/20 dark:border-gray-700/50 animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle size={20} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-900 dark:text-white">Appointment Confirmed!</p>
                    <p className="text-[10px] text-gray-500">Dr. Priya - 10:00 AM</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/20 dark:border-gray-700/50 animate-bounce-slow delay-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Pill size={20} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-900 dark:text-white">Prescription Ready</p>
                    <p className="text-[10px] text-gray-500">Pickup at City Pharmacy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

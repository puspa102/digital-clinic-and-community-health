import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Stethoscope,
  Calendar,
  Pill,
  Shield,
  Clock,
  Users,
  Heart,
  Activity,
  ChevronRight,
  Star,
  Phone,
  Mail,
  MapPin,
  Sun,
  Moon,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Building2,
  UserCheck,
  FileText,
} from "lucide-react";

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [counters, setCounters] = useState({ doctors: 0, patients: 0, appointments: 0, pharmacies: 0 });

  useEffect(() => {
    setIsVisible(true);
    
    // Animate counters
    const targets = { doctors: 150, patients: 5000, appointments: 12000, pharmacies: 50 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setCounters({
        doctors: Math.floor(targets.doctors * easeOut),
        patients: Math.floor(targets.patients * easeOut),
        appointments: Math.floor(targets.appointments * easeOut),
        pharmacies: Math.floor(targets.pharmacies * easeOut),
      });
      
      if (step >= steps) clearInterval(timer);
    }, interval);

    // Auto-rotate features
    const featureTimer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(featureTimer);
    };
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Easy Appointments",
      description: "Book appointments with top doctors in just a few clicks. Choose your preferred time slot.",
      color: "blue",
    },
    {
      icon: Pill,
      title: "Digital Prescriptions",
      description: "Receive and manage prescriptions digitally. Order medicines from nearby pharmacies.",
      color: "green",
    },
    {
      icon: FileText,
      title: "Medical Records",
      description: "Access your complete medical history anytime, anywhere. Secure and organized.",
      color: "purple",
    },
    {
      icon: Building2,
      title: "Pharmacy Network",
      description: "Connect with verified pharmacies for medicine delivery and health consultations.",
      color: "orange",
    },
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Cardiologist",
      content: "Digital Clinic has transformed how I manage patient appointments and records. Highly efficient!",
      rating: 5,
      avatar: "S",
    },
    {
      name: "Ram Sharma",
      role: "Patient",
      content: "Booking appointments is now so easy. I can see my prescriptions and medical history anytime.",
      rating: 5,
      avatar: "R",
    },
    {
      name: "City Pharmacy",
      role: "Pharmacy Partner",
      content: "The integration with doctors and patients has streamlined our prescription handling process.",
      rating: 5,
      avatar: "C",
    },
  ];

  const getFeatureColor = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600",
    };
    return colors[color];
  };

  const getFeatureBg = (color) => {
    const colors = {
      blue: "bg-blue-50 dark:bg-blue-900/20",
      green: "bg-green-50 dark:bg-green-900/20",
      purple: "bg-purple-50 dark:bg-purple-900/20",
      orange: "bg-orange-50 dark:bg-orange-900/20",
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Activity size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Digital Clinic</h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 -mt-0.5">Community Health</p>
              </div>
            </div>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[13px] font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-[13px] font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                How it Works
              </a>
              <a href="#testimonials" className="text-[13px] font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Reviews
              </a>
              <a href="#contact" className="text-[13px] font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Contact
              </a>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-gray-500" />}
              </button>
              
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-[13px] font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-[13px] font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-[13px] font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
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
                Connect with top healthcare professionals, manage appointments, and access your medical records - all in one place.
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
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Learn More
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Shield size={20} className="text-green-500" />
                  <span className="text-[13px] text-gray-600 dark:text-gray-400">Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-blue-500" />
                  <span className="text-[13px] text-gray-600 dark:text-gray-400">24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image/Illustration */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative">
                {/* Main Card */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <Stethoscope size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Book Appointment</h3>
                      <p className="text-gray-500 dark:text-gray-400">Quick & Easy</p>
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
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-500 ${
                          i === 0
                            ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800"
                        }`}
                        style={{ animationDelay: `${i * 200}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            i === 0 ? "bg-blue-500" : i === 1 ? "bg-green-500" : "bg-purple-500"
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
                <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 border border-gray-100 dark:border-gray-800 animate-bounce-slow">
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

                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 border border-gray-100 dark:border-gray-800 animate-bounce-slow delay-500">
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

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Doctors", value: counters.doctors, suffix: "+", icon: Stethoscope, color: "blue" },
              { label: "Happy Patients", value: counters.patients, suffix: "+", icon: Users, color: "green" },
              { label: "Appointments", value: counters.appointments, suffix: "+", icon: Calendar, color: "purple" },
              { label: "Pharmacies", value: counters.pharmacies, suffix: "+", icon: Building2, color: "orange" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                  stat.color === "blue" ? "bg-blue-100 dark:bg-blue-900/30" :
                  stat.color === "green" ? "bg-green-100 dark:bg-green-900/30" :
                  stat.color === "purple" ? "bg-purple-100 dark:bg-purple-900/30" :
                  "bg-orange-100 dark:bg-orange-900/30"
                }`}>
                  <stat.icon size={24} className={
                    stat.color === "blue" ? "text-blue-500" :
                    stat.color === "green" ? "text-green-500" :
                    stat.color === "purple" ? "text-purple-500" :
                    "text-orange-500"
                  } />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value.toLocaleString()}{stat.suffix}
                </p>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-[12px] font-semibold text-blue-600 dark:text-blue-400 mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A comprehensive healthcare platform designed to make your medical journey seamless and efficient.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`group p-6 rounded-2xl border transition-all duration-500 cursor-pointer ${
                  activeFeature === i
                    ? `${getFeatureBg(feature.color)} border-transparent shadow-lg`
                    : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-transparent hover:shadow-lg"
                }`}
                onMouseEnter={() => setActiveFeature(i)}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getFeatureColor(feature.color)} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full text-[12px] font-semibold text-green-600 dark:text-green-400 mb-4">
              How it Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple Steps to Better Health
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                description: "Sign up as a patient, doctor, or pharmacy. Quick verification process.",
                icon: UserCheck,
                color: "blue",
              },
              {
                step: "02",
                title: "Book Appointment",
                description: "Choose your doctor, select a convenient time, and confirm your booking.",
                icon: Calendar,
                color: "green",
              },
              {
                step: "03",
                title: "Get Care",
                description: "Visit the doctor, receive prescriptions, and order medicines digitally.",
                icon: Heart,
                color: "purple",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all">
                  <span className={`text-6xl font-bold ${
                    item.color === "blue" ? "text-blue-100 dark:text-blue-900/30" :
                    item.color === "green" ? "text-green-100 dark:text-green-900/30" :
                    "text-purple-100 dark:text-purple-900/30"
                  }`}>
                    {item.step}
                  </span>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 -mt-6 ${
                    item.color === "blue" ? "bg-blue-500" :
                    item.color === "green" ? "bg-green-500" :
                    "bg-purple-500"
                  }`}>
                    <item.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-[13px] text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight size={24} className="text-gray-300 dark:text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-full text-[12px] font-semibold text-purple-600 dark:text-purple-400 mb-4">
              Reviews
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What People Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((item, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(item.rating)].map((_, j) => (
                    <Star key={j} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6 italic">"{item.content}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    i === 0 ? "bg-green-500" : i === 1 ? "bg-blue-500" : "bg-orange-500"
                  }`}>
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAxOGMtMy4zMTQgMC02LTIuNjg2LTYtNnMyLjY4Ni02IDYtNiA2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Healthcare?
              </h2>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of patients, doctors, and pharmacies already using Digital Clinic for better healthcare management.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-medium rounded-xl hover:shadow-xl transition-all"
                >
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-medium rounded-xl hover:bg-white/10 transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 dark:bg-gray-950 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Activity size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Digital Clinic</h3>
                  <p className="text-[10px] text-gray-400">Community Health</p>
                </div>
              </div>
              <p className="text-gray-400 text-[13px] max-w-md mb-6">
                A comprehensive digital healthcare platform connecting patients, doctors, and pharmacies for better health outcomes.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Mail size={18} className="text-gray-400" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Phone size={18} className="text-gray-400" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <MapPin size={18} className="text-gray-400" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {["About Us", "Features", "How it Works", "Testimonials", "Contact"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[13px] text-gray-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Users */}
            <div>
              <h4 className="font-semibold mb-4">For Users</h4>
              <ul className="space-y-3">
                {["Patient Portal", "Doctor Portal", "Pharmacy Portal", "Admin Portal", "Emergency"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[13px] text-gray-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[12px] text-gray-400">
              © {new Date().getFullYear()} Digital Clinic. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-[12px] text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-[12px] text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default Home;

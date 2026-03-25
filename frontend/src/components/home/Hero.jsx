import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Activity,
  Sparkles,
  Heart,
  Zap,
  Shield,
} from "lucide-react";

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1758691462126-2ee47c8bf9e7?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Modern Healthcare",
    highlight: "At Your Fingertips",
    description:
      "Connect seamlessly with top doctors, manage your prescriptions, and access pharmacy services instantly. Experience the future of medical care today.",
    icon: Heart,
    primaryCta: { text: "Get Started", link: "/register" },
    secondaryCta: { text: "Watch Demo", link: "#how-it-works" },
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    title: "Expert Doctors",
    highlight: "Available 24/7",
    description:
      "Consult with specialized healthcare professionals from the comfort of your home. Video consultations, chat support, and more.",
    icon: Activity,
    primaryCta: { text: "Find a Doctor", link: "/register" },
    secondaryCta: { text: "Our Specialists", link: "#features" },
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    title: "Pharmacy Services",
    highlight: "Delivered Fast",
    description:
      "Order medicines online and get them delivered to your doorstep quickly and securely. Digital prescriptions made easy.",
    icon: Zap,
    primaryCta: { text: "Order Medicines", link: "/register" },
    secondaryCta: { text: "View Pharmacies", link: "#how-it-works" },
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1633488781325-d36e6818d0c8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Health Records",
    highlight: "Always Secure",
    description:
      "Keep your complete medical history secure and accessible. Manage your health records, test results, prescriptions, and medical documents in one encrypted vault.",
    icon: Shield,
    primaryCta: { text: "View Records", link: "/register" },
    secondaryCta: { text: "Learn More", link: "#features" },
  },
];

const Hero = ({ isVisible }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(timer);
  }, [autoPlay]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setAutoPlay(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  return (
    <section className="relative w-full overflow-hidden bg-slate-900 min-h-screen flex items-center">
      {/* Animated Background Solid Colors */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl opacity-40 animate-pulse"></div>
      </div>

      {/* Slides Container */}
      {slides.map((slide, index) => {
        const SlideIcon = slide.icon;
        const isActive = index === currentSlide;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-linear ${
                  isActive ? "scale-110" : "scale-100"
                }`}
              />
              {/* Solid Color Overlays */}
              <div className="absolute inset-0 bg-black/80"></div>
              <div className="absolute inset-0 bg-slate-900/30"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
              <div
                className={`max-w-3xl w-full transition-all duration-1000 delay-300 ${
                  isVisible && isActive
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                {/* Icon Badge */}
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-teal-500/20 border border-teal-400/30 backdrop-blur-md mb-6 group cursor-default">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-500 shadow-lg shadow-teal-500/50">
                    <SlideIcon size={18} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-teal-300">
                    Healthcare Innovation
                  </span>
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse ml-auto"></div>
                </div>

                {/* Main Title */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-6 text-white drop-shadow-2xl">
                  {slide.title} <br className="hidden sm:block" />
                  <span className="text-teal-300">{slide.highlight}</span>
                </h1>

                {/* Description */}
                <p className="text-xl sm:text-2xl text-slate-200 mb-10 max-w-2xl leading-relaxed font-semibold drop-shadow-lg">
                  {slide.description}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-start gap-5 mb-10">
                  <Link
                    to={slide.primaryCta.link}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/40 hover:shadow-teal-500/60 transition-all duration-300 hover:-translate-y-1 group"
                  >
                    {slide.primaryCta.text}
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                  <a
                    href={slide.secondaryCta.link}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 text-white font-semibold rounded-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <PlayCircle size={20} />
                    {slide.secondaryCta.text}
                  </a>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-6 text-slate-300 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                    <span>Trusted by 10k+ users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                    <span>500+ verified doctors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    <span>24/7 support available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Slide Indicators */}
          <div className="flex gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-500 backdrop-blur-sm ${
                  index === currentSlide
                    ? "bg-teal-400 w-8 shadow-lg shadow-teal-400/50"
                    : "bg-white/30 w-2 hover:bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-3">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-110 active:scale-95 group"
              aria-label="Previous slide"
            >
              <ChevronLeft
                size={24}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </button>
            <button
              onClick={nextSlide}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-110 active:scale-95 group"
              aria-label="Next slide"
            >
              <ChevronRight
                size={24}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Stats Card (Right Side) */}
      <div className="absolute top-1/3 right-8 z-20 hidden lg:block animate-float">
        <div className="bg-white/10 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 rounded-2xl p-6 shadow-2xl max-w-xs">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-teal-400 animate-pulse-glow" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">
              System Status
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-white font-semibold mb-1">Operational</p>
              <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full w-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-2xl font-semibold text-white">10k+</p>
                <p className="text-xs text-slate-400">Active Users</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">500+</p>
                <p className="text-xs text-slate-400">Doctors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-slate-900/80 z-10"></div>
    </section>
  );
};

export default Hero;

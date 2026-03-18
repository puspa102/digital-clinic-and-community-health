import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Activity,
} from "lucide-react";

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop",
    title: "Modern Healthcare",
    highlight: "At Your Fingertips",
    description:
      "Connect seamlessly with top doctors, manage your prescriptions, and access pharmacy services instantly. Experience the future of medical care today.",
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
    primaryCta: { text: "Order Medicines", link: "/register" },
    secondaryCta: { text: "View Pharmacies", link: "#how-it-works" },
  },
];

const Hero = ({ isVisible }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000); // Change slide every 6 seconds
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <section className="relative h-[600px] lg:h-[750px] w-full overflow-hidden bg-gray-900">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-linear ${
                index === currentSlide ? "scale-105" : "scale-100"
              }`}
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent dark:from-black/90 dark:via-gray-900/60"></div>
          </div>

          {/* Content Overlay */}
          <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <div
              className={`max-w-3xl transition-all duration-1000 delay-300 ${
                isVisible && index === currentSlide
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-6 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                #1 Digital Health Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6 drop-shadow-lg">
                {slide.title} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  {slide.highlight}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed drop-shadow-md">
                {slide.description}
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  to={slide.primaryCta.link}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
                >
                  {slide.primaryCta.text}
                  <ArrowRight size={18} />
                </Link>
                <a
                  href={slide.secondaryCta.link}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl backdrop-blur-md transition-all"
                >
                  <PlayCircle size={18} />
                  {slide.secondaryCta.text}
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Dots */}
          <div className="flex gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-blue-500 w-8"
                    : "bg-white/40 w-2 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Strip Overlay (Optional decoration) */}
      <div className="absolute bottom-0 right-0 z-20 hidden lg:block p-8">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex gap-8 text-white">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Activity size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Status
              </span>
            </div>
            <p className="font-semibold">System Operational</p>
          </div>
          <div className="w-px bg-white/10"></div>
          <div>
            <p className="text-2xl font-bold">10k+</p>
            <p className="text-xs text-gray-300">Active Users</p>
          </div>
          <div className="w-px bg-white/10"></div>
          <div>
            <p className="text-2xl font-bold">500+</p>
            <p className="text-xs text-gray-300">Doctors</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

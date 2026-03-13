import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import HomeNavbar from "../components/home/HomeNavbar";
import Hero from "../components/home/Hero";
import Stats from "../components/home/Stats";
import Features from "../components/home/Features";
import HowItWorks from "../components/home/HowItWorks";
import Testimonials from "../components/home/Testimonials";
import HomeCTA from "../components/home/HomeCTA";
import HomeFooter from "../components/home/HomeFooter";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
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

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <HomeNavbar isDark={isDark} toggleTheme={toggleTheme} isAuthenticated={isAuthenticated} />
      <Hero isVisible={isVisible} />
      <Stats counters={counters} />
      <Features />
      <HowItWorks />
      <Testimonials />
      <HomeCTA />
      <HomeFooter />

      {/* Custom Animations defined over all blocks */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
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

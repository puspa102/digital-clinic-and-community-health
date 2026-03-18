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
  const [counters, setCounters] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
    pharmacies: 0,
  });

  useEffect(() => {
    setIsVisible(true);

    // Animate counters
    const targets = {
      doctors: 150,
      patients: 5000,
      appointments: 12000,
      pharmacies: 50,
    };
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30 relative">
      {/* Global Background Gradients & Texture */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

        {/* Vibrant Gradient Orbs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-[30%] -right-[10%] w-[600px] h-[600px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />
          <div className="absolute -bottom-[10%] left-[20%] w-[700px] h-[700px] bg-teal-400/20 dark:bg-teal-600/10 rounded-full blur-[120px] animate-pulse delay-2000" />
        </div>
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <HomeNavbar
          isDark={isDark}
          toggleTheme={toggleTheme}
          isAuthenticated={isAuthenticated}
        />

        {/* Hero Section */}
        <Hero isVisible={isVisible} />

        {/* Main Content */}
        <div className="relative">
          <Stats counters={counters} />
          <Features />
          <HowItWorks />
          <Testimonials />
          <HomeCTA />
        </div>

        {/* Footer */}
        <HomeFooter />
      </div>
    </div>
  );
};

export default Home;

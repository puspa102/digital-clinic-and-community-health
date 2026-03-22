import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HomeCTA = () => {
  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-600 via-teal-500 to-indigo-600 px-6 py-16 sm:px-16 sm:py-20 lg:flex lg:items-center lg:justify-between lg:px-20 shadow-2xl shadow-teal-500/30">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 -mt-20 -ml-20 w-60 h-60 rounded-full bg-white/20 blur-3xl opacity-40"></div>
          <div className="absolute bottom-0 right-0 -mb-20 -mr-20 w-60 h-60 rounded-full bg-indigo-600/20 blur-3xl opacity-40"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

          <div className="relative z-10 text-center lg:text-left lg:max-w-xl">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
              <span className="block">Transform Your</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-100">
                Healthcare Journey
              </span>
            </h2>
            <p className="mt-6 text-lg text-cyan-50 leading-relaxed max-w-2xl">
              Join thousands of patients, doctors, and pharmacies who trust
              Digital Clinic for better healthcare outcomes. Get started today
              with our comprehensive platform.
            </p>
          </div>

          <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-4 lg:mt-0 lg:shrink-0">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-teal-600 bg-white hover:bg-cyan-50 hover:shadow-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              Get Started Today
              <ArrowRight className="ml-2 -mr-1 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/40 hover:border-white/80 text-base font-bold rounded-xl text-white backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCTA;

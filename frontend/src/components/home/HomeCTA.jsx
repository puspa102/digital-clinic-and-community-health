import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HomeCTA = () => {
  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-blue-600 px-6 py-16 sm:px-16 sm:py-20 lg:flex lg:items-center lg:justify-between lg:px-20">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 -mt-10 -ml-10 w-40 h-40 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 -mb-10 -mr-10 w-40 h-40 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

          <div className="relative z-10 text-center lg:text-left lg:max-w-xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block text-blue-200">
                Join our community today.
              </span>
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Experience the future of healthcare. Whether you are a patient,
              doctor, or pharmacy, we have the right tools for you.
            </p>
          </div>

          <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-4 lg:mt-0 lg:shrink-0">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl text-blue-600 bg-white hover:bg-blue-50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              Get Started
              <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-blue-400 text-base font-bold rounded-xl text-white hover:bg-blue-700 hover:border-blue-500 transition-all duration-300"
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

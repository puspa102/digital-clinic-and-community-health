import {
  Activity,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import logo from "../../assets/logo.svg";

const HomeFooter = () => {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Digital Clinic"
                className="w-10 h-10 shadow-lg shadow-teal-500/20"
              />
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
                  Digital Clinic
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Community Health
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-medium">
              Transforming healthcare with accessible, efficient, and
              patient-centered digital solutions for everyone.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-teal-500 hover:to-indigo-500 text-gray-600 dark:text-gray-400 hover:text-white transition-all duration-300 flex items-center justify-center group hover:scale-110"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-teal-500 hover:to-indigo-500 text-gray-600 dark:text-gray-400 hover:text-white transition-all duration-300 flex items-center justify-center group hover:scale-110"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-teal-500 hover:to-indigo-500 text-gray-600 dark:text-gray-400 hover:text-white transition-all duration-300 flex items-center justify-center group hover:scale-110"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-teal-500 hover:to-indigo-500 text-gray-600 dark:text-gray-400 hover:text-white transition-all duration-300 flex items-center justify-center group hover:scale-110"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-indigo-500 rounded-full" />
              Company
            </h3>
            <ul className="space-y-3 text-sm">
              {["About Us", "Careers", "Blog", "Press"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-indigo-500 rounded-full" />
              Services
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                "Find a Doctor",
                "Online Pharmacy",
                "Emergency Care",
                "Health Records",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-indigo-500 rounded-full" />
              Contact
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer font-medium">
                <MapPin size={18} className="shrink-0 mt-0.5 text-teal-500" />
                <span>123 Health Street, Medical District, NY 10001</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer font-medium">
                <Phone size={18} className="shrink-0 text-teal-500" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer font-medium">
                <Mail size={18} className="shrink-0 text-teal-500" />
                <span>support@digitalclinic.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} Digital Clinic. All rights
            reserved. Designed with <span className="text-teal-500">❤️</span>
          </p>
          <div className="flex gap-8 text-sm">
            <a
              href="#"
              className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;

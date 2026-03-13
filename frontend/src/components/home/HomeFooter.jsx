import { Activity, Mail, Phone, MapPin } from "lucide-react";

const HomeFooter = () => {
  return (
    <footer id="contact" className="bg-gray-900 dark:bg-gray-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Activity size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Digital Clinic</h3>
                <p className="text-xs text-blue-400 font-medium tracking-wide uppercase mt-1">Community Health</p>
              </div>
            </div>
            <p className="text-gray-400 text-[14px] max-w-md mb-8 leading-relaxed">
              A comprehensive digital healthcare platform connecting patients, doctors, and pharmacies for better health outcomes and a healthier tomorrow.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800/50 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 group border border-gray-700/50">
                <Mail size={18} className="text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800/50 hover:bg-green-600 rounded-xl flex items-center justify-center transition-all duration-300 group border border-gray-700/50">
                <Phone size={18} className="text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800/50 hover:bg-orange-600 rounded-xl flex items-center justify-center transition-all duration-300 group border border-gray-700/50">
                <MapPin size={18} className="text-gray-400 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-6 tracking-wide">Quick Links</h4>
            <ul className="space-y-4">
              {["About Us", "Features", "How it Works", "Testimonials", "Contact"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-[14px] text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h4 className="font-semibold text-lg mb-6 tracking-wide">For Users</h4>
            <ul className="space-y-4">
              {["Patient Portal", "Doctor Portal", "Pharmacy Portal", "Admin Portal", "Emergency"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-[14px] text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/80 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[13px] text-gray-500">
            © {new Date().getFullYear()} Digital Clinic. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-[13px] text-gray-500 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-[13px] text-gray-500 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;

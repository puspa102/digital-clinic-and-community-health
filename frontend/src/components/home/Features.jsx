import { useState } from "react";
import { Calendar, Pill, FileText, Building2 } from "lucide-react";

const Features = () => {
  const [activeFeature, setActiveFeature] = useState(0);

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
      blue: "bg-blue-50 dark:bg-blue-900/20 shadow-blue-500/10",
      green: "bg-green-50 dark:bg-green-900/20 shadow-green-500/10",
      purple: "bg-purple-50 dark:bg-purple-900/20 shadow-purple-500/10",
      orange: "bg-orange-50 dark:bg-orange-900/20 shadow-orange-500/10",
    };
    return colors[color];
  };

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-[12px] font-semibold text-blue-600 dark:text-blue-400 mb-4 border border-blue-100 dark:border-blue-800/50">
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
              className={`group p-8 rounded-3xl border transition-all duration-500 cursor-pointer ${
                activeFeature === i
                  ? `${getFeatureBg(feature.color)} border-transparent shadow-xl scale-[1.02]`
                  : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-transparent hover:shadow-xl hover:-translate-y-1"
              }`}
              onMouseEnter={() => setActiveFeature(i)}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getFeatureColor(feature.color)} flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

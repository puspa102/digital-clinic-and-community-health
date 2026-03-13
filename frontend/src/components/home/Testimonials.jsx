import { Star } from "lucide-react";

const Testimonials = () => {
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

  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-full text-[12px] font-semibold text-purple-600 dark:text-purple-400 mb-4 border border-purple-100 dark:border-purple-800/50">
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
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-1 mb-6">
                {[...Array(item.rating)].map((_, j) => (
                  <Star key={j} size={18} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-8 italic text-lg leading-relaxed">"{item.content}"</p>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md ${
                  i === 0 ? "bg-gradient-to-br from-green-400 to-green-600" : 
                  i === 1 ? "bg-gradient-to-br from-blue-400 to-blue-600" : 
                  "bg-gradient-to-br from-orange-400 to-orange-600"
                }`}>
                  {item.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

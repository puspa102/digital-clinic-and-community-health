import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Cardiologist",
      content:
        "Digital Clinic has revolutionized how I manage my practice. The patient history access is a game-changer for diagnosis.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80",
    },
    {
      name: "Michael Chen",
      role: "Patient",
      content:
        "I used to wait hours at clinics. Now I book appointments instantly and get my prescriptions on my phone. Incredible!",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    },
    {
      name: "Priya Patel",
      role: "Pharmacist",
      content:
        "Inventory management and processing digital prescriptions has never been smoother. It saves us so much time.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80",
    },
  ];

  return (
    <section
      id="testimonials"
      className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase mb-2">
            Testimonials
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Thousands
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Hear from the doctors, patients, and partners who use Digital Clinic
            daily.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300 relative"
            >
              <Quote className="absolute top-8 right-8 text-blue-100 dark:text-blue-900/30 w-10 h-10" />

              <div className="flex items-center gap-1 mb-6">
                {[...Array(item.rating)].map((_, j) => (
                  <Star
                    key={j}
                    size={16}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed relative z-10">
                "{item.content}"
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    {item.name}
                  </h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {item.role}
                  </p>
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

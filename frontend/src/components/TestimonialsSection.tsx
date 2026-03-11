import React from 'react';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Rajesh Kumar',
      position: 'CFO, TechCorp India',
      company: 'Leading IT Company',
      image: '👨‍💼',
      rating: 5,
      text: 'UPI Shield has been a game-changer for our business. The real-time fraud detection saved us from multiple fraudulent transactions. Highly recommended!',
    },
    {
      name: 'Priya Sharma',
      position: 'Head of Operations',
      company: 'E-commerce Giant',
      image: '👩‍💼',
      rating: 5,
      text: 'The AI-powered analytics are incredibly accurate. We\'ve reduced fraud by 95% since implementing UPI Shield. The ROI is phenomenal!',
    },
    {
      name: 'Amit Patel',
      position: 'Security Manager',
      company: 'Financial Services Ltd',
      image: '👨‍💻',
      rating: 5,
      text: 'Best fraud detection system we\'ve used. The instant alerts and comprehensive reporting make it easy to stay on top of security threats.',
    },
    {
      name: 'Sneha Reddy',
      position: 'Director of Finance',
      company: 'Retail Chain',
      image: '👩‍🔬',
      rating: 5,
      text: 'UPI Shield\'s customer support is outstanding. They helped us integrate seamlessly and the system works flawlessly. Worth every rupee!',
    },
    {
      name: 'Vikram Singh',
      position: 'CTO',
      company: 'FinTech Startup',
      image: '👨‍🏫',
      rating: 5,
      text: 'The compliance features are excellent. Being RBI and NPCI compliant out of the box saved us months of work. Highly professional service.',
    },
    {
      name: 'Anjali Mehta',
      position: 'Risk Manager',
      company: 'Banking Solutions',
      image: '👩‍💼',
      rating: 5,
      text: 'We process millions of transactions daily. UPI Shield handles the volume effortlessly while maintaining 99.9% accuracy. Simply outstanding!',
    },
  ];

  const partnerLogos = [
    { name: 'HDFC Bank', color: 'from-blue-600 to-cyan-600' },
    { name: 'ICICI Bank', color: 'from-orange-600 to-amber-600' },
    { name: 'SBI', color: 'from-blue-700 to-blue-500' },
    { name: 'Axis Bank', color: 'from-red-600 to-pink-600' },
    { name: 'Kotak', color: 'from-red-700 to-red-500' },
    { name: 'Yes Bank', color: 'from-blue-600 to-indigo-600' },
  ];

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Trusted by <span className="text-gradient">Leading Organizations</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See what our clients say about protecting their transactions with UPI Shield
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 border border-gray-800 cursor-pointer"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FiStar key={i} className="text-yellow-500 fill-yellow-500" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-400 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 border-t pt-4">
                <div className="text-4xl">{testimonial.image}</div>
                <div>
                  <h4 className="font-bold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.position}</p>
                  <p className="text-xs text-gray-500">{testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Partner Logos */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-white">
            Trusted by Leading Banks & Financial Institutions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {partnerLogos.map((logo, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.15, 
                  y: -8,
                  boxShadow: '0 10px 30px rgba(6, 182, 212, 0.3)',
                }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center p-4 bg-gray-800 rounded-lg font-bold text-gray-300 border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                {/* Hover gradient background */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${logo.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                
                {/* Shimmer effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '200%' }}
                  transition={{ duration: 0.6 }}
                />
                
                {/* Bank name with gradient on hover */}
                <span className={`relative z-10 group-hover:bg-gradient-to-r ${logo.color} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                  {logo.name}
                </span>
                
                {/* Corner accent */}
                <motion.div
                  className={`absolute top-0 right-0 w-0 h-0 border-t-8 border-r-8 border-transparent group-hover:border-t-cyan-500 group-hover:border-r-cyan-500 transition-all duration-300`}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Stats */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: '4.9/5', label: 'Average Rating' },
            { value: '500+', label: 'Happy Clients' },
            { value: '10M+', label: 'Transactions Protected' },
            { value: '99.9%', label: 'Customer Satisfaction' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-800 cursor-pointer"
            >
              <h3 className="text-3xl font-bold text-gradient mb-2">{stat.value}</h3>
              <p className="text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

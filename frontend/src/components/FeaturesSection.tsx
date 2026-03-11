import React from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { 
  FiShield, 
  FiActivity, 
  FiBarChart2, 
  FiFileText, 
  FiCheckSquare,
  FiBell
} from 'react-icons/fi';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}

const FeaturesSection: React.FC = () => {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothX = useSpring(cursorX, { damping: 25, stiffness: 350 });
  const smoothY = useSpring(cursorY, { damping: 25, stiffness: 350 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  };

  const features: Feature[] = [
    {
      icon: FiBell,
      title: 'Real-Time Fraud Detection',
      description: 'Instant alerts for suspicious transactions with AI-powered threat detection that works 24/7 to keep your money safe.',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: FiActivity,
      title: 'Behavior Analytics',
      description: 'Advanced machine learning monitors transaction patterns and identifies anomalies before they become threats.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FiBarChart2,
      title: 'Secure Dashboard',
      description: 'Beautiful, intuitive interface for easy visualization of alerts, transactions, and comprehensive risk scores.',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: FiFileText,
      title: 'Reports & Insights',
      description: 'Generate detailed, exportable reports for businesses and banks with actionable fraud prevention insights.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: FiCheckSquare,
      title: 'Regulatory Compliance',
      description: 'Full adherence to RBI and NPCI guidelines ensuring your transactions meet all security standards.',
      color: 'from-orange-500 to-amber-500',
    },
    {
      icon: FiShield,
      title: 'End-to-End Encryption',
      description: 'Bank-grade encryption protects all your data with multiple layers of security and privacy protection.',
      color: 'from-teal-500 to-green-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section 
      id="features" 
      className="py-20 bg-black relative overflow-hidden"
    >
      {/* Accent gradient orbs - glossy blue */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Powerful <span className="text-gradient">Features</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Advanced security features designed to protect your UPI transactions from fraud
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
              className="relative group cursor-pointer"
            >
              <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-8 h-full shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl mb-6 relative`}
                >
                  <feature.icon className="text-3xl text-white" />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-xl`}
                  />
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative Element */}
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className={`h-1 bg-gradient-to-r ${feature.color} rounded-full mt-6`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Features Banner */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-16 rounded-2xl p-8 text-white text-center shadow-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
            boxShadow: '0 20px 60px rgba(59,130,246,0.4), inset 0 2px 20px rgba(255,255,255,0.2)',
          }}
        >
          {/* Glossy top highlight */}
          <div 
            className="absolute top-0 left-0 right-0 h-1/2"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
            }}
          />
          
          {/* Animated background shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4">Ready to Secure Your Transactions?</h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of users who trust UPI Shield for their transaction security
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(255,255,255,0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg transition-all duration-300"
              style={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              Start Free Trial
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;

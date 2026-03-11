import React from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiCpu, FiBell, FiFileText } from 'react-icons/fi';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: FiEye,
      title: 'Transaction Monitoring',
      description: 'Our system continuously monitors all UPI transactions in real-time, tracking every detail.',
      color: 'from-blue-500 to-cyan-500',
      step: '01',
    },
    {
      icon: FiCpu,
      title: 'AI-Based Risk Scoring',
      description: 'Advanced machine learning algorithms analyze patterns and assign risk scores instantly.',
      color: 'from-purple-500 to-pink-500',
      step: '02',
    },
    {
      icon: FiBell,
      title: 'Instant Alerts',
      description: 'Get immediate notifications for any suspicious activity detected in your transactions.',
      color: 'from-orange-500 to-red-500',
      step: '03',
    },
    {
      icon: FiFileText,
      title: 'Action & Reporting',
      description: 'Take quick action and generate comprehensive reports for compliance and analysis.',
      color: 'from-green-500 to-emerald-500',
      step: '04',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-900">
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
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Our simple 4-step process ensures your transactions are protected around the clock
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 transform -translate-y-1/2 z-0" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.1 }}
                className="relative bg-gray-900 rounded-2xl p-8 border-2 border-gray-800 hover:border-blue-500/50 transition-all duration-300 shadow-xl cursor-pointer"
              >
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {step.step}
                </div>

                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl mb-6 relative`}
                >
                  <step.icon className="text-4xl text-white" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl`}
                  />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 text-white">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow for larger screens */}
                {index < steps.length - 1 && (
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2 text-4xl text-primary-400"
                  >
                    →
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Flow Diagram */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-white">Complete Process Flow</h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {['User Transaction', 'Real-Time Analysis', 'Threat Detection', 'Alert & Block', 'Safe Transaction'].map((label, index) => (
              <React.Fragment key={index}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {index + 1}
                  </div>
                  <p className="mt-2 text-sm text-center font-semibold text-gray-300">{label}</p>
                </motion.div>
                {index < 4 && (
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    className="hidden md:block text-3xl text-primary-400"
                  >
                    →
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

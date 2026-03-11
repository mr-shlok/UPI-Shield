import React from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiShield, FiCheck, FiEye, FiServer, FiAward } from 'react-icons/fi';

const SecuritySection: React.FC = () => {
  const securityFeatures = [
    {
      icon: FiLock,
      title: 'End-to-End Encryption',
      description: 'AES-256 encryption for all data transmission',
    },
    {
      icon: FiShield,
      title: 'Data Privacy',
      description: 'GDPR compliant data protection standards',
    },
    {
      icon: FiServer,
      title: 'Secure Infrastructure',
      description: 'Cloud-based security with 99.99% uptime',
    },
    {
      icon: FiEye,
      title: 'Continuous Monitoring',
      description: '24/7 security operations center monitoring',
    },
    {
      icon: FiAward,
      title: 'RBI Compliance',
      description: 'Fully compliant with RBI guidelines',
    },
    {
      icon: FiCheck,
      title: 'NPCI Standards',
      description: 'Meets all NPCI security requirements',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Security & <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Compliance</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Bank-grade security with full regulatory compliance to protect your transactions
          </p>
        </motion.div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/20 hover:border-cyan-500/50 hover:bg-gray-800/70 transition-all duration-300 group cursor-pointer"
            >
              <motion.div
                className="text-4xl mb-4 text-cyan-400"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <feature.icon />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors">{feature.description}</p>
              
              {/* Decorative line */}
              <div className="mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full" />
            </motion.div>
          ))}
        </div>

        {/* Compliance Badges */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-cyan-500/20"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-white">Certified & Compliant</h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {['RBI Approved', 'NPCI Certified', 'ISO 27001', 'PCI DSS', 'SOC 2', 'GDPR'].map((cert, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.15, rotate: 5, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-cyan-500/50 cursor-pointer transition-all duration-300"
              >
                ✓ {cert}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center gap-2">
              <FiShield className="text-3xl text-cyan-400" />
              <span className="text-lg text-gray-200">Verified Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <FiLock className="text-3xl text-cyan-400" />
              <span className="text-lg text-gray-200">SSL Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheck className="text-3xl text-cyan-400" />
              <span className="text-lg text-gray-200">Trusted by 500+ Banks</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SecuritySection;

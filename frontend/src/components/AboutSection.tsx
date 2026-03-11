import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiUsers, FiTrendingUp, FiTarget } from 'react-icons/fi';

const AboutSection: React.FC = () => {
  const stats = [
    {
      icon: FiUsers,
      value: '500+',
      label: 'Happy Clients',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FiTrendingUp,
      value: '10M+',
      label: 'Transactions Protected',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: FiAward,
      value: '99.9%',
      label: 'Accuracy Rate',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: FiTarget,
      value: '24/7',
      label: 'Active Monitoring',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section id="about" className="py-20 bg-gray-950">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold border border-blue-500/30">
                About UPI Shield
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Leading the Fight Against <span className="text-gradient">UPI Fraud</span>
            </h2>
            
            <p className="text-xl text-gray-400 mb-6 leading-relaxed">
              UPI Shield is India's premier AI-powered fraud detection platform, dedicated to protecting
              millions of UPI transactions every day. Founded by cybersecurity experts and powered by
              cutting-edge machine learning, we're committed to making digital payments safer for everyone.
            </p>
            
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Our mission is simple: to create a fraud-free digital payment ecosystem where businesses
              and individuals can transact with complete confidence. With real-time threat detection,
              behavioral analytics, and 24/7 monitoring, we're setting new standards in payment security.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 text-white">Our Mission</h4>
                  <p className="text-gray-400">
                    To eliminate financial fraud through innovative AI technology and protect every digital transaction.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">👁️</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Our Vision</h4>
                  <p className="text-gray-600">
                    A world where everyone can enjoy the convenience of digital payments without fear of fraud.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💎</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Our Values</h4>
                  <p className="text-gray-600">
                    Trust, Innovation, Security, and Customer-First approach in everything we do.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Stats Grid */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-gray-900 rounded-2xl p-8 border-2 border-gray-800 hover:border-blue-500/50 transition-all duration-300 shadow-xl cursor-pointer"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl mb-4`}
                >
                  <stat.icon className="text-3xl text-white" />
                </motion.div>
                <h3 className={`text-4xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </h3>
                <p className="text-gray-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}

            {/* Team Photo Placeholder */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="col-span-2 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl p-8 text-white text-center shadow-xl"
            >
              <div className="text-6xl mb-4">🛡️</div>
              <h4 className="text-2xl font-bold mb-2">Trusted by Leading Banks</h4>
              <p className="text-blue-100">
                Partnered with 50+ financial institutions across India
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-20"
        >
          <h3 className="text-3xl font-bold text-center mb-12 text-white">Why Choose UPI Shield?</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Advanced AI Technology',
                description: 'Our proprietary machine learning algorithms detect fraud patterns that traditional systems miss.',
                icon: '🤖',
              },
              {
                title: 'Real-Time Protection',
                description: 'Instant threat detection and blocking before fraudulent transactions can be completed.',
                icon: '⚡',
              },
              {
                title: 'Expert Support Team',
                description: '24/7 support from cybersecurity experts dedicated to your transaction security.',
                icon: '👥',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="bg-gray-900 rounded-xl p-6 text-center border border-gray-800 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h4 className="text-xl font-bold mb-3 text-white">{item.title}</h4>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;

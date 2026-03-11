import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiShield, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const HeroSection: React.FC = () => {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothX = useSpring(cursorX, { damping: 30, stiffness: 300 });
  const smoothY = useSpring(cursorY, { damping: 30, stiffness: 300 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section 
      id="home" 
      className="pt-16 md:pt-20 pb-8 md:pb-12 bg-gradient-to-br from-black via-slate-950 to-gray-950 overflow-hidden relative min-h-screen flex items-center"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
      
      {/* Accent gradient orbs - glossy blue */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
      
      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-500 rounded-full opacity-30"
            style={{
              left: `${10 + i * 6}%`,
              top: `${20 + (i % 5) * 15}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i * 0.2,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="inline-block">
              <motion.span 
                className="px-4 py-2 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-blue-500/20 text-blue-300 rounded-full text-sm font-semibold border border-blue-500/40 backdrop-blur-sm"
                style={{
                  boxShadow: '0 0 20px rgba(59,130,246,0.3), inset 0 0 15px rgba(147,197,253,0.1)',
                }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(59,130,246,0.3), inset 0 0 15px rgba(147,197,253,0.1)',
                    '0 0 35px rgba(59,130,246,0.6), inset 0 0 20px rgba(147,197,253,0.2)',
                    '0 0 20px rgba(59,130,246,0.3), inset 0 0 15px rgba(147,197,253,0.1)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔒 AI-Powered Security
              </motion.span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold leading-tight">
              Protect Your{' '}
              <span className="text-gradient">UPI Transactions</span>{' '}
              in Real-Time
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl text-gray-400 leading-relaxed">
              Advanced AI-powered fraud detection that monitors every transaction,
              identifies suspicious patterns, and keeps your money safe 24/7.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 50px rgba(59,130,246,0.6)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-lg font-semibold text-lg shadow-xl transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
                  boxShadow: '0 8px 40px rgba(59,130,246,0.4), inset 0 2px 10px rgba(255,255,255,0.2)',
                }}
              >
                {/* Top glossy highlight */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1/2 rounded-t-lg"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
                  }}
                />
                {/* Animated shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative z-10 text-white">Get Started</span> <FiArrowRight className="text-xl relative z-10 text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59,130,246,0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 backdrop-blur-md border-2 border-blue-500/40 rounded-lg font-semibold text-lg text-blue-300 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(30,58,138,0.3) 0%, rgba(59,130,246,0.1) 100%)',
                }}
              >
                Book Demo
              </motion.button>
            </motion.div>

            {/* Feature Badges - Properly Formatted */}
            <motion.div 
              variants={itemVariants} 
              className="flex flex-wrap items-center gap-4 pt-6"
            >
              {[
                { icon: '✓', text: 'No Setup Fee', color: 'from-green-500 to-emerald-500' },
                { icon: '24/7', text: 'Monitoring', color: 'from-blue-500 to-cyan-500' },
                { icon: '99.9%', text: 'Accuracy', color: 'from-purple-500 to-violet-500' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg backdrop-blur-md border border-gray-700/50 bg-gray-800/40 hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
                  style={{
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  }}
                >
                  <div 
                    className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} text-white font-bold text-sm shadow-lg`}
                  >
                    {feature.icon}
                  </div>
                  <span className="text-gray-200 font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

          </motion.div>

          {/* Right Visual - UPI Transaction Detection Flow */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative h-[350px] md:h-[420px] flex items-start justify-center mt-8"
          >
            <div className="relative w-full max-w-sm scale-90 md:scale-100">
              {/* Main Phone with UPI Transaction */}
              <div className="relative">
                {/* Phone Mockup - Smaller */}
                <div className="mx-auto w-52 h-[360px] bg-gradient-to-b from-slate-900 to-slate-950 rounded-[2.5rem] border-6 border-slate-800 shadow-2xl overflow-hidden relative">
                  {/* Phone Screen */}
                  <div className="absolute inset-1.5 bg-gradient-to-b from-slate-950 to-blue-950 rounded-[2rem] overflow-hidden">
                    {/* UPI App Interface */}
                    <div className="p-3">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-blue-300 font-bold text-xs">UPI Payment</h3>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-1.5 h-1.5 bg-green-400 rounded-full"
                        />
                      </div>

                      {/* Transaction Details Card */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-slate-800/50 rounded-xl p-3 mb-3 border border-blue-500/20"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">JS</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold text-xs">John Smith</p>
                            <p className="text-gray-400 text-[10px]">johnsmith@upi</p>
                          </div>
                        </div>
                        
                        <div className="bg-slate-900/50 rounded-lg p-2 mb-2">
                          <p className="text-gray-400 text-[10px] mb-0.5">Amount</p>
                          <motion.p
                            className="text-white font-bold text-2xl"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            ₹5,499
                          </motion.p>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <span>🕐</span>
                          <span>Processing...</span>
                        </div>
                      </motion.div>

                      {/* AI Shield Detecting */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="relative"
                      >
                        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-xl p-3 border border-blue-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <motion.div
                              animate={{ 
                                rotate: [0, 360],
                                boxShadow: [
                                  '0 0 15px rgba(59,130,246,0.5)',
                                  '0 0 30px rgba(59,130,246,0.8)',
                                  '0 0 15px rgba(59,130,246,0.5)',
                                ],
                              }}
                              transition={{ 
                                rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                                boxShadow: { duration: 2, repeat: Infinity },
                              }}
                              className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0"
                            >
                              <FiShield className="text-white text-sm" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <p className="text-blue-300 font-bold text-xs">UPI Shield</p>
                              <p className="text-gray-400 text-[10px]">AI Detection</p>
                            </div>
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full flex-shrink-0"
                            />
                          </div>
                          
                          {/* Scanning Progress */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-gray-400">Analyzing...</span>
                              <motion.span
                                className="text-blue-400 font-semibold"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                85%
                              </motion.span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                                animate={{ width: ['0%', '85%'] }}
                                transition={{ duration: 2, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-b-xl" />
                </div>

                {/* Verification Result - Right Side - Small */}
                <motion.div
                  initial={{ x: 50, opacity: 0, scale: 0.8 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5 }}
                  className="absolute -right-2 top-20"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        '0 4px 20px rgba(34,197,94,0.3)',
                        '0 6px 30px rgba(34,197,94,0.5)',
                        '0 4px 20px rgba(34,197,94,0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg p-2 shadow-xl w-16"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 0.6 }}
                      className="w-6 h-6 bg-white rounded-full flex items-center justify-center mx-auto mb-1"
                    >
                      <FiCheckCircle className="text-green-600 text-sm" />
                    </motion.div>
                    <p className="text-white font-bold text-center text-[9px]">VERIFIED</p>
                    <p className="text-green-100 text-center text-[8px]">Safe</p>
                  </motion.div>
                </motion.div>

                {/* Rejection Result - Left Side - Small */}
                <motion.div
                  initial={{ x: -50, opacity: 0, scale: 0.8 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5 }}
                  className="absolute -left-2 bottom-20"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, -5, 5, 0],
                      boxShadow: [
                        '0 4px 20px rgba(239,68,68,0.3)',
                        '0 6px 30px rgba(239,68,68,0.5)',
                        '0 4px 20px rgba(239,68,68,0.3)',
                      ],
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity },
                      boxShadow: { duration: 2, repeat: Infinity },
                    }}
                    className="bg-gradient-to-br from-red-600 to-orange-600 rounded-lg p-2 shadow-xl w-16"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-6 h-6 bg-white rounded-full flex items-center justify-center mx-auto mb-1"
                    >
                      <span className="text-red-600 text-lg font-bold">✕</span>
                    </motion.div>
                    <p className="text-white font-bold text-center text-[9px]">REJECTED</p>
                    <p className="text-red-100 text-center text-[8px]">Fraud</p>
                  </motion.div>
                </motion.div>

                {/* Scanning Rays - Smaller */}
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 pointer-events-none"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  {[0, 120, 240].map((angle, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-0.5 h-40 bg-gradient-to-t from-blue-500/0 via-blue-400/40 to-blue-500/0"
                      style={{
                        transform: `rotate(${angle}deg) translateX(-50%)`,
                        transformOrigin: 'bottom center',
                      }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </motion.div>
              </div>

              {/* Bottom Info Badge - Smaller */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute -bottom-5 left-1/2 transform -translate-x-1/2"
              >
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-1.5 rounded-full shadow-2xl text-xs font-bold whitespace-nowrap"
                  style={{ boxShadow: '0 8px 30px rgba(59,130,246,0.5)' }}
                >
                  Real-time AI Protection
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
        >
          {[
            { value: '10M+', label: 'Transactions Protected' },
            { value: '99.9%', label: 'Detection Accuracy' },
            { value: '24/7', label: 'Real-Time Monitoring' },
            { value: '5M+', label: 'Happy Clients' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500/50 hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer"
            >
              <h3 className="text-4xl font-bold text-gradient">{stat.value}</h3>
              <p className="text-gray-400 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

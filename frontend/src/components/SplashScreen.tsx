import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { FiShield } from 'react-icons/fi';

interface SplashScreenProps {
  onLoadingComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothX = useSpring(cursorX, { damping: 20, stiffness: 300 });
  const smoothY = useSpring(cursorY, { damping: 20, stiffness: 300 });

  const handleMouseMove = (e: React.MouseEvent) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
  };

  useEffect(() => {
    console.log('SplashScreen: useEffect called');
    const logoTimer = setTimeout(() => {
      console.log('SplashScreen: setting showLogo to true');
      setShowLogo(true);
    }, 300);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        console.log('SplashScreen: progress update', prev);
        if (prev >= 100) {
          console.log('SplashScreen: progress complete, clearing interval');
          clearInterval(interval);
          setTimeout(() => {
            console.log('SplashScreen: calling onLoadingComplete');
            onLoadingComplete();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => {
      console.log('SplashScreen: cleanup');
      clearTimeout(logoTimer);
      clearInterval(interval);
    };
  }, [onLoadingComplete]);

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-slate-950 to-gray-950 overflow-hidden"
      >
        {/* Animated Background Waves */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* Animated Wave 1 */}
            <motion.path
              d="M0,200 Q250,100 500,200 T1000,200 L1000,0 L0,0 Z"
              fill="url(#wave-gradient)"
              initial={{ d: "M0,200 Q250,100 500,200 T1000,200 L1000,0 L0,0 Z" }}
              animate={{
                d: [
                  "M0,200 Q250,100 500,200 T1000,200 L1000,0 L0,0 Z",
                  "M0,200 Q250,300 500,200 T1000,200 L1000,0 L0,0 Z",
                  "M0,200 Q250,100 500,200 T1000,200 L1000,0 L0,0 Z",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Animated Wave 2 */}
            <motion.path
              d="M0,600 Q250,500 500,600 T1000,600 L1000,1080 L0,1080 Z"
              fill="url(#wave-gradient)"
              initial={{ d: "M0,600 Q250,500 500,600 T1000,600 L1000,1080 L0,1080 Z" }}
              animate={{
                d: [
                  "M0,600 Q250,500 500,600 T1000,600 L1000,1080 L0,1080 Z",
                  "M0,600 Q250,700 500,600 T1000,600 L1000,1080 L0,1080 Z",
                  "M0,600 Q250,500 500,600 T1000,600 L1000,1080 L0,1080 Z",
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* Decorative Curved Lines */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 2 }}
        >
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M0,300 Q400,100 800,300"
              stroke="url(#gold-gradient)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
            <motion.path
              d="M200,600 Q600,400 1000,600"
              stroke="url(#blue-gradient)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Floating Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-br from-blue-400 to-cyan-400"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0],
              y: [0, -100, -200],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Golden Triangles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`triangle-${i}`}
            className="absolute"
            style={{
              left: `${30 + Math.random() * 40}%`,
              top: `${30 + Math.random() * 40}%`,
            }}
            initial={{ opacity: 0, rotate: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.8, 0],
              rotate: [0, 180, 360],
              scale: [0, 1, 0],
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div
              className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px]"
              style={{
                borderBottomColor: Math.random() > 0.5 ? '#f59e0b' : '#3b82f6',
              }}
            />
          </motion.div>
        ))}

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Logo */}
          <AnimatePresence>
            {showLogo && (
              <motion.div
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative mb-8"
              >
                {/* Modern Hexagonal Logo */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                  {/* Outer rotating glow */}
                  <motion.div
                    className="absolute -inset-8 rounded-full"
                    animate={{
                      boxShadow: [
                        '0 0 60px 20px rgba(59, 130, 246, 0.4)',
                        '0 0 100px 35px rgba(59, 130, 246, 0.6)',
                        '0 0 60px 20px rgba(59, 130, 246, 0.4)',
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  {/* Hexagon SVG Logo */}
                  <motion.svg
                    width="220"
                    height="220"
                    viewBox="0 0 220 220"
                    className="relative z-10"
                  >
                    <defs>
                      <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.95" />
                        <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                        <stop offset="100%" stopColor="#1e40af" stopOpacity="0.95" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Main Hexagon */}
                    <motion.path
                      d="M110 25 L185 67.5 L185 152.5 L110 195 L35 152.5 L35 67.5 Z"
                      fill="url(#hexGrad)"
                      stroke="#60a5fa"
                      strokeWidth="4"
                      filter="url(#glow)"
                      animate={{
                        strokeOpacity: [0.5, 1, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        boxShadow: '0 0 40px rgba(59,130,246,0.6)',
                      }}
                    />
                    
                    {/* Inner Hexagon */}
                    <path
                      d="M110 50 L170 82.5 L170 137.5 L110 170 L50 137.5 L50 82.5 Z"
                      fill="rgba(30,58,138,0.7)"
                      stroke="#93c5fd"
                      strokeWidth="2.5"
                    />
                    
                    {/* Lock Shield Icon */}
                    <g transform="translate(82, 80)">
                      {/* Shield Body */}
                      <path
                        d="M23 5 L45 15 L45 35 C45 40 40 48 23 53 C6 48 1 40 1 35 L1 15 Z"
                        fill="#60a5fa"
                        stroke="#fff"
                        strokeWidth="2.5"
                      />
                      {/* Lock */}
                      <rect x="16" y="25" width="14" height="12" rx="2" fill="#fff" opacity="0.9"/>
                      <path 
                        d="M18 25 L18 21 C18 18 20 16 23 16 C26 16 28 18 28 21 L28 25" 
                        fill="none" 
                        stroke="#1e40af" 
                        strokeWidth="2.5" 
                        strokeLinecap="round"
                      />
                      <circle cx="23" cy="30" r="1.5" fill="#1e40af"/>
                      <line x1="23" y1="31.5" x2="23" y2="34" stroke="#1e40af" strokeWidth="1.5" strokeLinecap="round"/>
                    </g>
                  </motion.svg>
                  
                  {/* Logo has no text inside - clean minimalist design */}

                  {/* Rotating Rings */}
                  <motion.div
                    className="absolute -inset-6 rounded-full border-3 border-blue-400/50"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    style={{
                      borderStyle: 'dashed',
                      boxShadow: '0 0 20px rgba(59,130,246,0.3)',
                    }}
                  />
                  
                  {/* Energy Pulse Rings */}
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={`pulse-${i}`}
                      className="absolute inset-0 rounded-full border-2 border-blue-400/60"
                      initial={{ scale: 1, opacity: 0.7 }}
                      animate={{
                        scale: [1, 1.6, 2],
                        opacity: [0.7, 0.3, 0],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.7,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Brand Name with Stylish Font */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-center mb-2 mt-4"
          >
            <motion.h1 
              className="text-5xl font-black mb-3"
              style={{
                fontFamily: '"Orbitron", sans-serif',
                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #93c5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.1em',
              }}
              animate={{
                textShadow: [
                  '0 0 30px rgba(59,130,246,0.5)',
                  '0 0 50px rgba(59,130,246,0.8)',
                  '0 0 30px rgba(59,130,246,0.5)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              UPI SHIELD
            </motion.h1>
            <p className="text-blue-300 text-lg tracking-wider" style={{ fontFamily: '"Rajdhani", sans-serif' }}>Secure Your Transactions</p>
          </motion.div>

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-300 text-xl italic mb-6">Processing Secure Payment...</p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '400px', opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="relative max-w-md w-full h-3 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-gray-700/50"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" />
            
            {/* Progress Fill */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 rounded-full shadow-lg"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            >
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            {/* Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 10px rgba(59, 130, 246, 0.5)',
                  '0 0 20px rgba(59, 130, 246, 0.8)',
                  '0 0 10px rgba(59, 130, 246, 0.5)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Loading Percentage */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-4 text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
          >
            {progress}%
          </motion.p>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mt-8 flex items-center gap-2 text-gray-400 text-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            <span>256-bit Encryption Secured</span>
          </motion.div>
        </div>

        {/* Corner Sparkles */}
        <motion.div
          className="absolute top-20 right-20 text-4xl"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          ✦
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-20 text-3xl text-amber-500"
          animate={{
            rotate: [360, 180, 0],
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          ✦
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;
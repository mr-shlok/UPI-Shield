import React, { useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { FiShield, FiMenu, FiX } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothX = useSpring(cursorX, { damping: 25, stiffness: 400 });
  const smoothY = useSpring(cursorY, { damping: 25, stiffness: 400 });
  const navigate = useNavigate();
  const location = useLocation();

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Pricing', path: '/#pricing' },
    { name: 'About Us', path: '/#about' },
    { name: 'Contact', path: '/#contact' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-md shadow-lg z-50 border-b border-blue-900/30 relative overflow-hidden"
    >
      {/* Professional Blue UPI Security Banner Background - More Visible */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950" />
        
        {/* Circuit Pattern Overlay */}
        <svg 
          className="absolute inset-0 w-full h-full" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e40af" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          
          {/* Glowing Lines */}
          <motion.line 
            x1="0" y1="30" x2="100%" y2="30" 
            stroke="url(#lineGradient)" 
            strokeWidth="2"
            animate={{ strokeOpacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.line 
            x1="0" y1="50" x2="100%" y2="50" 
            stroke="url(#lineGradient)" 
            strokeWidth="1"
            animate={{ strokeOpacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          />
          
          {/* Circuit Nodes */}
          {[15, 35, 55, 75, 95].map((x, i) => (
            <motion.circle
              key={i}
              cx={`${x}%`}
              cy="40"
              r="4"
              fill="#3b82f6"
              animate={{ 
                opacity: [0.4, 1, 0.4],
                r: [3, 5, 3],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </svg>

        {/* Shield Icon Pattern - Right Side */}
        <motion.div
          className="absolute right-8 top-1/2 transform -translate-y-1/2"
          animate={{ 
            opacity: [0.15, 0.35, 0.15],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80">
            <defs>
              <linearGradient id="shieldBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
            <path
              d="M40 10 L70 22 L70 45 C70 55 62 68 40 75 C18 68 10 55 10 45 L10 22 Z"
              fill="url(#shieldBgGrad)"
              opacity="0.6"
            />
            <circle cx="40" cy="45" r="12" fill="#fff" opacity="0.3" />
            <text x="40" y="52" fontSize="20" textAnchor="middle" fill="#fff" opacity="0.5">🔒</text>
          </svg>
        </motion.div>

        {/* Lock Icons - Left Side */}
        <motion.div
          className="absolute left-8 top-1/2 transform -translate-y-1/2"
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="25" fill="#3b82f6" opacity="0.4" />
            <rect x="22" y="28" width="16" height="12" rx="2" fill="#60a5fa" opacity="0.6" />
            <path 
              d="M24 28 L24 23 C24 19 26.5 16 30 16 C33.5 16 36 19 36 23 L36 28" 
              fill="none" 
              stroke="#60a5fa" 
              strokeWidth="3" 
              opacity="0.6"
            />
          </svg>
        </motion.div>

        {/* Hexagonal Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexPattern" x="0" y="0" width="50" height="43.4" patternUnits="userSpaceOnUse">
              <path 
                d="M25 0 L50 14.43 L50 28.87 L25 43.3 L0 28.87 L0 14.43 Z" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="0.5" 
                opacity="0.15"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexPattern)" />
        </svg>

        {/* Glowing Particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${10 + i * 7}%`,
              top: `${30 + (i % 3) * 15}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: 2 + (i * 0.2),
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>

      {/* Decorative gradient line at top - glossy blue */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-500" 
        style={{ boxShadow: '0 2px 10px rgba(59,130,246,0.5)' }} 
      />
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${10 + i * 12}%`,
              top: '50%',
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and App Name with Shield Icon */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-3 relative"
          >
            {/* Stylish Shield Icon */}
            <div className="relative w-12 h-12">
              {/* Animated glow effect */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg blur-lg"
              />
              
              {/* Shield SVG */}
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                className="relative z-10"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(59,130,246,0.4))',
                }}
              >
                <defs>
                  <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                
                {/* Shield Shape */}
                <motion.path
                  d="M24 4 L42 12 L42 24 C42 30 38 38 24 42 C10 38 6 30 6 24 L6 12 Z"
                  fill="url(#shieldGrad)"
                  stroke="#60a5fa"
                  strokeWidth="1.5"
                  animate={{
                    strokeOpacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Lock Icon */}
                <rect x="19" y="22" width="10" height="8" rx="1.5" fill="#fff" opacity="0.95"/>
                <path 
                  d="M20 22 L20 19 C20 17 21.5 15.5 24 15.5 C26.5 15.5 28 17 28 19 L28 22" 
                  fill="none" 
                  stroke="#1e40af" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
                <circle cx="24" cy="25.5" r="1.2" fill="#1e40af"/>
                <line x1="24" y1="26.7" x2="24" y2="28.5" stroke="#1e40af" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">UPI Shield</h1>
              <p className="text-xs text-blue-300">Secure Your Transactions</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <motion.button
                key={link.name}
                onClick={() => handleNavigation(link.path)}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                className={`${
                  location.pathname === link.path.split('#')[0] 
                    ? 'text-blue-400' 
                    : 'text-gray-300 hover:text-blue-400'
                } transition-colors duration-300 font-medium`}
              >
                {link.name}
              </motion.button>
            ))}
          </div>

          {/* Login/Signup Buttons - Glossy Blue Theme */}
          <div className="hidden md:flex items-center space-x-4 relative group">
            {/* Decorative element with blue glow */}
            <motion.div
              className="absolute -left-8 w-px h-8 bg-gradient-to-b from-transparent via-blue-500 to-transparent"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Login Button - Dark Blue Color */}
            <motion.button
              onClick={() => navigate('/login')}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 10px 40px rgba(30, 64, 175, 0.7), inset 0 -5px 30px rgba(30,58,138,0.6)',
                y: -2,
              }}
              whileTap={{ scale: 0.95 }}
              className="relative px-6 py-2.5 rounded-lg font-semibold text-sm tracking-wide overflow-hidden shadow-lg"
              style={{ 
                fontFamily: '"Inter", sans-serif',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
                boxShadow: '0 6px 24px rgba(30,64,175,0.4), inset 0 2px 8px rgba(255,255,255,0.25)',
              }}
            >
              {/* Top glossy highlight */}
              <div 
                className="absolute top-0 left-0 right-0 h-1/2 rounded-t-lg"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                }}
              />
              
              {/* Animated shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
              
              <span className="relative z-10 text-white font-medium">Login</span>
            </motion.button>
            
            {/* Sign Up Button - Dark Blue Color */}
            <motion.button
              onClick={() => navigate('/register')}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 10px 40px rgba(30, 64, 175, 0.7), inset 0 -5px 30px rgba(30,58,138,0.6)',
                y: -2,
              }}
              whileTap={{ scale: 0.95 }}
              className="relative px-7 py-3 rounded-lg font-semibold text-base tracking-wide overflow-hidden shadow-xl"
              style={{ 
                fontFamily: '"Inter", sans-serif',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
                boxShadow: '0 8px 32px rgba(30,64,175,0.5), inset 0 2px 10px rgba(255,255,255,0.25)',
              }}
            >
              {/* Top glossy highlight */}
              <div 
                className="absolute top-0 left-0 right-0 h-1/2 rounded-t-lg"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                }}
              />
              
              {/* Animated shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
              
              {/* Pulsing glow */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(30,64,175,0.4)',
                    '0 0 40px rgba(30,64,175,0.7)',
                    '0 0 20px rgba(30,64,175,0.4)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <span className="relative z-10 text-white font-medium drop-shadow-lg">Sign Up</span>
            </motion.button>

          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-3xl text-gray-300"
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden mt-4 pb-4"
          >
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavigation(link.path)}
                className={`block w-full text-left py-2 ${
                  location.pathname === link.path.split('#')[0]
                    ? 'text-blue-400'
                    : 'text-gray-300 hover:text-blue-400'
                } transition-colors`}
              >
                {link.name}
              </button>
            ))}
            <div className="flex flex-col space-y-2 mt-4">
              <button 
                onClick={() => handleNavigation('/login')}
                className="px-5 py-2 text-blue-400 border-2 border-blue-500 rounded-lg font-semibold"
              >
                Login
              </button>
              <button 
                onClick={() => handleNavigation('/register')}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-semibold"
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
};

export default Header;

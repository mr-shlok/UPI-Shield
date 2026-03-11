import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground: React.FC = () => {
  // Debug log to verify component is rendering
  useEffect(() => {
    console.log('AnimatedBackground component is rendering');
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Create a grid of dots instead of random positions */}
      {Array.from({ length: 50 }).map((_, i) => {
        const row = Math.floor(i / 10);
        const col = i % 10;
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500"
            style={{
              top: `${15 + row * 15}%`,
              left: `${5 + col * 10}%`,
              width: '8px',
              height: '8px',
              opacity: 0.6,
              filter: 'blur(1px)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.7, 0.3],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3 + (i % 5),
              delay: i * 0.1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
      
      {/* Larger animated dots for more visual impact */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={`large-${i}`}
          className="absolute rounded-full bg-blue-400"
          style={{
            top: `${20 + (i * 8)}%`,
            left: `${15 + (i * 8)}%`,
            width: '16px',
            height: '16px',
            opacity: 0.4,
            filter: 'blur(2px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.6, 0.2],
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 4 + (i % 3),
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
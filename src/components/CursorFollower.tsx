'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CursorFollower() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [trails, setTrails] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; timestamp: number }>>([]);

  // Smooth spring animations for cursor
  const cursorX = useSpring(0, { stiffness: 400, damping: 25 });
  const cursorY = useSpring(0, { stiffness: 400, damping: 25 });
  
  // Parallax effect for outer ring
  const outerX = useSpring(0, { stiffness: 200, damping: 30 });
  const outerY = useSpring(0, { stiffness: 200, damping: 30 });

  const mouseXMotion = useMotionValue(0);
  const mouseYMotion = useMotionValue(0);

  // Add trail particle
  const addTrail = useCallback((x: number, y: number) => {
    const newTrail = { id: Date.now() + Math.random(), x, y };
    setTrails((prev) => [...prev.slice(-8), newTrail]); // Keep last 8 trails
  }, []);

  // Add click ripple
  const addRipple = useCallback((x: number, y: number) => {
    const newRipple = { id: Date.now() + Math.random(), x, y, timestamp: Date.now() };
    setRipples((prev) => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 800);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    document.body.classList.add('custom-cursor');
    let trailCounter = 0;

    const updateMousePosition = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      
      setMousePosition({ x, y });
      cursorX.set(x);
      cursorY.set(y);
      outerX.set(x);
      outerY.set(y);
      mouseXMotion.set(x);
      mouseYMotion.set(y);
      
      // Update CSS variable for gradient
      document.documentElement.style.setProperty('--cursor-x', `${x}px`);
      document.documentElement.style.setProperty('--cursor-y', `${y}px`);
      document.body.classList.add('cursor-active');

      // Add trail every few pixels moved
      trailCounter++;
      if (trailCounter % 3 === 0) {
        addTrail(x, y);
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('button') || target.closest('a')) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('button') || target.closest('a')) {
        setIsHovering(false);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      addRipple(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    window.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('custom-cursor', 'cursor-active');
    };
  }, [cursorX, cursorY, outerX, outerY, mouseXMotion, mouseYMotion, addTrail, addRipple]);

  return (
    <>
      {/* Trail particles */}
      {trails.map((trail, index) => (
        <motion.div
          key={trail.id}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ 
            scale: 0,
            opacity: 0,
          }}
          transition={{ 
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="fixed top-0 left-0 pointer-events-none z-50"
          style={{
            x: trail.x - 4,
            y: trail.y - 4,
            width: 8,
            height: 8,
          }}
        >
          <div 
            className="w-full h-full rounded-full mix-blend-screen"
            style={{
              background: `radial-gradient(circle, rgba(255, 255, 255, ${0.8 - index * 0.1}) 0%, transparent 70%)`,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            }}
          />
        </motion.div>
      ))}

      {/* Click ripples */}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ 
            scale: 4,
            opacity: 0,
          }}
          transition={{ 
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="fixed top-0 left-0 pointer-events-none z-50"
          style={{
            x: ripple.x - 20,
            y: ripple.y - 20,
            width: 40,
            height: 40,
          }}
        >
          <div 
            className="w-full h-full rounded-full border-2 border-white/40"
            style={{
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
            }}
          />
        </motion.div>
      ))}

      {/* Outer ring with parallax - slower movement */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50 mix-blend-difference"
        style={{
          x: outerX,
          y: outerY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div 
          className="relative rounded-full"
          animate={{
            width: isHovering ? 80 : 48,
            height: isHovering ? 80 : 48,
            scale: isClicking ? 0.9 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          {/* Main ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              borderColor: isHovering ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)',
              borderWidth: isHovering ? '2px' : '1.5px',
              backgroundColor: isHovering ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
            }}
            style={{
              border: '1.5px solid rgba(255, 255, 255, 0.5)',
              backdropFilter: isHovering ? 'blur(8px)' : 'blur(4px)',
              boxShadow: isHovering 
                ? '0 0 30px rgba(255, 255, 255, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)' 
                : '0 0 15px rgba(255, 255, 255, 0.2)',
            }}
          />

          {/* Rotating gradient border on hover */}
          {isHovering && (
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255, 255, 255, 0.6) 90deg, transparent 180deg, rgba(255, 255, 255, 0.6) 270deg, transparent 360deg)',
                mask: 'radial-gradient(circle, transparent 60%, black 61%, black 100%)',
                WebkitMask: 'radial-gradient(circle, transparent 60%, black 61%, black 100%)',
              }}
            />
          )}

          {/* Pulsing inner glow on hover */}
          {isHovering && (
            <motion.div
              className="absolute inset-2 rounded-full"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [0.9, 1, 0.9],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />
          )}

          {/* Orbiting particles on hover */}
          {isHovering && [0, 120, 240].map((angle, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-white/80"
              animate={{
                rotate: [angle, angle + 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.1,
              }}
              style={{
                transformOrigin: '0 0',
                x: -4,
                y: -4,
                filter: 'blur(0.5px)',
                boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
              }}
            >
              <div style={{ 
                transform: `translateX(${isHovering ? 32 : 20}px)`,
                transition: 'transform 0.3s ease',
              }} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Inner dot - faster movement */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50 mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          animate={{
            scale: isHovering ? 0 : (isClicking ? 0.6 : 1),
            opacity: isHovering ? 0 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 28,
          }}
          className="relative"
        >
          {/* Core dot */}
          <div 
            className="w-2 h-2 rounded-full bg-white"
            style={{
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.4)',
            }}
          />
          
          {/* Pulsing glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white"
            animate={{
              scale: [1, 2, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              filter: 'blur(4px)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Magnetic field effect - only visible on hover */}
      {isHovering && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-40"
          style={{
            x: mouseXMotion,
            y: mouseYMotion,
            translateX: '-50%',
            translateY: '-50%',
          }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1.5,
              opacity: [0.1, 0.2, 0.1],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-64 h-64 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
              filter: 'blur(20px)',
              mixBlendMode: 'screen',
            }}
          />
        </motion.div>
      )}
    </>
  );
}

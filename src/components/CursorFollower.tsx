'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CursorFollower() {
  const [mounted, setMounted] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  
  const cursorX = useSpring(0, { damping: 30, stiffness: 200 });
  const cursorY = useSpring(0, { damping: 30, stiffness: 200 });
  
  const rafId = useRef<number>();

  useEffect(() => {
    setMounted(true);

    const updateCursor = (e: MouseEvent) => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      
      rafId.current = requestAnimationFrame(() => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
      });

      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' ||
        target.closest('a') !== null ||
        target.closest('button') !== null ||
        window.getComputedStyle(target).cursor === 'pointer';
      
      setIsPointer(isClickable);
    };

    window.addEventListener('mousemove', updateCursor, { passive: true });

    return () => {
      window.removeEventListener('mousemove', updateCursor);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [cursorX, cursorY]);

  if (!mounted) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="fixed w-8 h-8 pointer-events-none z-[9999] mix-blend-screen"
        style={{
          left: cursorX,
          top: cursorY,
          x: '-50%',
          y: '-50%',
        }}
      >
        <motion.div
          animate={{
            scale: isPointer ? 1.5 : 1,
            opacity: isPointer ? 0.9 : 0.7,
          }}
          transition={{ duration: 0.2 }}
          className="w-full h-full rounded-full border-2 border-white"
          style={{
            boxShadow: '0 0 25px rgba(255, 255, 255, 0.9)',
          }}
        />
      </motion.div>

      {/* Inner dot */}
      <motion.div
        className="fixed w-1.5 h-1.5 pointer-events-none z-[9999] mix-blend-screen"
        style={{
          left: cursorX,
          top: cursorY,
          x: '-50%',
          y: '-50%',
        }}
      >
        <motion.div
          animate={{
            scale: isPointer ? 0 : 1,
          }}
          transition={{ duration: 0.15 }}
          className="w-full h-full rounded-full bg-white"
          style={{
            boxShadow: '0 0 15px rgba(255, 255, 255, 1)',
          }}
        />
      </motion.div>
    </>
  );
}

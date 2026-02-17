'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-black" />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const lineVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.3,
      },
    },
  };

  return (
    <motion.div 
      style={{ opacity, scale }}
      className="relative min-h-screen flex items-center justify-center px-6"
    >
      {/* Simplified background - static orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.015] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center max-w-5xl"
      >
        {/* Top line */}
        <motion.div
          variants={lineVariants}
          className="h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent mb-16"
        />

        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-block font-mono text-xs tracking-[0.4em] text-white/50 uppercase px-6 py-2 glass rounded-full">
            Portfolio
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-display font-light text-white mb-8"
        >
          <span className="block text-7xl md:text-9xl tracking-tight text-gradient-soft">
            DOOM
          </span>
        </motion.h1>

        <motion.div variants={itemVariants} className="mb-6">
          <p className="font-display text-2xl md:text-3xl text-white/60 tracking-wide inline-block px-8 py-3 glass-strong rounded-2xl">
            RBLX Developer, CS Enthusiast.
          </p>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="font-mono text-sm md:text-base text-white/40 max-w-2xl mx-auto leading-relaxed px-6"
        >
                             Roblox Developer and Cyber-Security analyst. 
          Most notably recognized for the creation of the best external Blade Ball Auto Parry, 
                                during the widespread Roblox ban wave.
        </motion.p>

        {/* Bottom line */}
        <motion.div
          variants={lineVariants}
          className="h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent mt-16"
        />

        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center mt-16"
        >
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 rounded-full font-mono text-sm text-black bg-white hover:bg-white/90 transition-all"
          >
            Get in Touch
          </motion.a>
        </motion.div>

        {/* Simplified scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-3 glass px-4 py-3 rounded-full">
            <span className="font-mono text-xs text-white/30 tracking-[0.3em]">SCROLL</span>
            <svg className="w-4 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </motion.div>

      <div className="noise-overlay" />
    </motion.div>
  );
}

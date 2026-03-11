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
    return <div className="min-h-screen bg-[#0a0118]" />;
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
      className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Purple orb */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
        />
        
        {/* Pink orb */}
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-3xl"
        />
        
        {/* Cyan orb */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 right-1/3 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

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
          className="h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-16"
        />

        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-block font-mono text-xs tracking-[0.4em] text-purple-300/80 uppercase px-6 py-2 glass rounded-full border border-purple-500/30">
            Portfolio
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-display font-light mb-8"
        >
          <span className="block text-7xl md:text-9xl tracking-tight text-gradient">
            DOOM
          </span>
        </motion.h1>

        <motion.div variants={itemVariants} className="mb-6">
          <div className="inline-block px-8 py-3 glass-strong rounded-2xl border border-purple-500/20">
            <p className="font-display text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 tracking-wide">
              Creative Developer & Designer
            </p>
          </div>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="font-mono text-sm md:text-base text-purple-200/60 max-w-2xl mx-auto leading-relaxed px-6"
        >
          Crafting digital experiences at the intersection of art and technology.
          Specializing in minimalist design, fluid animations, and immersive web experiences.
        </motion.p>

        {/* Bottom line */}
        <motion.div
          variants={lineVariants}
          className="h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent mt-16"
        />

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-4 mt-16"
        >
          <motion.a
            href="/ocr"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 glass-strong rounded-full font-mono text-sm text-purple-300 hover:text-white transition-colors border border-purple-500/30 hover:border-purple-500/60 glow-purple"
          >
            OCR Tool
          </motion.a>
          
          <motion.a
            href="/chess"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 glass-strong rounded-full font-mono text-sm text-purple-300 hover:text-white transition-colors border border-purple-500/30 hover:border-purple-500/60 glow-purple"
          >
            Chess
          </motion.a>
          
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-10 py-4 rounded-full font-mono text-sm text-white btn-gradient overflow-hidden group"
          >
            <span className="relative z-10">Get in Touch</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ opacity: 0.3 }}
            />
          </motion.a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-3 glass px-4 py-3 rounded-full border border-purple-500/20"
          >
            <span className="font-mono text-xs text-purple-300/50 tracking-[0.3em]">SCROLL</span>
            <svg className="w-4 h-6 text-purple-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="noise-overlay" />
    </motion.div>
  );
}

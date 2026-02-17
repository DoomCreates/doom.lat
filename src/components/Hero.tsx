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
    hidden: { y: 60, opacity: 0, filter: 'blur(10px)' },
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0, x: -100, y: -100 }}
          animate={{ 
            opacity: 0.015, 
            scale: 1,
            x: 0,
            y: 0,
          }}
          transition={{ 
            duration: 2.5, 
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-float"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0, x: 100, y: 100 }}
          animate={{ 
            opacity: 0.01, 
            scale: 1,
            x: 0,
            y: 0,
          }}
          transition={{ 
            duration: 2.5, 
            delay: 0.6,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white rounded-full blur-3xl animate-float"
          style={{ animationDelay: '3s' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-full max-w-4xl h-[600px] glass rounded-3xl" />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center max-w-5xl"
      >
        <motion.div
          variants={lineVariants}
          className="h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent mb-16 origin-center relative overflow-hidden"
        >
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              delay: 1.5,
            }}
            className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-block font-mono text-xs tracking-[0.4em] text-white/50 uppercase px-6 py-2 glass rounded-full">
            Portfolio
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-display font-light text-white mb-8 relative"
        >
          <motion.span 
            className="block text-7xl md:text-9xl tracking-tight"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-gradient-soft inline-block">DOOM</span>
          </motion.span>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 2 }}
            className="absolute inset-0 blur-3xl bg-white/5 -z-10"
          />
        </motion.h1>

        <motion.div variants={itemVariants} className="mb-6">
          <p className="font-display text-2xl md:text-3xl text-white/60 tracking-wide inline-block px-8 py-3 glass-strong rounded-2xl">
            Creative Developer & Designer
          </p>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="font-mono text-sm md:text-base text-white/40 max-w-2xl mx-auto leading-relaxed px-6"
        >
          Crafting digital experiences at the intersection of art and technology.
          Specializing in minimalist design, fluid animations, and immersive web experiences.
        </motion.p>

        <motion.div
          variants={lineVariants}
          className="h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent mt-16 origin-center relative overflow-hidden"
        >
          <motion.div
            animate={{
              x: ['100%', '-100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              delay: 1.5,
            }}
            className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center mt-16"
        >
          <motion.a
            href="#contact"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
            }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-10 py-4 rounded-full font-mono text-sm text-black bg-white hover:bg-white/90 transition-all overflow-hidden"
          >
            <span className="relative z-10">Get in Touch</span>
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: [0, 0.5, 0.5, 0], y: [0, 10, 10, 0] }}
          transition={{
            duration: 2.5,
            delay: 2.5,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-3 glass px-4 py-3 rounded-full">
            <span className="font-mono text-xs text-white/30 tracking-[0.3em]">SCROLL</span>
            <motion.svg
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-4 h-6 text-white/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </motion.svg>
          </div>
        </motion.div>
      </motion.div>

      <div className="noise-overlay" />
    </motion.div>
  );
}

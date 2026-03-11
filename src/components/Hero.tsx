'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 z-10 overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/[0.06] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-5xl relative z-10"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <span className="inline-block px-4 py-1.5 glass rounded-full font-mono text-xs tracking-[0.2em] text-purple-300/60 uppercase border border-purple-500/20">
            Developer · Creator · Engineer
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          variants={itemVariants}
          className="font-display text-6xl md:text-8xl lg:text-9xl text-gradient mb-6 font-light tracking-tight leading-none"
        >
          DOOM
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="font-display text-2xl md:text-3xl text-purple-200/60 mb-4 font-light"
        >
          doom.lat
        </motion.p>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="font-mono text-sm text-purple-300/50 max-w-2xl mx-auto leading-relaxed mb-4"
        >
          Building things that shouldn't exist. Precision tools, experimental software,
          and whatever else demands to be made.
        </motion.p>

        {/* Scroll hint */}
        <motion.p
          variants={itemVariants}
          className="font-mono text-xs text-purple-400/30 tracking-[0.3em] uppercase mb-2"
        >
          Scroll to explore
        </motion.p>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          className="w-px h-12 bg-gradient-to-b from-purple-500/40 to-transparent mx-auto mb-2"
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

        {/* Nav links */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-8 mt-12"
        >
          <Link
            href="#projects"
            className="font-mono text-xs text-purple-400/40 hover:text-purple-300 transition-colors tracking-[0.15em] uppercase"
          >
            Projects
          </Link>
          <div className="w-1 h-1 rounded-full bg-purple-500/30" />
          <Link
            href="#quotes"
            className="font-mono text-xs text-purple-400/40 hover:text-purple-300 transition-colors tracking-[0.15em] uppercase"
          >
            Philosophy
          </Link>
          <div className="w-1 h-1 rounded-full bg-purple-500/30" />
          <Link
            href="#contact"
            className="font-mono text-xs text-purple-400/40 hover:text-purple-300 transition-colors tracking-[0.15em] uppercase"
          >
            Contact
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

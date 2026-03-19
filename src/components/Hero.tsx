'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-5 z-10 overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center w-full max-w-5xl relative z-10"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-6 md:mb-8">
          <span className="inline-block px-4 py-1.5 glass border border-white/8 font-mono text-[10px] md:text-xs tracking-[0.2em] text-white/40 uppercase">
            Developer / Creator / Engineer
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          variants={itemVariants}
          className="font-display text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] text-gradient mb-4 md:mb-6 font-light tracking-tight leading-none"
        >
          DOOM
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="font-display text-xl md:text-3xl text-white/40 mb-3 md:mb-4 font-light"
        >
          doom.lat
        </motion.p>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="font-mono text-xs md:text-sm text-white/30 max-w-sm md:max-w-2xl mx-auto leading-relaxed mb-3 md:mb-4 px-2"
        >
          Building things that shouldn&apos;t exist. Precision tools, experimental software,
          and whatever else demands to be made.
        </motion.p>

        {/* Scroll hint */}
        <motion.p
          variants={itemVariants}
          className="font-mono text-[10px] md:text-xs text-white/20 tracking-[0.25em] uppercase mb-2"
        >
          Scroll to explore
        </motion.p>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          className="w-px h-8 md:h-10 bg-gradient-to-b from-white/20 to-transparent mx-auto mb-2"
        />

        {/* CTA Buttons — 2-col grid on mobile, flex-wrap on larger */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-3 mt-10 md:mt-14 px-2"
        >
          <motion.a
            href="/ocr"
            whileTap={{ scale: 0.96 }}
            className="px-4 py-3 sm:px-7 sm:py-2.5 glass border border-white/10 active:border-white/25 font-mono text-xs sm:text-sm text-white/50 active:text-white transition-colors text-center"
          >
            OCR Tool
          </motion.a>

          <motion.a
            href="/chess"
            whileTap={{ scale: 0.96 }}
            className="px-4 py-3 sm:px-7 sm:py-2.5 glass border border-white/10 active:border-white/25 font-mono text-xs sm:text-sm text-white/50 active:text-white transition-colors text-center"
          >
            Chess
          </motion.a>

          <motion.a
            href="/lab"
            whileTap={{ scale: 0.96 }}
            className="px-4 py-3 sm:px-7 sm:py-2.5 glass border border-white/10 active:border-white/25 font-mono text-xs sm:text-sm text-white/50 active:text-white transition-colors text-center"
          >
            CyberSec Lab
          </motion.a>

          <motion.a
            href="#contact"
            whileTap={{ scale: 0.96 }}
            className="px-4 py-3 sm:px-8 sm:py-2.5 btn-gradient font-mono text-xs sm:text-sm text-center"
          >
            Get in Touch
          </motion.a>
        </motion.div>

        {/* Nav links — hidden on very small, shown on sm+ */}
        <motion.div
          variants={itemVariants}
          className="hidden sm:flex items-center justify-center gap-6 md:gap-8 mt-10 md:mt-12"
        >
          <Link href="#projects" className="font-mono text-xs text-white/20 hover:text-white/60 transition-colors tracking-[0.15em] uppercase">
            Projects
          </Link>
          <div className="w-4 h-px bg-white/10" />
          <Link href="#quotes" className="font-mono text-xs text-white/20 hover:text-white/60 transition-colors tracking-[0.15em] uppercase">
            Philosophy
          </Link>
          <div className="w-4 h-px bg-white/10" />
          <Link href="#contact" className="font-mono text-xs text-white/20 hover:text-white/60 transition-colors tracking-[0.15em] uppercase">
            Contact
          </Link>
          <div className="w-4 h-px bg-white/10" />
          <Link href="/lab" className="font-mono text-xs text-white/20 hover:text-white/60 transition-colors tracking-[0.15em] uppercase">
            Lab
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

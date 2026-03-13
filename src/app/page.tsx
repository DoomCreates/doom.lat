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
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 z-10 overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />

      {/* Top / bottom edge lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-5xl relative z-10"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <span className="inline-block px-5 py-1.5 glass border border-white/8 font-mono text-xs tracking-[0.25em] text-white/40 uppercase">
            Developer &nbsp;/&nbsp; Creator &nbsp;/&nbsp; Engineer
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
          className="font-display text-2xl md:text-3xl text-white/40 mb-4 font-light"
        >
          doom.lat
        </motion.p>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="font-mono text-sm text-white/30 max-w-2xl mx-auto leading-relaxed mb-4"
        >
          Building things that shouldn&apos;t exist. Precision tools, experimental software,
          and whatever else demands to be made.
        </motion.p>

        {/* Scroll hint */}
        <motion.p
          variants={itemVariants}
          className="font-mono text-xs text-white/20 tracking-[0.3em] uppercase mb-2"
        >
          Scroll to explore
        </motion.p>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent mx-auto mb-2"
        />

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-3 mt-14"
        >
          <motion.a
            href="/ocr"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-2.5 glass border border-white/10 hover:border-white/25 font-mono text-sm text-white/50 hover:text-white transition-colors"
          >
            OCR Tool
          </motion.a>

          <motion.a
            href="/chess"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-2.5 glass border border-white/10 hover:border-white/25 font-mono text-sm text-white/50 hover:text-white transition-colors"
          >
            Chess
          </motion.a>

          <motion.a
            href="/lab"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-2.5 glass border border-white/10 hover:border-white/25 font-mono text-sm text-white/50 hover:text-white transition-colors"
          >
            Hacker Lab
          </motion.a>

          <motion.a
            href="#contact"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-2.5 btn-gradient font-mono text-sm"
          >
            Get in Touch
          </motion.a>
        </motion.div>

        {/* Nav links */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-8 mt-12"
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

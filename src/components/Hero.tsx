'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const up = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const headingY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const opacity  = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col justify-center overflow-hidden">

      {/* Ambient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] orb bg-white/[0.015] pointer-events-none" />

      {/* Grid */}
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

      {/* Top rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/8 pointer-events-none" />

      <motion.div style={{ opacity }} className="relative z-10 w-full">

        <motion.div style={{ y: headingY }} className="px-6 md:px-12 lg:px-20 pt-24 pb-12">
          <motion.div variants={stagger} initial="hidden" animate="visible">

            {/* Eyebrow */}
            <motion.div variants={up} className="mb-8 md:mb-12 flex items-center gap-4">
              <div className="h-px w-8 bg-white/20" />
              <span className="font-mono text-[10px] md:text-xs tracking-[0.3em] text-white/35 uppercase">
                Developer &nbsp; Creator &nbsp; Engineer
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              variants={up}
              className="font-display text-hero font-light text-[clamp(5rem,18vw,16rem)] leading-[0.88] mb-8"
            >
              DOOM
            </motion.h1>

            {/* Sub-line */}
            <motion.p
              variants={up}
              className="font-mono text-xs md:text-sm text-white/35 max-w-md leading-loose tracking-wide mb-12 md:mb-16"
            >
              Building things that shouldn&apos;t exist — precision tools,
              experimental software, and whatever else demands to be made.
            </motion.p>

            {/* CTA row */}
            <motion.div variants={up} className="flex flex-wrap gap-3">
              <a href="/ocr"
                className="px-6 py-2.5 panel font-mono text-xs text-white/50 hover:text-white hover:border-white/25 transition-all duration-150">
                OCR Tool
              </a>
              <a href="/chess"
                className="px-6 py-2.5 panel font-mono text-xs text-white/50 hover:text-white hover:border-white/25 transition-all duration-150">
                Chess
              </a>
              <a href="/neural"
                className="px-6 py-2.5 panel font-mono text-xs text-white/50 hover:text-white hover:border-white/25 transition-all duration-150">
                Neural Network
              </a>
              <a href="/lab"
                className="px-6 py-2.5 panel font-mono text-xs text-white/50 hover:text-white hover:border-white/25 transition-all duration-150">
                Hacker Lab
              </a>
              <a href="#contact"
                className="px-6 py-2.5 btn-gradient font-mono text-xs">
                Get in Touch
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom rule + nav links */}
        <motion.div
          variants={up}
          initial="hidden"
          animate="visible"
          className="px-6 md:px-12 lg:px-20 flex items-center justify-between"
        >
          <div className="h-px flex-1 bg-white/8" />
          <div className="hidden sm:flex items-center gap-8 px-8">
            <Link href="#projects" className="font-mono text-[10px] text-white/20 hover:text-white/50 transition-colors tracking-[0.2em] uppercase">Projects</Link>
            <Link href="#quotes"   className="font-mono text-[10px] text-white/20 hover:text-white/50 transition-colors tracking-[0.2em] uppercase">Philosophy</Link>
            <Link href="#contact"  className="font-mono text-[10px] text-white/20 hover:text-white/50 transition-colors tracking-[0.2em] uppercase">Contact</Link>
            <Link href="/neural"   className="font-mono text-[10px] text-white/20 hover:text-white/50 transition-colors tracking-[0.2em] uppercase">Neural</Link>
            <Link href="/lab"      className="font-mono text-[10px] text-white/20 hover:text-white/50 transition-colors tracking-[0.2em] uppercase">Lab</Link>
          </div>
          <div className="h-px w-8 bg-white/8" />
        </motion.div>
      </motion.div>
    </section>
  );
}

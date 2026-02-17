'use client';

import CursorFollower from '@/components/CursorFollower';
import Hero from '@/components/Hero';
import MusicPlayer from '@/components/MusicPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Curated collection of real quotes
const QUOTES = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "Innovation"
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
    category: "Philosophy"
  },
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    category: "Programming"
  },
  {
    text: "The best way to predict the future is to invent it.",
    author: "Alan Kay",
    category: "Innovation"
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    category: "Programming"
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    category: "Innovation"
  },
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
    category: "Programming"
  },
  {
    text: "The function of good software is to make the complex appear to be simple.",
    author: "Grady Booch",
    category: "Philosophy"
  },
  {
    text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",
    author: "Antoine de Saint-Exupéry",
    category: "Philosophy"
  },
  {
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
    category: "Programming"
  },
  {
    text: "The advance of technology is based on making it fit in so that you don't really even notice it.",
    author: "Bill Gates",
    category: "Innovation"
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
    category: "Programming"
  },
  {
    text: "The most damaging phrase in the language is: 'We've always done it this way.'",
    author: "Grace Hopper",
    category: "Innovation"
  },
  {
    text: "Design is not just what it looks like and feels like. Design is how it works.",
    author: "Steve Jobs",
    category: "Philosophy"
  },
  {
    text: "Truth can only be found in one place: the code.",
    author: "Robert C. Martin",
    category: "Programming"
  },
  {
    text: "The computer was born to solve problems that did not exist before.",
    author: "Bill Gates",
    category: "Philosophy"
  },
  {
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    category: "Programming"
  },
  {
    text: "It's not a bug – it's an undocumented feature.",
    author: "Anonymous",
    category: "Programming"
  },
  {
    text: "The only source of knowledge is experience.",
    author: "Albert Einstein",
    category: "Philosophy"
  },
  {
    text: "Stay hungry, stay foolish.",
    author: "Steve Jobs",
    category: "Innovation"
  },
];

export default function Home() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const currentQuote = QUOTES[currentQuoteIndex];

  // Auto-advance quotes
  useEffect(() => {
    const timer = setInterval(() => {
      nextQuote();
    }, 8000); // Change quote every 8 seconds

    return () => clearInterval(timer);
  }, [currentQuoteIndex]);

  const nextQuote = () => {
    setDirection(1);
    setCurrentQuoteIndex((prev) => (prev + 1) % QUOTES.length);
  };

  const previousQuote = () => {
    setDirection(-1);
    setCurrentQuoteIndex((prev) => (prev - 1 + QUOTES.length) % QUOTES.length);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      filter: 'blur(10px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      filter: 'blur(10px)',
    }),
  };

  return (
    <main className="relative bg-black">
      {/* Custom cursor */}
      <CursorFollower />

      {/* Hero section */}
      <Hero />

      {/* External Blade Ball AP Showcase Section */}
      <section id="showcase" className="min-h-screen flex items-center justify-center px-6 relative z-10 py-20">
        <div className="max-w-7xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            {/* Left side - Video with cool frame */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Decorative frame elements */}
              <div className="absolute -inset-4 glass-strong rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-6 -left-6 w-24 h-24 border-t-2 border-l-2 border-white/20 rounded-tl-2xl" />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 border-b-2 border-r-2 border-white/20 rounded-br-2xl" />
              
              {/* Glowing corners */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-2 -left-2 w-4 h-4 bg-white/40 rounded-full blur-md"
              />
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1.5,
                }}
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-white/40 rounded-full blur-md"
              />

              {/* Video container */}
              <div className="relative glass-strong rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="aspect-video bg-black/20 flex items-center justify-center">
                  {/* Replace this with your actual video */}
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src="/videos/blade-ball-showcase.mp4" type="video/mp4" />
                    {/* Fallback content */}
                    <div className="flex flex-col items-center justify-center h-full text-white/50">
                      <svg
                        className="w-20 h-20 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="font-mono text-sm">Video Preview</p>
                    </div>
                  </video>
                </div>

                {/* Video overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating particles around video */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-10 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-2xl"
              />
              <motion.div
                animate={{
                  y: [0, 10, 0],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 2,
                }}
                className="absolute -bottom-10 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-2xl"
              />
            </motion.div>

            {/* Right side - Heading + Description */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Label */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1.5 glass rounded-full font-mono text-xs tracking-[0.2em] text-white/40 uppercase">
                  Featured Project
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="font-display text-4xl md:text-6xl text-white font-light tracking-tight leading-tight"
              >
                External Blade Ball AP Showcase
              </motion.h2>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <p className="font-mono text-base text-white/60 leading-relaxed">
                  An advanced automation platform designed for Blade Ball, featuring intelligent auto-parry mechanics, 
                  precision timing algorithms, and seamless integration with game mechanics.
                </p>
                <p className="font-mono text-base text-white/60 leading-relaxed">
                  Built with cutting-edge technology to deliver unparalleled performance and reliability, 
                  pushing the boundaries of what's possible in game automation.
                </p>
              </motion.div>

              {/* Features list */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
                className="space-y-3"
              >
                {[
                  'Intelligent Auto-Parry System',
                  'Real-time Performance Optimization',
                  'Advanced Detection Evasion',
                  'Seamless User Experience',
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full group-hover:bg-white/80 transition-colors" />
                    <span className="font-mono text-sm text-white/50 group-hover:text-white/80 transition-colors">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                viewport={{ once: true }}
                className="pt-4"
              >
                <motion.a
                  href="#contact"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 0 30px rgba(255, 255, 255, 0.2)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block px-8 py-3 glass-strong rounded-full font-mono text-sm text-white/80 hover:text-white transition-colors"
                >
                  Learn More
                </motion.a>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quotes section */}
      <section id="quotes" className="min-h-screen flex items-center justify-center px-6 relative z-10 py-20">
        <div className="max-w-5xl w-full">
          {/* Section title */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-6xl text-white mb-4 font-light tracking-tight">
              Philosophy
            </h2>
            <p className="font-mono text-xs text-white/30 tracking-[0.3em] uppercase">
              Quotes on Innovation, Programming & Design
            </p>
          </motion.div>

          {/* Quote carousel */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glass container */}
            <div className="glass-strong rounded-3xl p-12 md:p-16 relative overflow-hidden">
              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-white/10 rounded-tl-3xl" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-white/10 rounded-br-3xl" />

              {/* Quote content with animation */}
              <div className="relative min-h-[300px] flex flex-col justify-center">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentQuoteIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.4 },
                      filter: { duration: 0.4 },
                    }}
                    className="text-center"
                  >
                    {/* Category badge */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mb-8"
                    >
                      <span className="inline-block px-4 py-1.5 glass rounded-full font-mono text-xs tracking-[0.2em] text-white/40 uppercase">
                        {currentQuote.category}
                      </span>
                    </motion.div>

                    {/* Quote text */}
                    <motion.blockquote
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="font-display text-2xl md:text-4xl text-white/90 font-light leading-relaxed mb-8 relative"
                    >
                      <span className="text-white/20 text-6xl absolute -top-4 -left-2 md:-left-8">"</span>
                      {currentQuote.text}
                      <span className="text-white/20 text-6xl absolute -bottom-8 -right-2 md:-right-8">"</span>
                    </motion.blockquote>

                    {/* Author */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="font-mono text-sm text-white/50"
                    >
                      — {currentQuote.author}
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-center gap-6 mt-12">
                {/* Previous button */}
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={previousQuote}
                  className="w-12 h-12 rounded-full glass flex items-center justify-center transition-colors group"
                  aria-label="Previous quote"
                >
                  <svg
                    className="w-5 h-5 text-white/60 group-hover:text-white/90 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>

                {/* Progress indicator */}
                <div className="flex items-center gap-2">
                  {QUOTES.map((_, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.2 }}
                      onClick={() => {
                        setDirection(index > currentQuoteIndex ? 1 : -1);
                        setCurrentQuoteIndex(index);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentQuoteIndex
                          ? 'w-8 bg-white/60'
                          : 'w-1.5 bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Go to quote ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Next button */}
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextQuote}
                  className="w-12 h-12 rounded-full glass flex items-center justify-center transition-colors group"
                  aria-label="Next quote"
                >
                  <svg
                    className="w-5 h-5 text-white/60 group-hover:text-white/90 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>

              {/* Quote counter */}
              <div className="text-center mt-6">
                <span className="font-mono text-xs text-white/25">
                  {currentQuoteIndex + 1} / {QUOTES.length}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Decorative floating elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{
                y: [0, -20, 0],
                opacity: [0.02, 0.04, 0.02],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-1/4 left-10 w-32 h-32 bg-white rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                y: [0, 20, 0],
                opacity: [0.01, 0.03, 0.01],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="absolute bottom-1/4 right-10 w-40 h-40 bg-white rounded-full blur-3xl"
            />
          </div>
        </div>
      </section>

      {/* Contact section */}
      <section id="contact" className="min-h-screen flex items-center justify-center px-6 relative z-10 mb-32">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-4xl"
        >
          <h2 className="font-display text-5xl md:text-7xl text-white mb-8 font-light tracking-tight">
            Let's Connect
          </h2>
          <p className="font-mono text-white/35 text-sm md:text-base mb-12">
            Interested in working together? Feel free to reach out.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.a
              href="mailto:hello@doom.lat"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 255, 255, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 glass rounded-full font-mono text-sm text-white/70 hover:text-white transition-colors"
            >
              Discord : doomwrites
            </motion.a>
            
            <motion.a
              href="https://discord.gg/FxFpDcpGdC"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 255, 255, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-full font-mono text-sm text-black bg-white hover:bg-white/90 transition-colors"
            >
              My Market Server
            </motion.a>
          </div>
        </motion.div>
      </section>

      {/* Music player */}
      <MusicPlayer />

      {/* Footer */}
      <footer className="relative z-10 pb-8">
        <div className="text-center">
          <p className="font-mono text-xs text-white/15">
            © 2026 doom.lat — Designed & Developed with care
          </p>
        </div>
      </footer>

      {/* Global noise overlay */}
      <div className="noise-overlay" />
    </main>
  );
}

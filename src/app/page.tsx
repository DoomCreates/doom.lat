'use client';

export const dynamic = 'force-dynamic';

import CursorFollower from '@/components/CursorFollower';
import Hero from '@/components/Hero';
import MusicPlayer from '@/components/MusicPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

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
  const [mounted, setMounted] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showFullVideo, setShowFullVideo] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when video modal is open
  useEffect(() => {
    if (showFullVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showFullVideo]);

  // ESC key to close video modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showFullVideo) {
        setShowFullVideo(false);
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [showFullVideo]);

  const currentQuote = QUOTES[currentQuoteIndex];

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

  if (!mounted) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <main className="relative bg-black">
      <CursorFollower />
      <Hero />

      {/* Fullscreen YouTube Video Modal */}
      <AnimatePresence>
        {showFullVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
            onClick={() => setShowFullVideo(false)}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-sm"
            />

            {/* Video Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: -15 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateX: 15 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.22, 1, 0.36, 1]
              }}
              className="relative w-full max-w-7xl aspect-video z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative corners */}
              <div className="absolute -top-4 -left-4 w-32 h-32 border-t-2 border-l-2 border-white/30 rounded-tl-3xl pointer-events-none" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border-b-2 border-r-2 border-white/30 rounded-br-3xl pointer-events-none" />
              
              {/* Corner glows */}
              <motion.div
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-4 -left-4 w-8 h-8 bg-white/50 rounded-full blur-xl pointer-events-none"
              />
              <motion.div
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1.5,
                }}
                className="absolute -bottom-4 -right-4 w-8 h-8 bg-white/50 rounded-full blur-xl pointer-events-none"
              />

              {/* Video frame */}
              <div className="relative glass-strong rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl w-full h-full">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/LiY-GimrsqE?autoplay=1&quality=hd2160"
                  title="Blade Ball Full Showcase"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />

                {/* Gradient overlay at edges - only on non-interactive areas */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>

              {/* Close button */}
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullVideo(false);
                }}
                className="absolute -top-12 -right-12 md:-top-16 md:-right-16 w-12 h-12 rounded-full glass-strong border border-white/20 flex items-center justify-center group z-50"
                aria-label="Close video"
              >
                <svg
                  className="w-6 h-6 text-white/70 group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>

              {/* Title overlay */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute top-6 left-6 z-10 pointer-events-none"
              >
                <div className="glass-strong rounded-full px-4 py-2">
                  <span className="font-mono text-xs tracking-[0.2em] text-white/80 uppercase">
                    Full Showcase - 4K
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Press ESC hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
            >
              <div className="glass rounded-full px-4 py-2 font-mono text-xs text-white/40">
                Press ESC or click outside to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optimized showcase section */}
      <section id="showcase" className="min-h-screen flex items-center justify-center px-6 relative z-10 py-20">
        <div className="max-w-7xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute -top-6 -left-6 w-24 h-24 border-t-2 border-l-2 border-white/20 rounded-tl-2xl" />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 border-b-2 border-r-2 border-white/20 rounded-br-2xl" />
              
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-white/40 rounded-full blur-md" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white/40 rounded-full blur-md" />

              <div className="relative glass-strong rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="aspect-video bg-black/20 flex items-center justify-center">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src="/videos/blade-ball-showcase.mp4" type="video/mp4" />
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Watch Full Showcase Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="mt-6 flex justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 255, 255, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFullVideo(true)}
                  className="group relative px-8 py-4 rounded-full font-mono text-sm text-black bg-white hover:bg-white/90 transition-all overflow-hidden flex items-center gap-3"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Watch Full Showcase</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
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

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="font-display text-4xl md:text-6xl text-white font-light tracking-tight leading-tight"
              >
                External Blade Ball AP Showcase
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <p className="font-mono text-base text-white/60 leading-relaxed">
                  An advanced detection system designed for Blade Ball, with, precision timing algorithms, 
                  and integration with game mechanics.

                  This video captures the moment that we found the breakthrough we needed.
                </p>
                <p className="font-mono text-base text-white/60 leading-relaxed">
                  This was a two-person project, little to no external involvement.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
                className="space-y-3"
              >
                {[
                  'First of its kind',
                  'Real-time debug info',
                  'VERY Advanced Detection Evasion',
                  'Perfect User Experience',
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                viewport={{ once: true }}
                className="pt-4"
              >
                <motion.a
                  href="#contact"
                  whileHover={{ scale: 1.05 }}
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

      <section id="quotes" className="min-h-screen flex items-center justify-center px-6 relative z-10 py-20">
        <div className="max-w-5xl w-full">
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

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="glass-strong rounded-3xl p-12 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-white/10 rounded-tl-3xl" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-white/10 rounded-br-3xl" />

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

              <div className="flex items-center justify-center gap-6 mt-12">
                <motion.button
                  whileHover={{ scale: 1.1 }}
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

                <motion.button
                  whileHover={{ scale: 1.1 }}
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

              <div className="text-center mt-6">
                <span className="font-mono text-xs text-white/25">
                  {currentQuoteIndex + 1} / {QUOTES.length}
                </span>
              </div>
            </div>
          </motion.div>

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-10 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-white/[0.01] rounded-full blur-3xl" />
          </div>
        </div>
      </section>

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
              href="https://pastebin.com/YsWnXpfF"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 glass rounded-full font-mono text-sm text-white/70 hover:text-white transition-colors"
            >
              Discord : supposings
            </motion.a>
            
            <motion.a
              href="https://discord.gg/FxFpDcpGdC"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-full font-mono text-sm text-black bg-white hover:bg-white/90 transition-colors"
            >
              My Market Server
            </motion.a>
          </div>
        </motion.div>
      </section>

      <MusicPlayer />

      <footer className="relative z-10 pb-8">
        <div className="text-center">
          <p className="font-mono text-xs text-white/15">
            © 2026 doom.lat — Designed & Developed with care
          </p>
        </div>
      </footer>

      <div className="noise-overlay" />
    </main>
  );
}

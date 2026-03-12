'use client';

export const dynamic = 'force-dynamic';

import CursorFollower from '@/components/CursorFollower';
import Hero from '@/components/Hero';
import MusicPlayer from '@/components/MusicPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const PROJECTS = [
  {
    id: 1,
    name: "External Blade Ball AP Showcase",
    description: "An advanced detection system designed for Blade Ball, with precision timing algorithms, and integration with game mechanics. This video captures the moment that we found the breakthrough we needed.",
    secondDescription: "This was a two-person project, little to no external involvement.",
    features: [
      "First/Best of its kind",
      "Real-time debug info",
      "Advanced Detection Evasion",
      "Perfect User Experience"
    ],
    previewVideo: "/videos/blade-ball-showcase.mp4",
    youtubeUrl: "https://youtu.be/LiY-GimrsqE",
    githubUrl: "https://github.com/DoomCreates/Nebula.lua",
    label: "Notable Project"
  },
  {
    id: 2,
    name: "J.A.R.V.I.S",
    description: "JARVIS is a locally-run AI assistant that listens to your voice, responds through whatever your audio output is, in a calm and authoritative voice, and can control your Windows PC on command.",
    secondDescription: "Press a single key, speak naturally, and JARVIS handles the rest. (the goal was to make him as similar to the movie version of J.A.R.V.I.S as possible)",
    features: [
      "Voice activation via the backtick key",
      "Natural language processing",
      "Windows PC control",
      "Movie-accurate voice and behavior"
    ],
    previewVideo: "/videos/JarvisShowcasePreview.mp4",
    youtubeUrl: "https://youtu.be/YOUR_VIDEO_ID_HERE",
    githubUrl: "https://github.com/DoomCreates/JarvisAI",
    label: "Open Source"
  },
  {
    id: 3,
    name: "DoomTerminal",
    description: "TBD",
    secondDescription: "TBD",
    features: ["TBD", "TBD", "TBD", "TBD"],
    previewVideo: "/videos/project3-preview.mp4",
    youtubeUrl: "https://youtu.be/YOUR_VIDEO_ID_HERE",
    githubUrl: "https://github.com/DoomCreates/doomterminal",
    label: "Personal Project"
  }
];

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Innovation" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", category: "Philosophy" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler", category: "Programming" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay", category: "Innovation" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson", category: "Programming" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "Innovation" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House", category: "Programming" },
  { text: "The function of good software is to make the complex appear to be simple.", author: "Grady Booch", category: "Philosophy" },
  { text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry", category: "Philosophy" },
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson", category: "Programming" },
  { text: "The advance of technology is based on making it fit in so that you don't really even notice it.", author: "Bill Gates", category: "Innovation" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck", category: "Programming" },
  { text: "The most damaging phrase in the language is: 'We've always done it this way.'", author: "Grace Hopper", category: "Innovation" },
  { text: "Design is not just what it looks like and feels like. Design is how it works.", author: "Steve Jobs", category: "Philosophy" },
  { text: "Truth can only be found in one place: the code.", author: "Robert C. Martin", category: "Programming" },
  { text: "The computer was born to solve problems that did not exist before.", author: "Bill Gates", category: "Philosophy" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds", category: "Programming" },
  { text: "It's not a bug — it's an undocumented feature.", author: "Anonymous", category: "Programming" },
  { text: "The only source of knowledge is experience.", author: "Albert Einstein", category: "Philosophy" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs", category: "Innovation" },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showFullVideo, setShowFullVideo] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = showFullVideo ? 'hidden' : 'unset';
  }, [showFullVideo]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFullVideo) setShowFullVideo(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
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

  const openVideoModal = (youtubeUrl: string) => {
    setCurrentVideoUrl(youtubeUrl);
    setShowFullVideo(true);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      filter: 'blur(10px)',
    }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      filter: 'blur(10px)',
    }),
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#0c0b09]" />;
  }

  return (
    <main className="relative bg-[#0c0b09]">
      <CursorFollower />
      <Hero />

      {/* YouTube Video Modal */}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0c0b09]/95 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-7xl aspect-video z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner accents */}
              <div className="absolute -top-3 -left-3 w-16 h-16 border-t border-l border-[#c4a96a]/30 pointer-events-none" />
              <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b border-r border-[#c4a96a]/30 pointer-events-none" />

              <div className="relative glass-strong border border-[#c4a96a]/20 shadow-2xl glow-accent w-full h-full overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src={`${currentVideoUrl.replace('youtu.be/', 'youtube.com/embed/')}?autoplay=1&quality=hd2160`}
                  title="Project Showcase"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Close button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); setShowFullVideo(false); }}
                className="absolute -top-12 -right-12 md:-top-14 md:-right-14 w-10 h-10 glass border border-[#c4a96a]/20 hover:border-[#c4a96a]/40 flex items-center justify-center transition-colors z-50"
                aria-label="Close video"
              >
                <svg className="w-5 h-5 text-[#a89880]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Label */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute top-5 left-5 z-10 pointer-events-none"
              >
                <div className="glass border border-[#c4a96a]/15 px-4 py-1.5">
                  <span className="font-mono text-xs tracking-[0.2em] text-[#a89880] uppercase">Full Showcase — 4K</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
            >
              <div className="glass border border-[#c4a96a]/10 px-4 py-2 font-mono text-xs text-[#6a5e4e]">
                Press ESC or click outside to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Projects ─────────────────────────────────────────── */}
      <section id="projects" className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10 py-24">
        <div className="max-w-7xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-display text-5xl md:text-7xl text-gradient mb-4 font-light tracking-tight">Projects</h2>
            <p className="font-mono text-xs text-[#6a5e4e] tracking-[0.3em] uppercase">Selected Works &amp; Open Source</p>
          </motion.div>

          <div className="space-y-32">
            {PROJECTS.map((project, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="w-full"
                >
                  <div className={`grid md:grid-cols-2 gap-12 items-center`}>
                    {/* Video side */}
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -60 : 60 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                      viewport={{ once: true }}
                      className={`relative group ${!isEven ? 'md:order-2' : ''}`}
                    >
                      {/* Corner marks */}
                      <div className="absolute -top-4 -left-4 w-16 h-16 border-t border-l border-[#c4a96a]/20 pointer-events-none" />
                      <div className="absolute -bottom-4 -right-4 w-16 h-16 border-b border-r border-[#c4a96a]/15 pointer-events-none" />

                      <div className="relative glass-strong border border-[#c4a96a]/15 shadow-2xl glow-accent overflow-hidden">
                        <div className="aspect-video bg-[#0c0b09]/20 flex items-center justify-center">
                          <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
                            <source src={project.previewVideo} type="video/mp4" />
                          </video>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b09]/40 via-transparent to-transparent pointer-events-none" />
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="mt-5 flex gap-3 justify-center"
                      >
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => openVideoModal(project.youtubeUrl)}
                          className="flex-1 px-5 py-2.5 btn-gradient font-mono text-sm flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          Watch Full
                        </motion.button>

                        <motion.a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex-1 px-5 py-2.5 glass border border-[#c4a96a]/20 hover:border-[#c4a96a]/40 font-mono text-sm text-[#a89880] hover:text-[#e8e1d4] transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          GitHub
                        </motion.a>
                      </motion.div>
                    </motion.div>

                    {/* Text side */}
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? 60 : -60 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                      viewport={{ once: true }}
                      className={`space-y-7 ${!isEven ? 'md:order-1' : ''}`}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <span className="inline-block px-4 py-1 glass border border-[#c4a96a]/15 font-mono text-xs tracking-[0.2em] text-[#9a8060] uppercase">
                          {project.label}
                        </span>
                      </motion.div>

                      <motion.h3
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        viewport={{ once: true }}
                        className="font-display text-4xl md:text-5xl text-gradient-soft font-light tracking-tight leading-tight"
                      >
                        {project.name}
                      </motion.h3>

                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        viewport={{ once: true }}
                        className="space-y-3"
                      >
                        <p className="font-mono text-sm text-[#a89880] leading-relaxed">{project.description}</p>
                        <p className="font-mono text-sm text-[#a89880] leading-relaxed">{project.secondDescription}</p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        viewport={{ once: true }}
                        className="space-y-2.5"
                      >
                        {project.features.map((feature, fi) => (
                          <motion.div
                            key={feature}
                            initial={{ opacity: 0, x: -16 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.9 + fi * 0.08 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-4 h-px bg-[#c4a96a]/40 group-hover:bg-[#c4a96a]/70 transition-colors" />
                            <span className="font-mono text-sm text-[#6a5e4e] group-hover:text-[#a89880] transition-colors">{feature}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Philosophy / Quotes ───────────────────────────────── */}
      <section id="quotes" className="min-h-screen flex items-center justify-center px-6 relative z-10 py-24">
        <div className="max-w-5xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-6xl text-gradient mb-4 font-light tracking-tight">Philosophy</h2>
            <p className="font-mono text-xs text-[#6a5e4e] tracking-[0.3em] uppercase">Quotes on Innovation, Programming &amp; Design</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="glass-strong border border-[#c4a96a]/12 p-12 md:p-16 relative overflow-hidden">
              {/* Corner marks */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-[#c4a96a]/20" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-[#c4a96a]/15" />

              <div className="relative min-h-[280px] flex flex-col justify-center">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentQuoteIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.3 } }}
                    className="text-center"
                  >
                    <div className="mb-6">
                      <span className="inline-block px-4 py-1 glass border border-[#c4a96a]/15 font-mono text-xs tracking-[0.2em] text-[#9a8060] uppercase">
                        {currentQuote.category}
                      </span>
                    </div>

                    <blockquote className="font-display text-2xl md:text-3xl text-[#e8e1d4] font-light leading-relaxed mb-8 relative">
                      <span className="text-[#c4a96a]/15 text-6xl absolute -top-2 -left-2 md:-left-6 select-none">&ldquo;</span>
                      {currentQuote.text}
                      <span className="text-[#c4a96a]/15 text-6xl absolute -bottom-6 -right-2 md:-right-6 select-none">&rdquo;</span>
                    </blockquote>

                    <div className="font-mono text-sm text-[#6a5e4e]">
                      &mdash; {currentQuote.author}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-10">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={previousQuote}
                  className="w-10 h-10 glass border border-[#c4a96a]/15 hover:border-[#c4a96a]/35 flex items-center justify-center transition-colors group"
                  aria-label="Previous quote"
                >
                  <svg className="w-4 h-4 text-[#9a8060] group-hover:text-[#e8e1d4] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>

                <div className="flex items-center gap-2">
                  {QUOTES.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => { setDirection(index > currentQuoteIndex ? 1 : -1); setCurrentQuoteIndex(index); }}
                      className={`transition-all ${index === currentQuoteIndex ? 'w-6 h-1 bg-[#c4a96a]' : 'w-1 h-1 bg-[#4a4035] hover:bg-[#9a8060]'}`}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={nextQuote}
                  className="w-10 h-10 glass border border-[#c4a96a]/15 hover:border-[#c4a96a]/35 flex items-center justify-center transition-colors group"
                  aria-label="Next quote"
                >
                  <svg className="w-4 h-4 text-[#9a8060] group-hover:text-[#e8e1d4] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>

              <div className="text-center mt-4">
                <span className="font-mono text-xs text-[#4a4035]">{currentQuoteIndex + 1} / {QUOTES.length}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────── */}
      <section id="contact" className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10 py-24">
        <div className="max-w-4xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-5 py-1.5 glass border border-[#c4a96a]/15 font-mono text-xs tracking-[0.25em] text-[#9a8060] uppercase mb-8">
              Get in touch
            </span>
            <h2 className="font-display text-5xl md:text-7xl text-gradient mb-8 font-light tracking-tight">Let&apos;s Connect</h2>
            <p className="font-mono text-[#6a5e4e] text-sm mb-12">Interested in working together? Feel free to reach out.</p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.a
                href="https://pastebin.com/G4yHeMKG"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-3.5 glass border border-[#c4a96a]/20 hover:border-[#c4a96a]/40 font-mono text-sm text-[#a89880] hover:text-[#e8e1d4] transition-colors"
              >
                Discord
              </motion.a>
              <motion.a
                href="about:blank"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-3.5 btn-gradient font-mono text-sm"
              >
                TBD
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
        >
          <div className="w-48 h-px bg-gradient-to-r from-transparent via-[#c4a96a]/20 to-transparent mx-auto mb-4" />
          <p className="font-mono text-xs text-[#4a4035]">&copy; 2026 doom.lat &mdash; Designed &amp; Developed with care</p>
        </motion.footer>
      </section>

      <MusicPlayer />
    </main>
  );
}

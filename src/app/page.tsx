'use client';

export const dynamic = 'force-dynamic';

import CursorFollower from '@/components/CursorFollower';
import Hero from '@/components/Hero';
import MusicPlayer from '@/components/MusicPlayer';
import AdminPortal from '@/components/AdminPortal';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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

// ─── Mobile nav ───────────────────────────────────────────────────────────────
function MobileNav() {
  const [open, setOpen] = useState(false);

  // Close on route tap
  const close = () => setOpen(false);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Hamburger button — visible only on mobile */}
      <button
        onClick={() => setOpen(v => !v)}
        className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
        aria-label="Toggle menu"
      >
        <span className={`block w-5 h-px bg-white/50 transition-all duration-300 ${open ? 'rotate-45 translate-y-[5px]' : ''}`} />
        <span className={`block w-5 h-px bg-white/50 transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-5 h-px bg-white/50 transition-all duration-300 ${open ? '-rotate-45 -translate-y-[5px]' : ''}`} />
      </button>

      {/* Fullscreen overlay menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/98 backdrop-blur-md flex flex-col items-center justify-center gap-8 md:hidden"
            onClick={close}
          >
            {[
              { href: '/', label: 'Home' },
              { href: '/#projects', label: 'Projects' },
              { href: '/#quotes', label: 'Philosophy' },
              { href: '/#contact', label: 'Contact' },
              { href: '/ocr', label: 'OCR Tool' },
              { href: '/chess', label: 'Chess' },
              { href: '/lab', label: 'Lab' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                className="font-mono text-2xl text-white/60 hover:text-white transition-colors tracking-[0.1em]"
              >
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showFullVideo, setShowFullVideo] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!showFullVideo) document.body.style.overflow = '';
    else document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
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
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      filter: 'blur(6px)',
    }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      filter: 'blur(6px)',
    }),
  };

  if (!mounted) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <main className="relative bg-black">
      <CursorFollower />

      {/* ── Top nav (home page) ───────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/6">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-white font-light tracking-wide">DOOM</Link>
          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#projects" className="font-mono text-sm text-white/30 hover:text-white/70 transition-colors">Projects</Link>
            <Link href="/#quotes" className="font-mono text-sm text-white/30 hover:text-white/70 transition-colors">Philosophy</Link>
            <Link href="/#contact" className="font-mono text-sm text-white/30 hover:text-white/70 transition-colors">Contact</Link>
            <Link href="/ocr" className="font-mono text-sm text-white/30 hover:text-white/70 transition-colors">OCR</Link>
            <Link href="/chess" className="font-mono text-sm text-white/30 hover:text-white/70 transition-colors">Chess</Link>
            <Link href="/lab" className="font-mono text-sm text-white/30 hover:text-white/70 transition-colors">Lab</Link>
          </div>
          <MobileNav />
        </div>
      </nav>

      <Hero />

      {/* YouTube Video Modal */}
      <AnimatePresence>
        {showFullVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowFullVideo(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/97 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-7xl aspect-video z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative glass-strong border border-white/10 w-full h-full overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src={`${currentVideoUrl.replace('youtu.be/', 'youtube.com/embed/')}?autoplay=1&quality=hd2160`}
                  title="Project Showcase"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Close button — positioned inside safe zone on mobile */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowFullVideo(false); }}
                className="absolute -top-10 right-0 w-9 h-9 glass border border-white/10 flex items-center justify-center z-50"
                aria-label="Close video"
              >
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <p className="font-mono text-[10px] text-white/25">Tap outside to close</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Projects ─────────────────────────────────────────── */}
      <section id="projects" className="flex flex-col items-center px-5 relative z-10 py-20 md:py-24">
        <div className="max-w-7xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mb-14 md:mb-20"
          >
            <h2 className="font-display text-4xl md:text-7xl text-gradient mb-3 font-light tracking-tight">Projects</h2>
            <p className="font-mono text-xs text-white/25 tracking-[0.25em] uppercase">Selected Works &amp; Open Source</p>
          </motion.div>

          <div className="space-y-20 md:space-y-32">
            {PROJECTS.map((project, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="w-full"
                >
                  {/* On mobile always stacks; on md alternates */}
                  <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    {/* Video side */}
                    <div className={`relative w-full ${!isEven ? 'md:order-2' : ''}`}>
                      <div className="relative glass-strong border border-white/8 overflow-hidden">
                        <div className="aspect-video bg-black">
                          <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
                            <source src={project.previewVideo} type="video/mp4" />
                          </video>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => openVideoModal(project.youtubeUrl)}
                          className="flex-1 px-4 py-3 btn-gradient font-mono text-xs sm:text-sm flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          Watch Full
                        </button>

                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-3 glass border border-white/10 font-mono text-xs sm:text-sm text-white/50 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          GitHub
                        </a>
                      </div>
                    </div>

                    {/* Text side */}
                    <div className={`space-y-5 md:space-y-7 w-full ${!isEven ? 'md:order-1' : ''}`}>
                      <span className="inline-block px-4 py-1 glass border border-white/8 font-mono text-xs tracking-[0.18em] text-white/35 uppercase">
                        {project.label}
                      </span>

                      <h3 className="font-display text-3xl sm:text-4xl md:text-5xl text-gradient-soft font-light tracking-tight leading-tight">
                        {project.name}
                      </h3>

                      <div className="space-y-2.5">
                        <p className="font-mono text-xs sm:text-sm text-white/45 leading-relaxed">{project.description}</p>
                        <p className="font-mono text-xs sm:text-sm text-white/45 leading-relaxed">{project.secondDescription}</p>
                      </div>

                      <div className="space-y-2">
                        {project.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-3">
                            <div className="w-4 h-px bg-white/20 shrink-0" />
                            <span className="font-mono text-xs sm:text-sm text-white/30">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Philosophy / Quotes ───────────────────────────────── */}
      <section id="quotes" className="flex items-center justify-center px-5 relative z-10 py-20 md:py-24">
        <div className="max-w-5xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="font-display text-4xl md:text-6xl text-gradient mb-3 font-light tracking-tight">Philosophy</h2>
            <p className="font-mono text-xs text-white/25 tracking-[0.25em] uppercase">Quotes on Innovation, Programming &amp; Design</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            viewport={{ once: true }}
          >
            <div className="glass-strong border border-white/7 p-7 sm:p-10 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-10 h-10 border-t border-l border-white/10" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b border-r border-white/8" />

              {/* Fixed-height container prevents layout shift on mobile */}
              <div className="relative min-h-[220px] sm:min-h-[260px] md:min-h-[280px] flex flex-col justify-center">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentQuoteIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ x: { type: 'spring', stiffness: 350, damping: 35 }, opacity: { duration: 0.25 } }}
                    className="text-center"
                  >
                    <div className="mb-5">
                      <span className="inline-block px-3 py-1 glass border border-white/8 font-mono text-[10px] tracking-[0.18em] text-white/30 uppercase">
                        {currentQuote.category}
                      </span>
                    </div>

                    <blockquote className="font-display text-lg sm:text-2xl md:text-3xl text-white/80 font-light leading-relaxed mb-6 px-2">
                      {currentQuote.text}
                    </blockquote>

                    <div className="font-mono text-xs sm:text-sm text-white/30">
                      &mdash; {currentQuote.author}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={previousQuote}
                  className="w-10 h-10 glass border border-white/8 hover:border-white/20 flex items-center justify-center transition-colors"
                  aria-label="Previous quote"
                >
                  <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Fewer dots on mobile — just show prev/next/current count */}
                <span className="font-mono text-xs text-white/20">{currentQuoteIndex + 1} / {QUOTES.length}</span>

                <button
                  onClick={nextQuote}
                  className="w-10 h-10 glass border border-white/8 hover:border-white/20 flex items-center justify-center transition-colors"
                  aria-label="Next quote"
                >
                  <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────── */}
      <section id="contact" className="flex flex-col items-center justify-center px-5 relative z-10 py-20 md:py-24 pb-28">
        <div className="max-w-4xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 glass border border-white/8 font-mono text-[10px] md:text-xs tracking-[0.22em] text-white/30 uppercase mb-6 md:mb-8">
              Get in touch
            </span>
            <h2 className="font-display text-4xl md:text-7xl text-gradient mb-5 md:mb-8 font-light tracking-tight">Let&apos;s Connect</h2>
            <p className="font-mono text-white/30 text-xs sm:text-sm mb-10 md:mb-12 max-w-sm mx-auto">Interested in working together? Feel free to reach out.</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://pastebin.com/G4yHeMKG"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-10 py-3.5 glass border border-white/10 font-mono text-sm text-white/50 text-center"
              >
                Discord
              </a>
              <a
                href="about:blank"
                className="w-full sm:w-auto px-10 py-3.5 btn-gradient font-mono text-sm text-center"
              >
                TBD
              </a>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto mb-4" />
          <p className="font-mono text-xs text-white/20">&copy; 2026 doom.lat &mdash; Designed &amp; Developed with care</p>
        </div>
      </section>

      <MusicPlayer />
      <AdminPortal />
    </main>
  );
}

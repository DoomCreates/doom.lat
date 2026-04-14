'use client';

export const dynamic = 'force-dynamic';

import CursorFollower from '@/components/CursorFollower';
import Hero from '@/components/Hero';
import MusicPlayer from '@/components/MusicPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const ease = [0.16, 1, 0.3, 1] as const;

const PROJECTS = [
  {
    id: 1,
    name: 'External Blade Ball AP',
    description: 'An advanced detection system for Blade Ball with precision timing algorithms and deep integration with game mechanics. The first of its kind.',
    secondDescription: 'A two-person project, little to no external involvement.',
    features: ['First/Best of its kind', 'Real-time debug info', 'Advanced Detection Evasion', 'Perfect User Experience'],
    previewVideo: '/videos/blade-ball-showcase.mp4',
    youtubeUrl: 'https://youtu.be/cmJxEHQ6Jjw',
    githubUrl: 'https://github.com/DoomCreates/Nebula.lua',
    label: 'Notable Project',
  },
  {
    id: 2,
    name: 'J.A.R.V.I.S',
    description: 'A locally-run AI assistant that listens to your voice, responds through your audio output, and controls your Windows PC on command.',
    secondDescription: 'Press a single key, speak naturally — JARVIS handles the rest. Built to be as close to the movie version as possible.',
    features: ['Voice activation via backtick', 'Natural language processing', 'Windows PC control', 'Movie-accurate voice and behavior'],
    previewVideo: '/videos/JarvisShowcasePreview.mp4',
    youtubeUrl: 'https://youtu.be/mFwV9RZCjDo',
    githubUrl: 'https://github.com/DoomCreates/JarvisAI',
    label: 'Open Source',
  },
  {
    id: 3,
    name: 'DoomTerminal',
    description: 'TBD',
    secondDescription: 'TBD',
    features: ['TBD', 'TBD', 'TBD', 'TBD'],
    previewVideo: '/videos/project3-preview.mp4',
    youtubeUrl: 'https://youtu.be/YOUR_VIDEO_ID_HERE',
    githubUrl: 'https://github.com/DoomCreates/doomterminal',
    label: 'Personal Project',
  },
];

const QUOTES = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'Innovation' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci', category: 'Philosophy' },
  { text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', author: 'Martin Fowler', category: 'Programming' },
  { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay', category: 'Innovation' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson', category: 'Programming' },
  { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs', category: 'Innovation' },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: 'Cory House', category: 'Programming' },
  { text: 'The function of good software is to make the complex appear to be simple.', author: 'Grady Booch', category: 'Philosophy' },
  { text: 'Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.', author: 'Antoine de Saint-Exupéry', category: 'Philosophy' },
  { text: 'Programs must be written for people to read, and only incidentally for machines to execute.', author: 'Harold Abelson', category: 'Programming' },
  { text: "The advance of technology is based on making it fit in so that you don't really even notice it.", author: 'Bill Gates', category: 'Innovation' },
  { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck', category: 'Programming' },
  { text: "The most damaging phrase in the language is: 'We've always done it this way.'", author: 'Grace Hopper', category: 'Innovation' },
  { text: 'Design is not just what it looks like and feels like. Design is how it works.', author: 'Steve Jobs', category: 'Philosophy' },
  { text: 'Truth can only be found in one place: the code.', author: 'Robert C. Martin', category: 'Programming' },
  { text: 'The computer was born to solve problems that did not exist before.', author: 'Bill Gates', category: 'Philosophy' },
  { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds', category: 'Programming' },
  { text: "It's not a bug — it's an undocumented feature.", author: 'Anonymous', category: 'Programming' },
  { text: 'The only source of knowledge is experience.', author: 'Albert Einstein', category: 'Philosophy' },
  { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs', category: 'Innovation' },
];

// ─── Mobile nav ───────────────────────────────────────────────────────────────
function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(v => !v)}
        className="md:hidden flex flex-col items-center justify-center gap-[5px] w-8 h-8"
        aria-label="Menu"
      >
        <span className={`block h-px bg-white/60 transition-all duration-300 ${open ? 'w-5 rotate-45 translate-y-[6px]' : 'w-5'}`} />
        <span className={`block h-px bg-white/60 transition-all duration-300 ${open ? 'w-0 opacity-0' : 'w-4'}`} />
        <span className={`block h-px bg-white/60 transition-all duration-300 ${open ? 'w-5 -rotate-45 -translate-y-[6px]' : 'w-5'}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center gap-10 md:hidden"
            onClick={close}
          >
            {[
              { href: '/',        label: 'Home'           },
              { href: '/#projects', label: 'Projects'     },
              { href: '/#quotes', label: 'Philosophy'     },
              { href: '/#contact', label: 'Contact'       },
              { href: '/ocr',     label: 'OCR Tool'       },
              { href: '/chess',   label: 'Chess'          },
              { href: '/neural',  label: 'Neural Network' },
              { href: '/lab',     label: 'Lab'            },
            ].map(({ href, label }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4, ease }}
              >
                <Link href={href} onClick={close}
                  className="font-display text-3xl text-white/70 hover:text-white transition-colors font-light tracking-tight">
                  {label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-black/80 backdrop-blur-xl">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 h-14 flex items-center justify-between">
        <Link href="/" className="font-display text-lg font-light tracking-tight text-white">
          DOOM
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {[
            { href: '/#projects', label: 'Projects'       },
            { href: '/#quotes',   label: 'Philosophy'     },
            { href: '/#contact',  label: 'Contact'        },
            { href: '/ocr',       label: 'OCR'            },
            { href: '/chess',     label: 'Chess'          },
            { href: '/neural',    label: 'Neural'         },
            { href: '/lab',       label: 'Lab'            },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className="font-mono text-xs text-white/30 hover:text-white/80 transition-colors duration-150 tracking-wide">
              {label}
            </Link>
          ))}
        </div>
        <MobileNav />
      </div>
    </nav>
  );
}

export default function Home() {
  const [mounted, setMounted]               = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [direction, setDirection]           = useState(0);
  const [videoUrl, setVideoUrl]             = useState('');
  const [showVideo, setShowVideo]           = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = showVideo ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showVideo]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowVideo(false); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const currentQuote = QUOTES[currentQuoteIndex];

  const nextQuote = () => {
    setDirection(1);
    setCurrentQuoteIndex(p => (p + 1) % QUOTES.length);
  };
  const prevQuote = () => {
    setDirection(-1);
    setCurrentQuoteIndex(p => (p - 1 + QUOTES.length) % QUOTES.length);
  };

  const openVideo = (url: string) => { setVideoUrl(url); setShowVideo(true); };

  const slideVariants = {
    enter:  (d: number) => ({ x: d > 0 ? 240 : -240, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d < 0 ? 240 : -240, opacity: 0 }),
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <main className="bg-black">
      <CursorFollower />
      <Nav />
      <Hero />

      {/* ── Video modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
            onClick={() => setShowVideo(false)}
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.25, ease }}
              className="relative w-full max-w-6xl aspect-video z-10"
              onClick={e => e.stopPropagation()}
            >
              <iframe
                className="w-full h-full border border-white/10"
                src={`${videoUrl.replace('youtu.be/', 'youtube.com/embed/')}?autoplay=1`}
                title="Project Showcase"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                onClick={() => setShowVideo(false)}
                className="absolute -top-9 right-0 font-mono text-xs text-white/30 hover:text-white transition-colors"
              >
                ESC to close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Projects ─────────────────────────────────────────── */}
      <section id="projects" className="relative">
        <div className="border-t border-b border-white/8 px-6 md:px-12 lg:px-20 py-5 flex items-center justify-between">
          <motion.h2
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }} viewport={{ once: true }}
            className="font-display text-xs font-light tracking-[0.3em] text-white/40 uppercase"
          >
            Selected Works
          </motion.h2>
          <span className="font-mono text-[10px] text-white/20">{PROJECTS.length} projects</span>
        </div>

        <div>
          {PROJECTS.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: i * 0.05 }}
              viewport={{ once: true }}
              className="border-b border-white/6"
            >
              <details className="group">
                <summary className="flex items-start gap-6 md:gap-10 px-6 md:px-12 lg:px-20 py-8 md:py-10 cursor-pointer list-none select-none hover:bg-white/[0.015] transition-colors duration-150">
                  <span className="font-mono text-xs text-index opacity-60 shrink-0 pt-1 w-6">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-3">
                      <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-gradient-soft leading-tight">
                        {project.name}
                      </h3>
                      <span className="font-mono text-[10px] text-white/25 tracking-[0.2em] uppercase shrink-0">
                        {project.label}
                      </span>
                    </div>
                    <p className="font-mono text-xs sm:text-sm text-white/35 leading-relaxed max-w-2xl">
                      {project.description}
                    </p>
                  </div>
                  <span className="font-mono text-white/20 text-lg shrink-0 pt-1 transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>

                <div className="px-6 md:px-12 lg:px-20 pb-10">
                  <div className="ml-0 sm:ml-16 flex flex-col lg:flex-row gap-8 lg:gap-16">
                    <div className="flex-1 min-w-0">
                      <div className="aspect-video border border-white/8 overflow-hidden mb-4 bg-black">
                        <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
                          <source src={project.previewVideo} type="video/mp4" />
                        </video>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => openVideo(project.youtubeUrl)}
                          className="flex-1 py-2.5 btn-gradient font-mono text-xs flex items-center justify-center gap-2"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          Watch Full
                        </button>
                        <a
                          href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 py-2.5 btn-ghost font-mono text-xs flex items-center justify-center gap-2"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          GitHub
                        </a>
                      </div>
                    </div>

                    <div className="lg:w-72 xl:w-80 shrink-0 space-y-6">
                      <p className="font-mono text-xs text-white/35 leading-relaxed">
                        {project.secondDescription}
                      </p>
                      <div className="space-y-2 border-t border-white/6 pt-5">
                        {project.features.map(f => (
                          <div key={f} className="flex items-center gap-3">
                            <div className="w-3 h-px bg-white/20 shrink-0" />
                            <span className="font-mono text-xs text-white/30">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Philosophy ────────────────────────────────────────── */}
      <section id="quotes" className="relative py-24 md:py-32">
        <div className="border-t border-white/8 px-6 md:px-12 lg:px-20 py-5 mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }} viewport={{ once: true }}
            className="font-display text-xs font-light tracking-[0.3em] text-white/40 uppercase"
          >
            Philosophy
          </motion.h2>
        </div>

        <div className="px-6 md:px-12 lg:px-20 max-w-4xl mx-auto">
          <div className="relative min-h-[180px] sm:min-h-[200px] flex items-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentQuoteIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease }}
                className="w-full"
              >
                <p className="font-mono text-[10px] text-white/25 tracking-[0.25em] uppercase mb-6">
                  {currentQuote.category}
                </p>
                <blockquote className="font-display text-2xl sm:text-3xl md:text-4xl text-white/80 font-light leading-tight tracking-tight mb-8">
                  &ldquo;{currentQuote.text}&rdquo;
                </blockquote>
                <p className="font-mono text-xs text-white/30">
                  — {currentQuote.author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-6 mt-12 border-t border-white/8 pt-6">
            <button onClick={prevQuote} aria-label="Previous"
              className="font-mono text-xs text-white/25 hover:text-white transition-colors">&larr;</button>
            <span className="font-mono text-[10px] text-white/20 tabular-nums">
              {String(currentQuoteIndex + 1).padStart(2,'0')} / {String(QUOTES.length).padStart(2,'0')}
            </span>
            <button onClick={nextQuote} aria-label="Next"
              className="font-mono text-xs text-white/25 hover:text-white transition-colors">&rarr;</button>
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────── */}
      <section id="contact" className="border-t border-white/8">
        <div className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }} viewport={{ once: true }}
          >
            <p className="font-mono text-[10px] text-white/25 tracking-[0.3em] uppercase mb-6">Get in touch</p>
            <h2 className="font-display text-4xl sm:text-5xl md:text-7xl text-white font-light tracking-tight leading-tight mb-12">
              Let&apos;s<br className="hidden sm:block" /> Connect
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 mb-24">
              <a href="https://discord.gg/true" target="_blank" rel="noopener noreferrer"
                className="px-8 py-3 btn-ghost font-mono text-sm text-center">
                Discord
              </a>
              <a href="https://kade.lol"
                className="px-8 py-3 btn-gradient font-mono text-sm text-center">
                Email
              </a>
            </div>

            <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="font-mono text-xs text-white/15">&copy; 2026 doom.lat</p>
              <div className="flex gap-6">
                <Link href="/ocr"    className="font-mono text-xs text-white/15 hover:text-white/40 transition-colors">OCR</Link>
                <Link href="/chess"  className="font-mono text-xs text-white/15 hover:text-white/40 transition-colors">Chess</Link>
                <Link href="/neural" className="font-mono text-xs text-white/15 hover:text-white/40 transition-colors">Neural</Link>
                <Link href="/lab"    className="font-mono text-xs text-white/15 hover:text-white/40 transition-colors">Lab</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <MusicPlayer />
    </main>
  );
}

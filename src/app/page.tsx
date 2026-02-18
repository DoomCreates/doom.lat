'use client';

export const dynamic = 'force-dynamic';

import CursorFollower from '@/components/CursorFollower';
import Hero from '@/components/Hero';
import MusicPlayer from '@/components/MusicPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

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
  { text: "It's not a bug – it's an undocumented feature.", author: "Anonymous", category: "Programming" },
  { text: "The only source of knowledge is experience.", author: "Albert Einstein", category: "Philosophy" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs", category: "Innovation" },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showFullVideo, setShowFullVideo] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = showFullVideo ? 'hidden' : 'unset';
  }, [showFullVideo]);

  const nextQuote = () => {
    setDirection(1);
    setCurrentQuoteIndex((i) => (i + 1) % QUOTES.length);
  };

  const previousQuote = () => {
    setDirection(-1);
    setCurrentQuoteIndex((i) => (i - 1 + QUOTES.length) % QUOTES.length);
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <main className="relative bg-black">
      <CursorFollower />
      <Hero />

      {/* FULLSCREEN YOUTUBE MODAL */}
      <AnimatePresence>
        {showFullVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFullVideo(false)}
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" />

            <motion.div
              className="relative w-full max-w-6xl z-10"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video">
                <iframe
                  className="w-full h-full rounded-2xl"
                  src="https://www.youtube.com/embed/LiY-GimrsqE?autoplay=1&rel=0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHOWCASE SECTION */}
      <section id="showcase" className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">
          {/* PREVIEW VIDEO */}
          <div className="relative">
            <div className="aspect-video overflow-hidden rounded-xl border border-white/10">
              <video
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/videos/blade-ball-showcase.mp4" type="video/mp4" />
              </video>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowFullVideo(true)}
                className="px-8 py-4 bg-white text-black rounded-full font-mono text-sm hover:scale-105 transition"
              >
                Watch Full Showcase
              </button>
            </div>
          </div>

          {/* TEXT */}
          <div className="space-y-6">
            <h2 className="text-5xl text-white font-light">External Blade Ball AP Showcase</h2>
            <p className="text-white/60 font-mono">
              An advanced detection system built for Blade Ball, showcasing a major technical breakthrough.
            </p>
          </div>
        </div>
      </section>

      <MusicPlayer />

      <footer className="text-center py-8 text-white/20 font-mono text-xs">
        © 2026 doom.lat — Designed & Developed with care
      </footer>

      <div className="noise-overlay" />
    </main>
  );
}

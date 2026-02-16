'use client';

import CursorFollower from '@/components/CursorFollower';
import Hero from '@/components/Hero';
import MusicPlayer from '@/components/MusicPlayer';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="relative bg-black">
      {/* Custom cursor */}
      <CursorFollower />

      {/* Hero section */}
      <Hero />

      {/* Additional sections */}
      <section id="work" className="min-h-screen flex items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-4xl"
        >
          <h2 className="font-display text-5xl md:text-7xl text-white mb-8 font-light tracking-tight">
            Selected Work
          </h2>
          <p className="font-mono text-white/35 text-sm md:text-base">
            Coming soon. This space will showcase my latest projects and creative endeavors.
          </p>
        </motion.div>
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
              href="mailto:hello@doom.lat"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 255, 255, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 glass rounded-full font-mono text-sm text-white/70 hover:text-white transition-colors"
            >
              hello@doom.lat
            </motion.a>
            
            <motion.a
              href="https://github.com/doom"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 255, 255, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-full font-mono text-sm text-black bg-white hover:bg-white/90 transition-colors"
            >
              GitHub
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

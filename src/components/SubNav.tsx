'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

interface SubNavProps {
  active: string;
}

export default function SubNav({ active }: SubNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const links = [
    { href: '/',        label: 'Home'    },
    { href: '/ocr',     label: 'OCR'     },
    { href: '/chess',   label: 'Chess'   },
    { href: '/neural',  label: 'Neural'  },
    { href: '/lab',     label: 'Lab'     },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-black/80 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-light tracking-tight text-white">
            DOOM
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {links.map(({ href, label }) => (
              <Link key={href} href={href}
                className={`font-mono text-xs tracking-wide transition-colors duration-150 ${
                  label === active
                    ? 'text-white border-b border-white/50 pb-px'
                    : 'text-white/30 hover:text-white/80'
                }`}>
                {label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden flex flex-col items-center justify-center gap-[5px] w-8 h-8"
            aria-label="Menu"
          >
            <span className={`block h-px bg-white/60 transition-all duration-300 ${menuOpen ? 'w-5 rotate-45 translate-y-[6px]' : 'w-5'}`} />
            <span className={`block h-px bg-white/60 transition-all duration-300 ${menuOpen ? 'w-0 opacity-0' : 'w-4'}`} />
            <span className={`block h-px bg-white/60 transition-all duration-300 ${menuOpen ? 'w-5 -rotate-45 -translate-y-[6px]' : 'w-5'}`} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center gap-10 md:hidden"
            onClick={() => setMenuOpen(false)}
          >
            {links.map(({ href, label }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4, ease }}
              >
                <Link href={href} onClick={() => setMenuOpen(false)}
                  className={`font-display text-3xl font-light tracking-tight transition-colors ${
                    label === active ? 'text-white' : 'text-white/50 hover:text-white'
                  }`}>
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

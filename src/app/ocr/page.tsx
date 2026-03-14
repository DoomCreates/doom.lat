'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';

interface OCRResult {
  id: string;
  file: File;
  preview: string;
  text: string;
  status: 'processing' | 'done' | 'error';
  progress: number;
  error?: string;
}

// ─── Shared mobile nav ────────────────────────────────────────────────────────
function MobileMenuOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 bg-black/98 backdrop-blur-md flex flex-col items-center justify-center gap-8 md:hidden"
      onClick={onClose}
    >
      {[
        { href: '/', label: 'Home' },
        { href: '/#projects', label: 'Projects' },
        { href: '/ocr', label: 'OCR Tool' },
        { href: '/chess', label: 'Chess' },
        { href: '/lab', label: 'Lab' },
      ].map(({ href, label }) => (
        <Link key={href} href={href} onClick={onClose} className="font-mono text-2xl text-white/60 hover:text-white transition-colors tracking-[0.1em]">
          {label}
        </Link>
      ))}
    </motion.div>
  );
}

export default function OCRPage() {
  const [results, setResults] = useState<OCRResult[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const processFile = useCallback(async (file: File) => {
    const id = Math.random().toString(36).slice(2);
    const preview = URL.createObjectURL(file);

    setResults(prev => [...prev, { id, file, preview, text: '', status: 'processing', progress: 0 }]);

    try {
      const Tesseract = (await import('tesseract.js')).default;
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setResults(prev => prev.map(r =>
              r.id === id ? { ...r, progress: Math.round(m.progress * 100) } : r
            ));
          }
        },
      });
      setResults(prev => prev.map(r =>
        r.id === id ? { ...r, text: result.data.text, status: 'done', progress: 100 } : r
      ));
    } catch {
      setResults(prev => prev.map(r =>
        r.id === id ? { ...r, status: 'error', error: 'OCR failed. Try a clearer image.', progress: 0 } : r
      ));
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(processFile);
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'] },
    multiple: true,
  });

  const copyText = (text: string) => navigator.clipboard.writeText(text);

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\.[^.]+$/, '') + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeResult = (id: string) => {
    setResults(prev => {
      const r = prev.find(x => x.id === id);
      if (r) URL.revokeObjectURL(r.preview);
      return prev.filter(x => x.id !== id);
    });
  };

  return (
    <main className="relative bg-black min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/6">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-white font-light tracking-wide">DOOM</Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="font-mono text-sm text-white/30 hover:text-white/70 transition-colors">Home</Link>
            <Link href="/#projects" className="font-mono text-sm text-white/30 hover:text-white/70 transition-colors">Projects</Link>
            <Link href="/ocr" className="font-mono text-sm text-white border-b border-white/50 pb-px">OCR Tool</Link>
            <Link href="/chess" className="font-mono text-sm text-white/30 hover:text-white/70 transition-colors">Chess</Link>
            <Link href="/lab" className="font-mono text-sm text-white/30 hover:text-white/70 transition-colors">Lab</Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-px bg-white/50 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
            <span className={`block w-5 h-px bg-white/50 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-white/50 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && <MobileMenuOverlay onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>

      <div className="pt-24 px-5 pb-20">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="inline-block px-4 py-1.5 glass border border-white/8 font-mono text-[10px] md:text-xs tracking-[0.2em] text-white/30 uppercase mb-4">
              Client-side / No uploads / Tesseract.js
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl text-gradient mb-3 font-light tracking-tight">OCR Tool</h1>
            <p className="font-mono text-xs md:text-sm text-white/30">
              Drop images to extract text. Everything runs in your browser.
            </p>
          </motion.div>

          {/* Dropzone */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div
              {...getRootProps()}
              className={`relative glass-strong border transition-all cursor-pointer p-8 sm:p-12 text-center
                ${isDragActive ? 'border-white/30 bg-white/5' : 'border-white/8 hover:border-white/18'}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 glass border border-white/8 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-mono text-xs sm:text-sm text-white/45 mb-1">
                    {isDragActive ? 'Drop your images here' : 'Tap to browse or drag & drop'}
                  </p>
                  <p className="font-mono text-[10px] sm:text-xs text-white/20">
                    PNG / JPG / WEBP / BMP / TIFF
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-4">
                {results.map((result) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="glass-strong border border-white/7 overflow-hidden"
                  >
                    {/* Card header */}
                    <div className="px-4 py-3 border-b border-white/5">
                      {/* Row 1: thumbnail + filename + remove */}
                      <div className="flex items-center gap-3 mb-2">
                        <img src={result.preview} alt={result.file.name} className="w-9 h-9 object-cover border border-white/8 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs text-white/70 truncate">{result.file.name}</p>
                          <p className="font-mono text-[10px] text-white/20">{(result.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          onClick={() => removeResult(result.id)}
                          className="w-7 h-7 glass border border-white/6 flex items-center justify-center text-white/25 shrink-0 font-mono text-sm"
                        >
                          &times;
                        </button>
                      </div>
                      {/* Row 2: action buttons (only when done) */}
                      {result.status === 'done' && result.text && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyText(result.text)}
                            className="flex-1 py-1.5 glass border border-white/8 font-mono text-xs text-white/40"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => downloadText(result.text, result.file.name)}
                            className="flex-1 py-1.5 glass border border-white/8 font-mono text-xs text-white/40"
                          >
                            Save TXT
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Progress */}
                    {result.status === 'processing' && (
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs text-white/30">Processing...</span>
                          <span className="font-mono text-xs text-white/20">{result.progress}%</span>
                        </div>
                        <div className="h-px bg-white/8 overflow-hidden">
                          <motion.div
                            className="h-full bg-white/60"
                            animate={{ width: `${result.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}

                    {result.status === 'error' && (
                      <div className="px-4 py-3">
                        <p className="font-mono text-xs text-red-400/70">{result.error}</p>
                      </div>
                    )}

                    {result.status === 'done' && (
                      <div className="px-4 py-3">
                        {result.text.trim() ? (
                          <pre className="font-mono text-xs text-white/55 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                            {result.text}
                          </pre>
                        ) : (
                          <p className="font-mono text-xs text-white/20 italic">No text detected in this image.</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </main>
  );
}

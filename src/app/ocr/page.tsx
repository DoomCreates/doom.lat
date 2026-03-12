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

export default function OCRPage() {
  const [results, setResults] = useState<OCRResult[]>([]);

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
    <main className="relative bg-[#0c0b09] min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-[#c4a96a]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-[#e8e1d4] font-light tracking-wide">DOOM</Link>
          <div className="flex items-center gap-8">
            <Link href="/" className="font-mono text-sm text-[#6a5e4e] hover:text-[#a89880] transition-colors">Home</Link>
            <Link href="/#projects" className="font-mono text-sm text-[#6a5e4e] hover:text-[#a89880] transition-colors">Projects</Link>
            <Link href="/ocr" className="font-mono text-sm text-[#e8e1d4] border-b border-[#c4a96a]/60 pb-px">OCR Tool</Link>
            <Link href="/chess" className="font-mono text-sm text-[#6a5e4e] hover:text-[#a89880] transition-colors">Chess</Link>
            <Link href="/lab" className="font-mono text-sm text-[#6a5e4e] hover:text-[#a89880] transition-colors">Lab</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-12"
          >
            <span className="inline-block px-5 py-1.5 glass border border-[#c4a96a]/15 font-mono text-xs tracking-[0.22em] text-[#9a8060] uppercase mb-5">
              Client-side &nbsp;/&nbsp; No uploads &nbsp;/&nbsp; Tesseract.js
            </span>
            <h1 className="font-display text-5xl md:text-7xl text-gradient mb-4 font-light tracking-tight">OCR Tool</h1>
            <p className="font-mono text-sm text-[#6a5e4e]">
              Drop images to extract text. Everything runs in your browser.
            </p>
          </motion.div>

          {/* Dropzone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div
              {...getRootProps()}
              className={`relative glass-strong border transition-all cursor-pointer p-12 text-center
                ${isDragActive
                  ? 'border-[#c4a96a]/50 bg-[#c4a96a]/5'
                  : 'border-[#c4a96a]/12 hover:border-[#c4a96a]/28 hover:bg-[#c4a96a]/3'
                }`}
            >
              <input {...getInputProps()} />

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#c4a96a]/20 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#c4a96a]/15 pointer-events-none" />

              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 glass border border-[#c4a96a]/15 flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#9a8060]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-mono text-sm text-[#a89880] mb-1">
                    {isDragActive ? 'Drop your images here' : 'Drag & drop images, or click to browse'}
                  </p>
                  <p className="font-mono text-xs text-[#4a4035]">
                    PNG / JPG / WEBP / BMP / TIFF &mdash; Multiple files supported
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 space-y-5"
              >
                {results.map((result) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="glass-strong border border-[#c4a96a]/12 overflow-hidden"
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#c4a96a]/8">
                      <div className="flex items-center gap-3">
                        <img
                          src={result.preview}
                          alt={result.file.name}
                          className="w-10 h-10 object-cover border border-[#c4a96a]/15"
                        />
                        <div>
                          <p className="font-mono text-sm text-[#e8e1d4] truncate max-w-[200px] md:max-w-sm">
                            {result.file.name}
                          </p>
                          <p className="font-mono text-[10px] text-[#4a4035] mt-0.5">
                            {(result.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.status === 'done' && result.text && (
                          <>
                            <button
                              onClick={() => copyText(result.text)}
                              className="px-3 py-1.5 glass border border-[#c4a96a]/15 hover:border-[#c4a96a]/35 font-mono text-xs text-[#a89880] hover:text-[#e8e1d4] transition-all"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => downloadText(result.text, result.file.name)}
                              className="px-3 py-1.5 glass border border-[#c4a96a]/15 hover:border-[#c4a96a]/35 font-mono text-xs text-[#a89880] hover:text-[#e8e1d4] transition-all"
                            >
                              Save TXT
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => removeResult(result.id)}
                          className="w-7 h-7 glass border border-[#c4a96a]/10 hover:border-[#c4a96a]/30 flex items-center justify-center text-[#6a5e4e] hover:text-[#e8e1d4] transition-all font-mono text-sm"
                        >
                          &times;
                        </button>
                      </div>
                    </div>

                    {/* Progress */}
                    {result.status === 'processing' && (
                      <div className="px-5 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs text-[#6a5e4e]">Processing...</span>
                          <span className="font-mono text-xs text-[#4a4035]">{result.progress}%</span>
                        </div>
                        <div className="h-px bg-[#c4a96a]/10 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#c4a96a] to-[#9a7a45]"
                            animate={{ width: `${result.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}

                    {result.status === 'error' && (
                      <div className="px-5 py-4">
                        <p className="font-mono text-xs text-red-400/80">{result.error}</p>
                      </div>
                    )}

                    {result.status === 'done' && (
                      <div className="px-5 py-4">
                        {result.text.trim() ? (
                          <pre className="font-mono text-xs text-[#a89880] whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto custom-scrollbar">
                            {result.text}
                          </pre>
                        ) : (
                          <p className="font-mono text-xs text-[#4a4035] italic">No text detected in this image.</p>
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

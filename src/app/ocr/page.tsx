'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import SubNav from '@/components/SubNav';

const ease = [0.16, 1, 0.3, 1] as const;

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

  const onDrop = useCallback((files: File[]) => files.forEach(processFile), [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'] },
    multiple: true,
  });

  const copy = (text: string) => navigator.clipboard.writeText(text);

  const download = (text: string, name: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = name.replace(/\.[^.]+$/, '') + '.txt';
    a.click();
  };

  const remove = (id: string) => {
    setResults(prev => {
      const r = prev.find(x => x.id === id);
      if (r) URL.revokeObjectURL(r.preview);
      return prev.filter(x => x.id !== id);
    });
  };

  return (
    <main className="bg-black min-h-screen">
      <SubNav active="OCR" />

      <div className="pt-14">
        {/* Page header */}
        <div className="border-b border-white/8 px-6 md:px-12 lg:px-20 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
          >
            <p className="font-mono text-[10px] text-white/25 tracking-[0.3em] uppercase mb-4">
              Client-side &nbsp;·&nbsp; No uploads &nbsp;·&nbsp; Tesseract.js
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-light tracking-tight text-white leading-tight">
              OCR Tool
            </h1>
          </motion.div>
        </div>

        {/* Content */}
        <div className="px-6 md:px-12 lg:px-20 py-12 max-w-4xl">

          {/* Drop zone */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.1 }}
          >
            <div
              {...getRootProps()}
              className={`border transition-all duration-150 cursor-pointer p-10 sm:p-14 text-center mb-8 ${
                isDragActive ? 'border-white/30 bg-white/[0.03]' : 'border-white/8 hover:border-white/20'
              }`}
            >
              <input {...getInputProps()} />
              <svg className="w-8 h-8 text-white/15 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-mono text-sm text-white/35 mb-1">
                {isDragActive ? 'Drop images here' : 'Drag & drop images, or tap to browse'}
              </p>
              <p className="font-mono text-xs text-white/18">PNG / JPG / WEBP / BMP / TIFF</p>
            </div>
          </motion.div>

          {/* Results */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-px border border-white/8">
                {results.map(result => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    {/* Card header */}
                    <div className="px-5 py-4 border-b border-white/5">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={result.preview} alt={result.file.name}
                          className="w-8 h-8 object-cover border border-white/8 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs text-white/60 truncate">{result.file.name}</p>
                          <p className="font-mono text-[10px] text-white/20">
                            {(result.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button onClick={() => remove(result.id)}
                          className="font-mono text-xs text-white/20 hover:text-white/60 transition-colors shrink-0">
                          &times;
                        </button>
                      </div>

                      {result.status === 'done' && result.text && (
                        <div className="flex gap-2">
                          <button onClick={() => copy(result.text)}
                            className="flex-1 py-1.5 border border-white/8 font-mono text-xs text-white/35 hover:text-white hover:border-white/20 transition-all">
                            Copy
                          </button>
                          <button onClick={() => download(result.text, result.file.name)}
                            className="flex-1 py-1.5 border border-white/8 font-mono text-xs text-white/35 hover:text-white hover:border-white/20 transition-all">
                            Save TXT
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Progress */}
                    {result.status === 'processing' && (
                      <div className="px-5 py-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-mono text-xs text-white/25">Processing…</span>
                          <span className="font-mono text-xs text-white/18">{result.progress}%</span>
                        </div>
                        <div className="h-px bg-white/6 overflow-hidden">
                          <motion.div
                            className="h-full bg-white/50"
                            animate={{ width: `${result.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}

                    {result.status === 'error' && (
                      <div className="px-5 py-4">
                        <p className="font-mono text-xs text-red-400/60">{result.error}</p>
                      </div>
                    )}

                    {result.status === 'done' && (
                      <div className="px-5 py-4">
                        {result.text.trim()
                          ? <pre className="font-mono text-xs text-white/50 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">{result.text}</pre>
                          : <p className="font-mono text-xs text-white/18 italic">No text detected.</p>}
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

'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Tesseract from 'tesseract.js';
import { saveAs } from 'file-saver';
import Link from 'next/link';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  text: string;
  progress: number;
  errorMessage?: string;
}

export default function OCRPage() {
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
      text: '',
      progress: 0,
    }));
    
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff'],
    },
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    files.forEach((file) => URL.revokeObjectURL(file.preview));
    setFiles([]);
  };

  const processImages = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: 'processing', progress: 0 } : f
        )
      );

      try {
        const result = await Tesseract.recognize(file.file, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === file.id
                    ? { ...f, progress: Math.round(m.progress * 100) }
                    : f
                )
              );
            }
          },
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: 'completed', text: result.data.text, progress: 100 }
              : f
          )
        );
      } catch (error) {
        console.error('OCR Error:', error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { 
                  ...f, 
                  status: 'error', 
                  text: '', 
                  progress: 0,
                  errorMessage: 'Failed to extract text'
                }
              : f
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${filename}.txt`);
  };

  const downloadAllAsZip = async () => {
    files.forEach((file, index) => {
      if (file.status === 'completed' && file.text) {
        downloadText(file.text, `image-${index + 1}`);
      }
    });
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#0a0118]" />;
  }

  const completedFiles = files.filter((f) => f.status === 'completed');
  const hasResults = completedFiles.length > 0;

  return (
    <main className="relative bg-[#0a0118] min-h-screen">
      {/* Header Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-display text-xl text-white font-light">
              DOOM
            </Link>
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="font-mono text-sm text-purple-300/70 hover:text-purple-200 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/#projects"
                className="font-mono text-sm text-purple-300/70 hover:text-purple-200 transition-colors"
              >
                Projects
              </Link>
              <Link
                href="/ocr"
                className="font-mono text-sm text-purple-300 border-b border-purple-500"
              >
                OCR Tool
              </Link>
              <Link
                href="/chess"
                className="font-mono text-sm text-purple-300/70 hover:text-purple-200 transition-colors"
              >
                Chess
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <span className="inline-block px-4 py-1.5 glass rounded-full font-mono text-xs tracking-[0.2em] text-purple-300/70 uppercase border border-purple-500/20">
                Powered by Tesseract OCR
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl text-gradient mb-6 font-light tracking-tight">
              Image to Text
            </h1>
            <p className="font-mono text-sm text-purple-300/60 max-w-2xl mx-auto mb-6">
              Extract text from images using AI-powered OCR. Upload multiple images and
              get accurate text extraction in seconds.
            </p>
            <div className="flex items-center justify-center gap-6 font-mono text-xs text-purple-400/50">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Privacy First</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span>Multi-Language</span>
              </div>
            </div>
          </motion.div>

          {/* Upload Zone */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <div
              {...getRootProps()}
              className={`relative glass-strong rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
                isDragActive ? 'border-purple-500/60 bg-purple-500/10' : 'border-purple-500/30'
              }`}
            >
              <div className="p-16 text-center">
                <input {...getInputProps()} />
                
                <motion.div
                  animate={{
                    scale: isDragActive ? 1.1 : 1,
                  }}
                  className="mb-6"
                >
                  <svg
                    className="w-20 h-20 mx-auto text-purple-400/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </motion.div>

                <h3 className="font-display text-2xl text-white mb-3 font-light">
                  {isDragActive ? 'Drop images here' : 'Drag & Drop Images'}
                </h3>
                <p className="font-mono text-sm text-purple-300/50 mb-4">
                  or click to browse
                </p>
                <div className="flex items-center justify-center gap-4 font-mono text-xs text-purple-400/40">
                  <span>PNG</span>
                  <span>•</span>
                  <span>JPG</span>
                  <span>•</span>
                  <span>WEBP</span>
                  <span>•</span>
                  <span>GIF</span>
                  <span>•</span>
                  <span>TIFF</span>
                </div>
              </div>

              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-purple-500/20 rounded-tl-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-pink-500/20 rounded-br-2xl pointer-events-none" />
            </div>
          </motion.div>

          {/* Uploaded Files Preview */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-mono text-sm text-purple-300/70">
                  Uploaded Files ({files.length})
                </h3>
                <button
                  onClick={clearAll}
                  className="font-mono text-xs text-purple-400/60 hover:text-purple-300 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <AnimatePresence>
                  {files.map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group"
                    >
                      <div className="relative glass-strong rounded-xl overflow-hidden border border-purple-500/20 aspect-square">
                        <img
                          src={file.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        
                        <div className="absolute top-2 left-2">
                          <div className="glass-strong rounded-full px-2 py-1 font-mono text-xs text-purple-200 border border-purple-500/30">
                            {index + 1}
                          </div>
                        </div>

                        {file.status === 'processing' && (
                          <div className="absolute inset-0 bg-[#0a0118]/90 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-2" />
                            <span className="font-mono text-xs text-purple-300">
                              {file.progress}%
                            </span>
                          </div>
                        )}

                        {file.status === 'completed' && (
                          <div className="absolute inset-0 bg-[#0a0118]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg
                              className="w-8 h-8 text-purple-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}

                        {file.status === 'error' && (
                          <div className="absolute inset-0 bg-red-900/30 flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-red-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}

                        {file.status === 'pending' && (
                          <button
                            onClick={() => removeFile(file.id)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#0a0118]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-purple-500/30"
                          >
                            <svg
                              className="w-4 h-4 text-purple-300"
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
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {files.some((f) => f.status === 'pending') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 text-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={processImages}
                    disabled={isProcessing}
                    className="px-10 py-4 rounded-full font-mono text-sm text-white btn-gradient transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing with AI...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                        <span>Extract Text from {files.filter(f => f.status === 'pending').length} Images</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Results Section */}
          {hasResults && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-3xl text-gradient font-light">
                  Extracted Text
                </h2>
                <button
                  onClick={downloadAllAsZip}
                  className="font-mono text-xs text-purple-400/60 hover:text-purple-300 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download All
                </button>
              </div>

              {completedFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-strong rounded-2xl p-6 border border-purple-500/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-purple-500/30">
                        <img
                          src={file.preview}
                          alt={`Result ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-mono text-sm text-purple-200">
                          Image {files.findIndex((f) => f.id === file.id) + 1}
                        </h3>
                        <p className="font-mono text-xs text-purple-400/50">
                          {file.text.length} characters
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(file.text)}
                        className="px-4 py-2 glass rounded-full font-mono text-xs text-purple-300 hover:text-white transition-colors flex items-center gap-2 border border-purple-500/30 hover:border-purple-500/60"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copy
                      </button>
                      <button
                        onClick={() =>
                          downloadText(file.text, `image-${files.findIndex((f) => f.id === file.id) + 1}`)
                        }
                        className="px-4 py-2 glass rounded-full font-mono text-xs text-purple-300 hover:text-white transition-colors flex items-center gap-2 border border-purple-500/30 hover:border-purple-500/60"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="glass rounded-xl p-4 font-mono text-sm text-purple-200/80 whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar">
                    {file.text || 'No text detected in this image.'}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {files.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="glass-strong rounded-2xl p-12 max-w-md mx-auto border border-purple-500/20">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-purple-400/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="font-display text-xl text-white mb-2 font-light">
                  No images uploaded yet
                </h3>
                <p className="font-mono text-sm text-purple-300/50">
                  Upload images above to get started
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </main>
  );
}

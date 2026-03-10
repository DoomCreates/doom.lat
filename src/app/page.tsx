'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import yaml from 'js-yaml';
import JSZip from 'jszip';

// Set PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

type ConversionType = 
  | 'image-to-image' 
  | 'pdf-to-images' 
  | 'images-to-pdf'
  | 'json-to-csv'
  | 'csv-to-json'
  | 'json-to-yaml'
  | 'yaml-to-json';

interface ConversionFile {
  id: string;
  file: File;
  preview?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: Blob;
  resultName?: string;
  errorMessage?: string;
}

const CONVERSION_OPTIONS = [
  { id: 'image-to-image', name: 'Image Format Converter', desc: 'Convert between PNG, JPG, WEBP' },
  { id: 'pdf-to-images', name: 'PDF to Images', desc: 'Extract pages from PDF as images' },
  { id: 'images-to-pdf', name: 'Images to PDF', desc: 'Combine multiple images into PDF' },
  { id: 'json-to-csv', name: 'JSON to CSV', desc: 'Convert JSON data to CSV format' },
  { id: 'csv-to-json', name: 'CSV to JSON', desc: 'Convert CSV data to JSON format' },
  { id: 'json-to-yaml', name: 'JSON to YAML', desc: 'Convert JSON to YAML format' },
  { id: 'yaml-to-json', name: 'YAML to JSON', desc: 'Convert YAML to JSON format' },
];

export default function ConvertPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedConversion, setSelectedConversion] = useState<ConversionType>('image-to-image');
  const [files, setFiles] = useState<ConversionFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFormat, setOutputFormat] = useState('png');
  const [imageQuality, setImageQuality] = useState(0.9);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getAcceptedFileTypes = () => {
    switch (selectedConversion) {
      case 'image-to-image':
        return { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] };
      case 'pdf-to-images':
        return { 'application/pdf': ['.pdf'] };
      case 'images-to-pdf':
        return { 'image/*': ['.png', '.jpg', '.jpeg'] };
      case 'json-to-csv':
      case 'json-to-yaml':
        return { 'application/json': ['.json'] };
      case 'csv-to-json':
        return { 'text/csv': ['.csv'] };
      case 'yaml-to-json':
        return { 'text/yaml': ['.yaml', '.yml'] };
      default:
        return {};
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'pending' as const,
    }));
    
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedFileTypes(),
    multiple: selectedConversion !== 'pdf-to-images',
  });

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const clearAll = () => {
    files.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    setFiles([]);
  };

  // Image conversion
  const convertImage = async (file: File, format: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to convert image'));
          },
          `image/${format}`,
          imageQuality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  // PDF to Images
  const convertPdfToImages = async (file: File): Promise<Blob[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images: Blob[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) continue;
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({ canvasContext: context, viewport }).promise;
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        }, 'image/png');
      });
      
      images.push(blob);
    }
    
    return images;
  };

  // Images to PDF
  const convertImagesToPdf = async (imageFiles: ConversionFile[]): Promise<Blob> => {
    const pdf = new jsPDF();
    let isFirst = true;

    for (const fileData of imageFiles) {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(fileData.file);
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      
      if (!isFirst) {
        pdf.addPage();
      }
      isFirst = false;

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgRatio = img.width / img.height;
      const pdfRatio = pdfWidth / pdfHeight;

      let finalWidth, finalHeight;
      if (imgRatio > pdfRatio) {
        finalWidth = pdfWidth;
        finalHeight = pdfWidth / imgRatio;
      } else {
        finalHeight = pdfHeight;
        finalWidth = pdfHeight * imgRatio;
      }

      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
    }

    return pdf.output('blob');
  };

  // JSON to CSV
  const convertJsonToCsv = async (file: File): Promise<Blob> => {
    const text = await file.text();
    const json = JSON.parse(text);
    const csv = Papa.unparse(Array.isArray(json) ? json : [json]);
    return new Blob([csv], { type: 'text/csv' });
  };

  // CSV to JSON
  const convertCsvToJson = async (file: File): Promise<Blob> => {
    const text = await file.text();
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        complete: (results) => {
          const json = JSON.stringify(results.data, null, 2);
          resolve(new Blob([json], { type: 'application/json' }));
        },
        error: reject,
      });
    });
  };

  // JSON to YAML
  const convertJsonToYaml = async (file: File): Promise<Blob> => {
    const text = await file.text();
    const json = JSON.parse(text);
    const yamlText = yaml.dump(json);
    return new Blob([yamlText], { type: 'text/yaml' });
  };

  // YAML to JSON
  const convertYamlToJson = async (file: File): Promise<Blob> => {
    const text = await file.text();
    const obj = yaml.load(text);
    const json = JSON.stringify(obj, null, 2);
    return new Blob([json], { type: 'application/json' });
  };

  const processConversions = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);

    try {
      if (selectedConversion === 'images-to-pdf') {
        // Special case: combine all images into one PDF
        const pendingFiles = files.filter(f => f.status === 'pending');
        const result = await convertImagesToPdf(pendingFiles);
        
        setFiles((prev) =>
          prev.map((f) => ({
            ...f,
            status: 'completed',
            result,
            resultName: 'combined.pdf',
          }))
        );
      } else if (selectedConversion === 'pdf-to-images') {
        // Special case: one PDF becomes multiple images
        const file = files[0];
        const images = await convertPdfToImages(file.file);
        
        setFiles([{
          ...file,
          status: 'completed',
          result: images[0], // Store first image, we'll handle download differently
          resultName: 'page-1.png',
        }]);
        
        // Auto-download all images as ZIP
        const zip = new JSZip();
        images.forEach((img, i) => {
          zip.file(`page-${i + 1}.png`, img);
        });
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, 'pdf-pages.zip');
        
      } else {
        // Process each file individually
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, status: 'processing' } : f
            )
          );

          try {
            let result: Blob;
            let resultName: string;

            switch (selectedConversion) {
              case 'image-to-image':
                result = await convertImage(file.file, outputFormat);
                resultName = file.file.name.replace(/\.[^.]+$/, `.${outputFormat}`);
                break;
              case 'json-to-csv':
                result = await convertJsonToCsv(file.file);
                resultName = file.file.name.replace(/\.json$/, '.csv');
                break;
              case 'csv-to-json':
                result = await convertCsvToJson(file.file);
                resultName = file.file.name.replace(/\.csv$/, '.json');
                break;
              case 'json-to-yaml':
                result = await convertJsonToYaml(file.file);
                resultName = file.file.name.replace(/\.json$/, '.yaml');
                break;
              case 'yaml-to-json':
                result = await convertYamlToJson(file.file);
                resultName = file.file.name.replace(/\.(yaml|yml)$/, '.json');
                break;
              default:
                throw new Error('Unsupported conversion type');
            }

            setFiles((prev) =>
              prev.map((f) =>
                f.id === file.id
                  ? { ...f, status: 'completed', result, resultName }
                  : f
              )
            );
          } catch (error) {
            console.error('Conversion error:', error);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === file.id
                  ? { ...f, status: 'error', errorMessage: 'Conversion failed' }
                  : f
              )
            );
          }
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (file: ConversionFile) => {
    if (file.result && file.resultName) {
      saveAs(file.result, file.resultName);
    }
  };

  const downloadAll = async () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.result);
    
    if (completedFiles.length === 1) {
      downloadFile(completedFiles[0]);
      return;
    }

    const zip = new JSZip();
    completedFiles.forEach((file) => {
      if (file.result && file.resultName) {
        zip.file(file.resultName, file.result);
      }
    });
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'converted-files.zip');
  };

  if (!mounted) {
    return <div className="min-h-screen bg-black" />;
  }

  const completedFiles = files.filter((f) => f.status === 'completed');
  const hasResults = completedFiles.length > 0;

  return (
    <main className="relative bg-black min-h-screen">
      {/* Header Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-display text-xl text-white font-light">
              DOOM
            </Link>
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="font-mono text-sm text-white/50 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/#projects"
                className="font-mono text-sm text-white/50 hover:text-white transition-colors"
              >
                Projects
              </Link>
              <Link
                href="/ocr"
                className="font-mono text-sm text-white/50 hover:text-white transition-colors"
              >
                OCR Tool
              </Link>
              <Link
                href="/convert"
                className="font-mono text-sm text-white border-b border-white/50"
              >
                File Converter
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
            <h1 className="font-display text-5xl md:text-7xl text-white mb-6 font-light tracking-tight">
              File Converter
            </h1>
            <p className="font-mono text-sm text-white/40 max-w-2xl mx-auto">
              Convert between different file formats instantly. All processing happens in your browser - your files never leave your device.
            </p>
          </motion.div>

          {/* Conversion Type Selector */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-12"
          >
            <h3 className="font-mono text-sm text-white/60 mb-4">Select Conversion Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CONVERSION_OPTIONS.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedConversion(option.id as ConversionType);
                    clearAll();
                  }}
                  className={`glass-strong rounded-xl p-6 text-left transition-all ${
                    selectedConversion === option.id
                      ? 'border-2 border-white/40'
                      : 'border border-white/10'
                  }`}
                >
                  <h4 className="font-mono text-sm text-white mb-2">{option.name}</h4>
                  <p className="font-mono text-xs text-white/40">{option.desc}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Format Options (for image conversion) */}
          {selectedConversion === 'image-to-image' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 glass-strong rounded-xl p-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="font-mono text-xs text-white/60 mb-2 block">
                    Output Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="w-full glass rounded-lg px-4 py-2 font-mono text-sm text-white bg-transparent border border-white/10"
                  >
                    <option value="png" className="bg-black">PNG</option>
                    <option value="jpeg" className="bg-black">JPEG</option>
                    <option value="webp" className="bg-black">WEBP</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-xs text-white/60 mb-2 block">
                    Quality: {Math.round(imageQuality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={imageQuality}
                    onChange={(e) => setImageQuality(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          )}

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
                isDragActive ? 'border-white/60 bg-white/5' : 'border-white/20'
              }`}
            >
              <div className="p-16 text-center">
                <input {...getInputProps()} />
                
                <motion.div
                  animate={{ scale: isDragActive ? 1.1 : 1 }}
                  className="mb-6"
                >
                  <svg
                    className="w-20 h-20 mx-auto text-white/40"
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
                  {isDragActive ? 'Drop files here' : 'Drag & Drop Files'}
                </h3>
                <p className="font-mono text-sm text-white/40 mb-4">
                  or click to browse
                </p>
              </div>

              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-white/10 rounded-tl-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-white/10 rounded-br-2xl pointer-events-none" />
            </div>
          </motion.div>

          {/* Uploaded Files */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-mono text-sm text-white/60">
                  Files ({files.length})
                </h3>
                <button
                  onClick={clearAll}
                  className="font-mono text-xs text-white/40 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {files.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-strong rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {file.preview && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                          <img
                            src={file.preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-mono text-sm text-white">{file.file.name}</p>
                        <p className="font-mono text-xs text-white/40">
                          {(file.file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {file.status === 'completed' && (
                        <button
                          onClick={() => downloadFile(file)}
                          className="px-4 py-2 glass rounded-full font-mono text-xs text-white/70 hover:text-white transition-colors"
                        >
                          Download
                        </button>
                      )}
                      {file.status === 'pending' && (
                        <button
                          onClick={() => removeFile(file.id)}
                          className="px-4 py-2 glass rounded-full font-mono text-xs text-white/40 hover:text-white transition-colors"
                        >
                          Remove
                        </button>
                      )}
                      {file.status === 'processing' && (
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      )}
                      {file.status === 'completed' && (
                        <svg className="w-6 h-6 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Convert Button */}
              {files.some((f) => f.status === 'pending') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 text-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={processConversions}
                    disabled={isProcessing}
                    className="px-10 py-4 rounded-full font-mono text-sm text-black bg-white hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        <span>Converting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        <span>Convert {files.filter(f => f.status === 'pending').length} Files</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}

              {/* Download All Button */}
              {hasResults && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 text-center"
                >
                  <button
                    onClick={downloadAll}
                    className="px-8 py-3 glass-strong rounded-full font-mono text-sm text-white/80 hover:text-white transition-colors flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download All ({completedFiles.length})
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Empty State */}
          {files.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="glass-strong rounded-2xl p-12 max-w-md mx-auto">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-white/20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="font-display text-xl text-white mb-2 font-light">
                  No files uploaded yet
                </h3>
                <p className="font-mono text-sm text-white/40">
                  Select a conversion type and upload files to get started
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}

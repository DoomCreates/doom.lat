'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Simple playlist - add or remove tracks as needed
const PLAYLIST = [
  { id: 1, name: 'Track 1', src: '/music/track.mp3' },
  { id: 2, name: 'Track 2', src: '/music/track2.mp3' },
  { id: 3, name: 'Track 3', src: '/music/track3.mp3' },
];

export default function MusicPlayer() {
  const [mounted, setMounted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = PLAYLIST[currentTrackIndex];

  // Mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Setup audio event listeners
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    const audio = audioRef.current;
    if (!audio) return;

    // Set initial volume
    audio.volume = volume;

    const updateTime = () => {
      if (audio.currentTime) {
        setCurrentTime(audio.currentTime);
      }
    };

    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      // Auto-play next track
      handleNext();
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', updateDuration);
    };
  }, [mounted, currentTrackIndex, volume]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error('Playback error:', err);
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    setCurrentTime(0);
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    setIsPlaying(false);
    
    // Delay to let track change
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    }, 100);
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      // Restart current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else {
      // Go to previous track
      setCurrentTime(0);
      setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
      setIsPlaying(false);
      
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
        }
      }, 100);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!mounted) return null;

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
      >
        <div className="relative">
          {/* Glow effect */}
          <motion.div
            animate={{
              opacity: isPlaying ? [0.3, 0.5, 0.3] : 0.2,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 bg-white/10 blur-2xl rounded-full"
          />
          
          {/* Track name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <div className="glass-strong rounded-full px-4 py-1.5 text-xs text-white/70 font-mono">
              {currentTrack.name}
            </div>
          </motion.div>

          {/* Player container */}
          <div className="relative glass-strong rounded-full px-6 py-3 shadow-2xl border-white/20">
            <div className="flex items-center gap-4 min-w-[400px]">
              {/* Previous button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevious}
                className="w-9 h-9 rounded-full glass hover:glass-strong transition-all flex items-center justify-center"
                aria-label="Previous track"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </motion.button>

              {/* Play/Pause button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="relative w-12 h-12 rounded-full glass hover:glass-strong transition-all flex items-center justify-center overflow-hidden"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying && (
                  <motion.div
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-white/20 rounded-full"
                  />
                )}
                
                <AnimatePresence mode="wait">
                  {isPlaying ? (
                    <motion.svg
                      key="pause"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{ duration: 0.3 }}
                      className="w-5 h-5 text-white relative z-10"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </motion.svg>
                  ) : (
                    <motion.svg
                      key="play"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{ duration: 0.3 }}
                      className="w-5 h-5 text-white ml-0.5 relative z-10"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Next button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="w-9 h-9 rounded-full glass hover:glass-strong transition-all flex items-center justify-center"
                aria-label="Next track"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </motion.button>

              {/* Progress bar */}
              <div className="flex-1 space-y-2">
                <div
                  onClick={handleProgressClick}
                  className="h-2 bg-white/5 rounded-full overflow-hidden cursor-pointer group relative"
                >
                  <div
                    className="h-full bg-gradient-to-r from-white/60 to-white/80 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                  
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    style={{ left: `${progress}%`, marginLeft: '-6px' }}
                  />
                </div>
                
                <div className="flex justify-between text-xs font-mono text-white/50">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Volume control */}
              <div
                className="relative"
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-full glass hover:glass-strong transition-all flex items-center justify-center"
                  aria-label="Volume"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                </motion.button>

                <AnimatePresence>
                  {showVolume && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2"
                    >
                      <div className="glass-strong rounded-xl p-4 shadow-xl">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-28 h-1.5 accent-white/80 bg-white/10 rounded-full appearance-none cursor-pointer"
                          style={{
                            writingMode: 'vertical-lr',
                            direction: 'rtl',
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Audio element */}
      <audio 
        ref={audioRef}
        src={currentTrack.src}
        preload="metadata"
      />
    </>
  );
}

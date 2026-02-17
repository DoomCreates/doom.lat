'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Playlist configuration
const PLAYLIST = [
  { id: 1, name: 'Track 1', src: '/music/track.mp3' },
  { id: 2, name: 'Track 2', src: '/music/track2.mp3' },
  { id: 3, name: 'Track 3', src: '/music/track3.mp3' },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showVolume, setShowVolume] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = PLAYLIST[currentTrackIndex];

  // Check if component is mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle autoplay on first user interaction
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasInteracted) return;
    
    const audio = audioRef.current;
    if (!audio) return;

    const attemptAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.log('Autoplay prevented by browser:', err);
        setError('Click play to start music');
      }
    };

    if (isLoaded && !isPlaying) {
      attemptAutoplay();
    }
  }, [isLoaded, hasInteracted, isPlaying]);

  // Enable autoplay on any user interaction
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const enableAutoplay = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    };

    window.addEventListener('click', enableAutoplay, { once: true });
    window.addEventListener('keypress', enableAutoplay, { once: true });

    return () => {
      window.removeEventListener('click', enableAutoplay);
      window.removeEventListener('keypress', enableAutoplay);
    };
  }, [hasInteracted]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };
    const handleEnded = () => {
      nextTrack();
    };
    const handleError = () => {
      setError('Could not load audio file');
      setIsPlaying(false);
    };
    const handleCanPlay = () => {
      setIsLoaded(true);
      setError(null);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    audio.load();

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentTrackIndex]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    setHasInteracted(true);
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        setError(null);
      }
    } catch (err) {
      console.error('Playback error:', err);
      setError('Playback failed');
      setIsPlaying(false);
    }
  };

  const nextTrack = async () => {
    setIsLoaded(false);
    setCurrentTime(0);
    const wasPlaying = isPlaying;
    setIsPlaying(false);
    
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    
    if (wasPlaying && audioRef.current) {
      setTimeout(async () => {
        try {
          await audioRef.current?.play();
          setIsPlaying(true);
        } catch (err) {
          console.error('Error playing next track:', err);
        }
      }, 100);
    }
  };

  const previousTrack = async () => {
    setIsLoaded(false);
    setCurrentTime(0);
    const wasPlaying = isPlaying;
    setIsPlaying(false);
    
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        if (wasPlaying) {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } else {
      setCurrentTrackIndex((prev) => 
        prev === 0 ? PLAYLIST.length - 1 : prev - 1
      );
      
      if (wasPlaying && audioRef.current) {
        setTimeout(async () => {
          try {
            await audioRef.current?.play();
            setIsPlaying(true);
          } catch (err) {
            console.error('Error playing previous track:', err);
          }
        }, 100);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !isLoaded) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Don't render until mounted (prevents SSR issues)
  if (!isMounted) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ 
        delay: 2, 
        duration: 1, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="relative">
        <motion.div
          animate={{
            opacity: isPlaying ? [0.3, 0.5, 0.3] : 0.2,
            scale: isPlaying ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-white/10 blur-2xl rounded-full"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <div className="glass-strong rounded-full px-4 py-1.5 text-xs text-white/70 font-mono">
            {currentTrack.name}
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full mb-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <div className="glass-strong rounded-lg px-4 py-2 text-xs text-white/80">
              {error}
            </div>
          </motion.div>
        )}

        <div className="relative glass-strong rounded-full px-6 py-3 shadow-2xl border-white/20">
          <div className="flex items-center gap-4 min-w-[400px]">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={previousTrack}
              disabled={!isLoaded}
              className="w-9 h-9 rounded-full glass hover:glass-strong transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
              disabled={!isLoaded}
              className="relative w-12 h-12 rounded-full glass hover:glass-strong transition-all flex items-center justify-center group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlaying && (
                <motion.div
                  animate={{
                    scale: [1, 1.5],
                    opacity: [0.5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
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
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="w-5 h-5 text-white ml-0.5 relative z-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextTrack}
              disabled={!isLoaded}
              className="w-9 h-9 rounded-full glass hover:glass-strong transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </motion.button>

            <div className="flex-1 space-y-2">
              <div
                onClick={handleProgressClick}
                className="h-2 bg-white/5 rounded-full overflow-hidden cursor-pointer group relative"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-white/60 to-white/80 relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                >
                  <motion.div
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />
                </motion.div>
                
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  style={{ left: `${progress}%`, marginLeft: '-6px' }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono text-white/50">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div
              className="relative"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full glass hover:glass-strong transition-all flex items-center justify-center"
              >
                <motion.svg
                  animate={{
                    scale: volume > 0 ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </motion.svg>
              </motion.button>

              <AnimatePresence>
                {showVolume && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
                        className="w-28 h-1.5 accent-white/80 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 transition-transform"
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

      <audio 
        ref={audioRef} 
        src={currentTrack.src} 
        preload="metadata"
      />
    </motion.div>
  );
}

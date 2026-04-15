'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PLAYLIST = [
  { id: 1, name: 'Track 1', src: '/music/track.mp3'  },
  { id: 2, name: 'Track 2', src: '/music/track2.mp3' },
  { id: 3, name: 'Track 3', src: '/music/track3.mp3' },
];

export default function MusicPlayer() {
  const [mounted, setMounted]               = useState(false);
  const [isPlaying, setIsPlaying]           = useState(false);
  const [currentTrack, setCurrentTrack]     = useState(0);
  const [currentTime, setCurrentTime]       = useState(0);
  const [duration, setDuration]             = useState(0);
  const [volume, setVolume]                 = useState(0.7);
  const [showVolumeSlider, setShowVolume]   = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime     = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded    = () => nextTrack();
    audio.addEventListener('timeupdate',    updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended',         handleEnded);
    return () => {
      audio.removeEventListener('timeupdate',    updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended',         handleEnded);
    };
  }, [currentTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(p => !p);
  };

  const nextTrack     = () => { setCurrentTrack(p => (p + 1) % PLAYLIST.length); setIsPlaying(true); };
  const previousTrack = () => { setCurrentTrack(p => (p - 1 + PLAYLIST.length) % PLAYLIST.length); setIsPlaying(true); };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const fmt = (t: number) => {
    if (isNaN(t)) return '0:00';
    return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  };

  if (!mounted) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} src={PLAYLIST[currentTrack].src} autoPlay={isPlaying} />

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <div
          className="rounded-2xl p-4 min-w-[320px] shadow-xl"
          style={{
            background: 'rgba(12, 12, 12, 0.92)',
            border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 12px rgba(255,255,255,0.15)',
          }}
        >
          {/* Track info */}
          <div className="mb-4">
            <div className="font-mono text-sm text-white/80 mb-1">
              {PLAYLIST[currentTrack].name}
            </div>
            <div className="font-mono text-xs text-white/40">
              {fmt(currentTime)} / {fmt(duration)}
            </div>
          </div>

          {/* Progress bar */}
          <div
            onClick={handleSeek}
            className="h-1 bg-white/10 rounded-full mb-4 cursor-pointer overflow-hidden group"
          >
            <motion.div
              className="h-full rounded-full relative"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, white, rgba(255,255,255,0.6))',
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_white] opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Prev */}
              <button
                onClick={previousTrack}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, white, rgba(255,255,255,0.7))',
                  boxShadow: '0 0 20px rgba(255,255,255,0.6)',
                }}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Next */}
              <button
                onClick={nextTrack}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {/* Volume */}
            <div
              className="relative"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              </button>

              <AnimatePresence>
                {showVolumeSlider && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-full right-0 mb-2 p-3 rounded-xl shadow-xl"
                    style={{
                      background: 'rgba(12,12,12,0.95)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <input
                      type="range" min="0" max="1" step="0.01" value={volume}
                      onChange={handleVolumeChange}
                      className="w-24 h-1 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, white ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`,
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

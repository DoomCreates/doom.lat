'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Link from 'next/link';

type GameStatus = 'playing' | 'checkmate' | 'draw' | 'stalemate';
type Difficulty = 'easy' | 'medium' | 'hard' | 'master';

const DIFFICULTY_SETTINGS: Record<Difficulty, { depth: number; label: string; elo: string }> = {
  easy:   { depth: 2,  label: 'Easy',   elo: '~800'  },
  medium: { depth: 6,  label: 'Medium', elo: '~1500' },
  hard:   { depth: 12, label: 'Hard',   elo: '~2000' },
  master: { depth: 18, label: 'Master', elo: '~2500' },
};

export default function ChessPage() {
  const [mounted, setMounted] = useState(false);
  const [game, setGame] = useState<Chess>(new Chess());
  const [fen, setFen] = useState('start');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [isThinking, setIsThinking] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [playerColor] = useState<'white' | 'black'>('white');
  const [statusMessage, setStatusMessage] = useState('Your move');
  const [engineReady, setEngineReady] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  const engineRef = useRef<Worker | null>(null);
  const resolveRef = useRef<((move: string) => void) | null>(null);

  // Boot Stockfish as a Web Worker from /public/stockfish.js
  useEffect(() => {
    setMounted(true);

    try {
      const worker = new Worker('/stockfish.js');

      worker.onmessage = (e: MessageEvent) => {
        const msg: string = typeof e.data === 'string' ? e.data : '';

        if (msg === 'uciok') {
          worker.postMessage('isready');
        } else if (msg === 'readyok') {
          setEngineReady(true);
        } else if (msg.startsWith('bestmove')) {
          const parts = msg.split(' ');
          const move = parts[1];
          if (move && move !== '(none)' && resolveRef.current) {
            resolveRef.current(move);
            resolveRef.current = null;
          }
        }
      };

      worker.onerror = (err) => {
        console.error('Stockfish worker error:', err);
        setEngineReady(false);
      };

      worker.postMessage('uci');
      engineRef.current = worker;
    } catch (err) {
      console.error('Failed to start Stockfish worker:', err);
    }

    return () => {
      engineRef.current?.terminate();
    };
  }, []);

  const getBestMove = useCallback(
    (currentFen: string, depth: number): Promise<string> => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;
        const worker = engineRef.current;
        if (!worker) return;
        worker.postMessage('ucinewgame');
        worker.postMessage(`position fen ${currentFen}`);
        worker.postMessage(`go depth ${depth}`);
      });
    },
    []
  );

  const updateStatus = useCallback((currentGame: Chess) => {
    if (currentGame.isCheckmate()) {
      const winner = currentGame.turn() === 'w' ? 'Black' : 'White';
      setStatusMessage(`Checkmate — ${winner} wins!`);
      setGameStatus('checkmate');
    } else if (currentGame.isDraw()) {
      setStatusMessage('Draw!');
      setGameStatus('draw');
    } else if (currentGame.isStalemate()) {
      setStatusMessage('Stalemate!');
      setGameStatus('stalemate');
    } else if (currentGame.inCheck()) {
      setStatusMessage(currentGame.turn() === 'w' ? 'White is in check!' : 'Black is in check!');
    } else {
      setStatusMessage(currentGame.turn() === 'w' ? 'Your move' : 'AI is thinking...');
    }
  }, []);

  const makeAIMove = useCallback(
    async (currentGame: Chess) => {
      if (!engineReady || currentGame.isGameOver()) return;

      setIsThinking(true);
      const depth = DIFFICULTY_SETTINGS[difficulty].depth;

      try {
        const bestMove = await getBestMove(currentGame.fen(), depth);

        const from = bestMove.slice(0, 2);
        const to   = bestMove.slice(2, 4);
        const promo = bestMove.length === 5 ? bestMove[4] : undefined;

        const newGame = new Chess(currentGame.fen());
        const result = newGame.move({ from, to, promotion: promo ?? 'q' });

        if (result) {
          setLastMove({ from, to });
          setGame(newGame);
          setFen(newGame.fen());
          setMoveHistory((prev) => [...prev, result.san]);
          updateStatus(newGame);
        }
      } catch (err) {
        console.error('AI move error:', err);
      } finally {
        setIsThinking(false);
      }
    },
    [engineReady, difficulty, getBestMove, updateStatus]
  );

  const onDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (gameStatus !== 'playing' || isThinking) return false;
      if (game.turn() !== (playerColor === 'white' ? 'w' : 'b')) return false;

      const newGame = new Chess(game.fen());
      let move = null;

      try {
        move = newGame.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q',
        });
      } catch {
        return false;
      }

      if (!move) return false;

      setLastMove({ from: sourceSquare, to: targetSquare });
      setGame(newGame);
      setFen(newGame.fen());
      setMoveHistory((prev) => [...prev, move.san]);
      updateStatus(newGame);

      if (!newGame.isGameOver()) {
        setTimeout(() => makeAIMove(newGame), 300);
      }

      return true;
    },
    [game, gameStatus, isThinking, playerColor, makeAIMove, updateStatus]
  );

  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setFen('start');
    setGameStatus('playing');
    setMoveHistory([]);
    setStatusMessage('Your move');
    setLastMove(null);
    setIsThinking(false);
  }, []);

  const customSquareStyles: Record<string, React.CSSProperties> = {};
  if (lastMove) {
    customSquareStyles[lastMove.from] = { backgroundColor: 'rgba(139, 92, 246, 0.35)' };
    customSquareStyles[lastMove.to]   = { backgroundColor: 'rgba(139, 92, 246, 0.55)' };
  }

  if (!mounted) {
    return <div className="min-h-screen bg-[#0a0118]" />;
  }

  return (
    <main className="relative bg-[#0a0118] min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-display text-xl text-white font-light">
              DOOM
            </Link>
            <div className="flex items-center gap-8">
              <Link href="/" className="font-mono text-sm text-purple-300/70 hover:text-purple-200 transition-colors">Home</Link>
              <Link href="/#projects" className="font-mono text-sm text-purple-300/70 hover:text-purple-200 transition-colors">Projects</Link>
              <Link href="/ocr" className="font-mono text-sm text-purple-300/70 hover:text-purple-200 transition-colors">OCR Tool</Link>
              <Link href="/chess" className="font-mono text-sm text-purple-300 border-b border-purple-500">Chess</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-12"
          >
            <div className="inline-block mb-4">
              <span className="inline-block px-4 py-1.5 glass rounded-full font-mono text-xs tracking-[0.2em] text-purple-300/60 uppercase border border-purple-500/20">
                Powered by Stockfish 18
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl text-gradient mb-4 font-light tracking-tight">
              Chess
            </h1>
            <p className="font-mono text-sm text-purple-300/60">
              Play against Stockfish — one of the strongest chess engines in the world.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">

            {/* Board */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 w-20 h-20 border-t-2 border-l-2 border-purple-500/30 rounded-tl-2xl pointer-events-none" />
              <div className="absolute -bottom-4 -right-4 w-20 h-20 border-b-2 border-r-2 border-pink-500/30 rounded-br-2xl pointer-events-none" />

              <div className="glass-strong rounded-2xl p-4 border border-purple-500/20 shadow-2xl glow-purple">
                {/* Status bar */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${engineReady ? 'bg-green-400' : 'bg-yellow-400'} ${engineReady ? '' : 'animate-pulse'}`} />
                    <span className="font-mono text-xs text-purple-300/60">
                      {engineReady ? 'Engine ready' : 'Loading engine...'}
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={statusMessage}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className={`font-mono text-xs ${
                        gameStatus !== 'playing'
                          ? 'text-pink-400'
                          : isThinking
                          ? 'text-yellow-400/80'
                          : 'text-purple-300/70'
                      }`}
                    >
                      {statusMessage}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {/* Thinking indicator */}
                {isThinking && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 mb-4 rounded-full origin-left"
                    style={{
                      backgroundSize: '200% 100%',
                      animation: 'gradientMove 1.5s linear infinite',
                    }}
                  />
                )}

                <Chessboard
                  position={fen}
                  onPieceDrop={onDrop}
                  boardOrientation={playerColor}
                  customSquareStyles={customSquareStyles}
                  customDarkSquareStyle={{ backgroundColor: '#2d1b4e' }}
                  customLightSquareStyle={{ backgroundColor: '#1a0d33' }}
                  customBoardStyle={{
                    borderRadius: '12px',
                    boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)',
                  }}
                  animationDuration={200}
                />
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Difficulty */}
              <div className="glass-strong rounded-2xl p-6 border border-purple-500/20">
                <h3 className="font-mono text-xs text-purple-300/50 uppercase tracking-[0.2em] mb-4">
                  Difficulty
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(DIFFICULTY_SETTINGS) as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`px-3 py-2 rounded-xl font-mono text-xs transition-all border ${
                        difficulty === d
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                          : 'glass border-purple-500/10 text-purple-400/50 hover:border-purple-500/30 hover:text-purple-300'
                      }`}
                    >
                      <div>{DIFFICULTY_SETTINGS[d].label}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">{DIFFICULTY_SETTINGS[d].elo}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="glass-strong rounded-2xl p-6 border border-purple-500/20">
                <h3 className="font-mono text-xs text-purple-300/50 uppercase tracking-[0.2em] mb-4">
                  Controls
                </h3>
                <button
                  onClick={resetGame}
                  className="w-full px-4 py-3 rounded-xl font-mono text-sm text-white btn-gradient transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  New Game
                </button>
              </div>

              {/* Move history */}
              <div className="glass-strong rounded-2xl p-6 border border-purple-500/20">
                <h3 className="font-mono text-xs text-purple-300/50 uppercase tracking-[0.2em] mb-4">
                  Move History
                </h3>
                {moveHistory.length === 0 ? (
                  <p className="font-mono text-xs text-purple-400/30 text-center py-4">
                    No moves yet
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                    {moveHistory.reduce<string[][]>((pairs, move, i) => {
                      if (i % 2 === 0) pairs.push([move]);
                      else pairs[pairs.length - 1].push(move);
                      return pairs;
                    }, []).map((pair, i) => (
                      <div key={i} className="contents">
                        <div className="font-mono text-xs text-purple-300/60 flex gap-2">
                          <span className="text-purple-500/40 w-6">{i + 1}.</span>
                          <span>{pair[0]}</span>
                        </div>
                        {pair[1] && (
                          <div className="font-mono text-xs text-purple-300/40">{pair[1]}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Game over overlay info */}
              {gameStatus !== 'playing' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-strong rounded-2xl p-6 border border-pink-500/30 text-center"
                >
                  <p className="font-display text-2xl text-gradient mb-2 font-light">
                    {gameStatus === 'checkmate' ? 'Game Over' : 'Draw'}
                  </p>
                  <p className="font-mono text-xs text-purple-300/60 mb-4">{statusMessage}</p>
                  <button
                    onClick={resetGame}
                    className="px-6 py-2 rounded-full font-mono text-sm text-white btn-gradient"
                  >
                    Play Again
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}

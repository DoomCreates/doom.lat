'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chess, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import SubNav from '@/components/SubNav';

const ease = [0.16, 1, 0.3, 1] as const;

type Difficulty = 'easy' | 'medium' | 'hard' | 'master';
type GameStatus  = 'playing' | 'checkmate' | 'draw' | 'stalemate';

const DIFFICULTY_DEPTH: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3, master: 4 };
const DIFFICULTY_ELO:   Record<Difficulty, string>  = { easy: '~600', medium: '~1200', hard: '~1800', master: '~2200' };

const PIECE_VALUES: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

/* Piece-square tables */
const PST: Record<string, number[]> = {
  p: [0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,25,25,10,5,5,0,0,0,20,20,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-20,-20,10,10,5,0,0,0,0,0,0,0,0],
  n: [-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,15,15,10,0,-30,-30,5,15,20,20,15,5,-30,-30,0,15,20,20,15,0,-30,-30,5,10,15,15,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50],
  b: [-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,10,10,5,0,-10,-10,5,5,10,10,5,5,-10,-10,0,10,10,10,10,0,-10,-10,10,10,10,10,10,10,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20],
  r: [0,0,0,0,0,0,0,0,5,10,10,10,10,10,10,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,5,5,0,0,0],
  q: [-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,5,5,5,0,-10,-5,0,5,5,5,5,0,-5,0,0,5,5,5,5,0,-5,-10,5,5,5,5,5,0,-10,-10,0,5,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20],
  k: [-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20],
};

function getPST(type: string, color: string, square: string): number {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]) - 1;
  const idx  = color === 'w' ? (7 - rank) * 8 + file : rank * 8 + file;
  return PST[type]?.[idx] ?? 0;
}

function evaluate(game: Chess): number {
  let score = 0;
  for (const row of game.board())
    for (const piece of row)
      if (piece) {
        const val = PIECE_VALUES[piece.type] + getPST(piece.type, piece.color, piece.square);
        score += piece.color === 'w' ? val : -val;
      }
  return score;
}

function minimax(game: Chess, depth: number, alpha: number, beta: number, max: boolean): number {
  if (depth === 0 || game.isGameOver()) return evaluate(game);
  const moves = game.moves({ verbose: true });
  if (max) {
    let best = -Infinity;
    for (const m of moves) { game.move(m); best = Math.max(best, minimax(game, depth-1, alpha, beta, false)); game.undo(); alpha = Math.max(alpha, best); if (beta <= alpha) break; }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) { game.move(m); best = Math.min(best, minimax(game, depth-1, alpha, beta, true)); game.undo(); beta = Math.min(beta, best); if (beta <= alpha) break; }
    return best;
  }
}

function getBestMove(game: Chess, depth: number): Move | null {
  const moves = game.moves({ verbose: true });
  if (!moves.length) return null;
  let bestVal = Infinity, bestMove: Move | null = null;
  for (const m of moves) {
    game.move(m);
    const val = minimax(game, depth - 1, -Infinity, Infinity, true);
    game.undo();
    if (val < bestVal) { bestVal = val; bestMove = m; }
  }
  return bestMove;
}

export default function ChessPage() {
  const [mounted, setMounted]     = useState(false);
  const [game, setGame]           = useState<Chess>(new Chess());
  const [fen, setFen]             = useState('start');
  const [status, setStatus]       = useState<GameStatus>('playing');
  const [thinking, setThinking]   = useState(false);
  const [difficulty, setDiff]     = useState<Difficulty>('medium');
  const [history, setHistory]     = useState<string[]>([]);
  const [message, setMessage]     = useState('Your move');
  const [lastMove, setLastMove]   = useState<{ from: string; to: string } | null>(null);
  const histRef                   = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (histRef.current) histRef.current.scrollTop = histRef.current.scrollHeight; }, [history]);

  const updateStatus = useCallback((g: Chess) => {
    if (g.isCheckmate())  { setMessage(g.turn() === 'w' ? 'Checkmate — Black wins' : 'Checkmate — You win'); setStatus('checkmate'); }
    else if (g.isStalemate()) { setMessage('Stalemate'); setStatus('stalemate'); }
    else if (g.isDraw())  { setMessage('Draw'); setStatus('draw'); }
    else if (g.inCheck()) { setMessage(g.turn() === 'w' ? 'You are in check' : 'AI is in check'); }
    else { setMessage(g.turn() === 'w' ? 'Your move' : 'AI thinking…'); }
  }, []);

  const makeAIMove = useCallback((current: Chess) => {
    if (current.isGameOver()) return;
    setThinking(true);
    setTimeout(() => {
      try {
        const copy = new Chess(current.fen());
        const best = getBestMove(copy, DIFFICULTY_DEPTH[difficulty]);
        if (best) {
          const next = new Chess(current.fen());
          const r = next.move(best);
          if (r) { setLastMove({ from: r.from, to: r.to }); setGame(next); setFen(next.fen()); setHistory(h => [...h, r.san]); updateStatus(next); }
        }
      } catch (e) { console.error(e); }
      finally { setThinking(false); }
    }, 50);
  }, [difficulty, updateStatus]);

  const onDrop = useCallback((from: string, to: string) => {
    if (status !== 'playing' || thinking || game.turn() !== 'w') return false;
    const next = new Chess(game.fen());
    let r: Move | null = null;
    try { r = next.move({ from, to, promotion: 'q' }); } catch { return false; }
    if (!r) return false;
    setLastMove({ from, to }); setGame(next); setFen(next.fen()); setHistory(h => [...h, r!.san]); updateStatus(next);
    if (!next.isGameOver()) makeAIMove(next);
    return true;
  }, [game, status, thinking, makeAIMove, updateStatus]);

  const reset = useCallback(() => {
    const g = new Chess();
    setGame(g); setFen('start'); setStatus('playing'); setHistory([]); setMessage('Your move'); setLastMove(null); setThinking(false);
  }, []);

  const squareStyles: Record<string, React.CSSProperties> = {};
  if (lastMove) {
    squareStyles[lastMove.from] = { backgroundColor: 'rgba(232, 224, 204, 0.15)' };
    squareStyles[lastMove.to]   = { backgroundColor: 'rgba(232, 224, 204, 0.28)' };
  }

  const pairs = history.reduce<string[][]>((acc, m, i) => {
    if (i % 2 === 0) acc.push([m]); else acc[acc.length - 1].push(m);
    return acc;
  }, []);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <main className="bg-black min-h-screen">
      <SubNav active="Chess" />

      <div className="pt-14">
        {/* Page header */}
        <div className="border-b border-white/8 px-6 md:px-12 lg:px-20 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
          >
            <p className="font-mono text-[10px] text-white/25 tracking-[0.3em] uppercase mb-4">
              Minimax &nbsp;·&nbsp; Alpha-Beta Pruning
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-light tracking-tight text-white leading-tight">
              Chess
            </h1>
          </motion.div>
        </div>

        {/* Controls row — mobile */}
        <div className="border-b border-white/6 px-6 md:px-12 lg:px-20 py-4 flex flex-wrap items-center gap-4 lg:hidden">
          <div className="flex gap-2">
            {(Object.keys(DIFFICULTY_DEPTH) as Difficulty[]).map(d => (
              <button key={d} onClick={() => { setDiff(d); reset(); }}
                className={`px-3 py-1.5 font-mono text-xs border transition-all ${
                  difficulty === d ? 'border-white/30 text-white bg-white/6' : 'border-white/8 text-white/30'
                }`}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <span className={`font-mono text-xs ${status !== 'playing' ? 'text-white/70' : 'text-white/30'}`}>{message}</span>
            <button onClick={reset} className="font-mono text-xs text-white/25 hover:text-white transition-colors border border-white/8 px-3 py-1.5">
              New
            </button>
          </div>
          {thinking && (
            <div className="w-full h-px bg-white/6 overflow-hidden">
              <motion.div className="h-full w-1/3 bg-white/35"
                animate={{ x: ['-100%', '400%'] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }} />
            </div>
          )}
        </div>

        {/* Main layout */}
        <div className="px-6 md:px-12 lg:px-20 py-10 md:py-12">
          <div className="grid lg:grid-cols-[1fr_280px] gap-8 lg:gap-12 items-start">

            {/* Board */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.1 }}
            >
              {/* Desktop status */}
              <div className="hidden lg:flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${thinking ? 'bg-[#e8e0cc] animate-pulse' : 'bg-white/25'}`} />
                  <span className="font-mono text-xs text-white/30">{thinking ? 'Thinking…' : 'Ready'}</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.span key={message}
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    className={`font-mono text-xs ${status !== 'playing' ? 'text-white/70' : 'text-white/30'}`}>
                    {message}
                  </motion.span>
                </AnimatePresence>
              </div>

              {thinking && (
                <div className="hidden lg:block h-px mb-4 bg-white/6 overflow-hidden">
                  <motion.div className="h-full w-1/3 bg-white/35"
                    animate={{ x: ['-100%', '400%'] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }} />
                </div>
              )}

              <div className="border border-white/8 p-2 sm:p-3">
                <Chessboard
                  position={fen}
                  onPieceDrop={onDrop}
                  boardOrientation="white"
                  customSquareStyles={squareStyles}
                  customDarkSquareStyle={{ backgroundColor: '#141414' }}
                  customLightSquareStyle={{ backgroundColor: '#0a0a0a' }}
                  customBoardStyle={{ boxShadow: 'none' }}
                  animationDuration={120}
                  arePiecesDraggable={!thinking && status === 'playing'}
                />
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.2 }}
              className="space-y-5"
            >
              {/* Difficulty — desktop only */}
              <div className="hidden lg:block border border-white/8 p-5">
                <p className="font-mono text-[10px] text-white/25 uppercase tracking-[0.2em] mb-4">Difficulty</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(DIFFICULTY_DEPTH) as Difficulty[]).map(d => (
                    <button key={d} onClick={() => { setDiff(d); reset(); }}
                      className={`px-3 py-2.5 font-mono text-xs border transition-all ${
                        difficulty === d ? 'border-white/30 text-white bg-white/6' : 'border-white/6 text-white/30 hover:border-white/18'
                      }`}>
                      <div>{d.charAt(0).toUpperCase() + d.slice(1)}</div>
                      <div className="text-[10px] opacity-50 mt-0.5">{DIFFICULTY_ELO[d]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* New game — desktop only */}
              <button onClick={reset}
                className="hidden lg:flex w-full py-3 btn-gradient font-mono text-sm items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                New Game
              </button>

              {/* Move history */}
              <div className="border border-white/8 p-5">
                <p className="font-mono text-[10px] text-white/25 uppercase tracking-[0.2em] mb-4">Move History</p>
                <div ref={histRef} className="max-h-40 lg:max-h-64 overflow-y-auto custom-scrollbar space-y-1">
                  {pairs.length === 0
                    ? <p className="font-mono text-xs text-white/18 text-center py-4">No moves yet</p>
                    : pairs.map((pair, i) => (
                      <div key={i} className="grid grid-cols-[18px_1fr_1fr] gap-1 items-center">
                        <span className="font-mono text-[10px] text-white/18">{i+1}.</span>
                        <span className="font-mono text-xs text-white/50 bg-white/3 px-2 py-0.5">{pair[0]}</span>
                        {pair[1] && <span className="font-mono text-xs text-white/30 bg-white/3 px-2 py-0.5">{pair[1]}</span>}
                      </div>
                    ))}
                </div>
              </div>

              {/* Game over */}
              {status !== 'playing' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  className="border border-white/18 p-6 text-center"
                >
                  <p className="font-display text-2xl text-white font-light mb-2">
                    {status === 'checkmate' ? 'Game Over' : 'Draw'}
                  </p>
                  <p className="font-mono text-xs text-white/30 mb-5">{message}</p>
                  <button onClick={reset} className="px-6 py-2 btn-gradient font-mono text-sm">
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

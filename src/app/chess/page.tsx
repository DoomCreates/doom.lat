'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chess, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Link from 'next/link';

type Difficulty = 'easy' | 'medium' | 'hard' | 'master';
type GameStatus = 'playing' | 'checkmate' | 'draw' | 'stalemate';

const DIFFICULTY_DEPTH: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  master: 4,
};

const DIFFICULTY_INFO: Record<Difficulty, { label: string; elo: string }> = {
  easy:   { label: 'Easy',   elo: '~600'  },
  medium: { label: 'Medium', elo: '~1200' },
  hard:   { label: 'Hard',   elo: '~1800' },
  master: { label: 'Master', elo: '~2200' },
};

const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

const PAWN_TABLE = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0,
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20,
];

const KING_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20,
];

const TABLES: Record<string, number[]> = {
  p: PAWN_TABLE, n: KNIGHT_TABLE, b: BISHOP_TABLE,
  r: ROOK_TABLE, q: QUEEN_TABLE,  k: KING_TABLE,
};

function getPST(type: string, color: string, square: string): number {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]) - 1;
  const idx = color === 'w' ? (7 - rank) * 8 + file : rank * 8 + file;
  return TABLES[type]?.[idx] ?? 0;
}

function evaluate(game: Chess): number {
  let score = 0;
  for (const row of game.board()) {
    for (const piece of row) {
      if (!piece) continue;
      const val = PIECE_VALUES[piece.type] + getPST(piece.type, piece.color, piece.square);
      score += piece.color === 'w' ? val : -val;
    }
  }
  return score;
}

function minimax(game: Chess, depth: number, alpha: number, beta: number, maximising: boolean): number {
  if (depth === 0 || game.isGameOver()) return evaluate(game);
  const moves = game.moves({ verbose: true });
  if (maximising) {
    let best = -Infinity;
    for (const m of moves) {
      game.move(m);
      best = Math.max(best, minimax(game, depth - 1, alpha, beta, false));
      game.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      game.move(m);
      best = Math.min(best, minimax(game, depth - 1, alpha, beta, true));
      game.undo();
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function getBestMove(game: Chess, depth: number): Move | null {
  const moves = game.moves({ verbose: true });
  if (!moves.length) return null;
  let bestVal = Infinity;
  let bestMove: Move | null = null;
  for (const m of moves) {
    game.move(m);
    const val = minimax(game, depth - 1, -Infinity, Infinity, true);
    game.undo();
    if (val < bestVal) { bestVal = val; bestMove = m; }
  }
  return bestMove;
}

export default function ChessPage() {
  const [mounted, setMounted] = useState(false);
  const [game, setGame] = useState<Chess>(new Chess());
  const [fen, setFen] = useState('start');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [isThinking, setIsThinking] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState('Your move');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [moveHistory]);

  const updateStatus = useCallback((g: Chess) => {
    if (g.isCheckmate()) {
      setStatusMessage(g.turn() === 'w' ? 'Checkmate — Black wins!' : 'Checkmate — You win!');
      setGameStatus('checkmate');
    } else if (g.isStalemate()) {
      setStatusMessage('Stalemate — Draw!');
      setGameStatus('stalemate');
    } else if (g.isDraw()) {
      setStatusMessage('Draw!');
      setGameStatus('draw');
    } else if (g.inCheck()) {
      setStatusMessage(g.turn() === 'w' ? '⚠ You are in check!' : '⚠ AI is in check!');
    } else {
      setStatusMessage(g.turn() === 'w' ? 'Your move' : 'AI is thinking...');
    }
  }, []);

  const makeAIMove = useCallback((currentGame: Chess) => {
    if (currentGame.isGameOver()) return;
    setIsThinking(true);
    setTimeout(() => {
      try {
        const depth = DIFFICULTY_DEPTH[difficulty];
        const gameCopy = new Chess(currentGame.fen());
        const best = getBestMove(gameCopy, depth);
        if (best) {
          const newGame = new Chess(currentGame.fen());
          const result = newGame.move(best);
          if (result) {
            setLastMove({ from: result.from, to: result.to });
            setGame(newGame);
            setFen(newGame.fen());
            setMoveHistory(prev => [...prev, result.san]);
            updateStatus(newGame);
          }
        }
      } catch (e) {
        console.error('AI error:', e);
      } finally {
        setIsThinking(false);
      }
    }, 50);
  }, [difficulty, updateStatus]);

  const onDrop = useCallback((from: string, to: string) => {
    if (gameStatus !== 'playing' || isThinking || game.turn() !== 'w') return false;
    const newGame = new Chess(game.fen());
    let result: Move | null = null;
    try { result = newGame.move({ from, to, promotion: 'q' }); } catch { return false; }
    if (!result) return false;
    setLastMove({ from, to });
    setGame(newGame);
    setFen(newGame.fen());
    setMoveHistory(prev => [...prev, result!.san]);
    updateStatus(newGame);
    if (!newGame.isGameOver()) makeAIMove(newGame);
    return true;
  }, [game, gameStatus, isThinking, makeAIMove, updateStatus]);

  const resetGame = useCallback(() => {
    const g = new Chess();
    setGame(g); setFen('start'); setGameStatus('playing');
    setMoveHistory([]); setStatusMessage('Your move');
    setLastMove(null); setIsThinking(false);
  }, []);

  const squareStyles: Record<string, React.CSSProperties> = {};
  if (lastMove) {
    squareStyles[lastMove.from] = { backgroundColor: 'rgba(139,92,246,0.35)' };
    squareStyles[lastMove.to]   = { backgroundColor: 'rgba(139,92,246,0.55)' };
  }

  const movePairs = moveHistory.reduce<string[][]>((acc, m, i) => {
    if (i % 2 === 0) acc.push([m]); else acc[acc.length - 1].push(m);
    return acc;
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#0a0118]" />;

  return (
    <main className="relative bg-[#0a0118] min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-white font-light">DOOM</Link>
          <div className="flex items-center gap-8">
            <Link href="/" className="font-mono text-sm text-purple-300/70 hover:text-purple-200 transition-colors">Home</Link>
            <Link href="/#projects" className="font-mono text-sm text-purple-300/70 hover:text-purple-200 transition-colors">Projects</Link>
            <Link href="/ocr" className="font-mono text-sm text-purple-300/70 hover:text-purple-200 transition-colors">OCR Tool</Link>
            <Link href="/chess" className="font-mono text-sm text-purple-300 border-b border-purple-500">Chess</Link>
            <Link href="/lab" className="font-mono text-sm text-purple-300/70 hover:text-purple-200 transition-colors">Lab</Link>
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
            <span className="inline-block px-4 py-1.5 glass rounded-full font-mono text-xs tracking-[0.2em] text-purple-300/60 uppercase border border-purple-500/20 mb-4">
              Minimax · Alpha-Beta Pruning
            </span>
            <h1 className="font-display text-5xl md:text-7xl text-gradient mb-4 font-light tracking-tight">Chess</h1>
            <p className="font-mono text-sm text-purple-300/60">You play White. The engine plays Black.</p>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">

            {/* Board */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 w-20 h-20 border-t-2 border-l-2 border-purple-500/30 rounded-tl-2xl pointer-events-none" />
              <div className="absolute -bottom-4 -right-4 w-20 h-20 border-b-2 border-r-2 border-pink-500/30 rounded-br-2xl pointer-events-none" />

              <div className="glass-strong rounded-2xl p-4 border border-purple-500/20 shadow-2xl">
                {/* Status bar */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full transition-colors ${isThinking ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
                    <span className="font-mono text-xs text-purple-300/60">
                      {isThinking ? 'Thinking...' : 'Ready'}
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={statusMessage}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className={`font-mono text-xs ${
                        gameStatus !== 'playing' ? 'text-pink-400' :
                        isThinking ? 'text-yellow-400/80' : 'text-purple-300/70'
                      }`}
                    >
                      {statusMessage}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {/* Thinking bar */}
                {isThinking && (
                  <div className="h-0.5 mb-4 rounded-full overflow-hidden bg-purple-900/30">
                    <motion.div
                      className="h-full w-1/2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                )}

                <Chessboard
                  position={fen}
                  onPieceDrop={onDrop}
                  boardOrientation="white"
                  customSquareStyles={squareStyles}
                  customDarkSquareStyle={{ backgroundColor: '#2d1b4e' }}
                  customLightSquareStyle={{ backgroundColor: '#1a0d33' }}
                  customBoardStyle={{ borderRadius: '12px', boxShadow: '0 0 40px rgba(139,92,246,0.2)' }}
                  animationDuration={150}
                  arePiecesDraggable={!isThinking && gameStatus === 'playing'}
                />
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-5"
            >
              {/* Difficulty */}
              <div className="glass-strong rounded-2xl p-5 border border-purple-500/20">
                <h3 className="font-mono text-xs text-purple-300/50 uppercase tracking-[0.2em] mb-4">Difficulty</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(DIFFICULTY_DEPTH) as Difficulty[]).map(d => (
                    <button
                      key={d}
                      onClick={() => { setDifficulty(d); resetGame(); }}
                      className={`px-3 py-2.5 rounded-xl font-mono text-xs transition-all border ${
                        difficulty === d
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                          : 'glass border-purple-500/10 text-purple-400/50 hover:border-purple-500/30 hover:text-purple-300'
                      }`}
                    >
                      <div className="font-medium">{DIFFICULTY_INFO[d].label}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">{DIFFICULTY_INFO[d].elo}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* New Game */}
              <div className="glass-strong rounded-2xl p-5 border border-purple-500/20">
                <button
                  onClick={resetGame}
                  className="w-full px-4 py-3 rounded-xl font-mono text-sm text-white btn-gradient flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  New Game
                </button>
              </div>

              {/* Move History */}
              <div className="glass-strong rounded-2xl p-5 border border-purple-500/20">
                <h3 className="font-mono text-xs text-purple-300/50 uppercase tracking-[0.2em] mb-4">Move History</h3>
                <div ref={historyRef} className="max-h-72 overflow-y-auto custom-scrollbar space-y-1">
                  {movePairs.length === 0 ? (
                    <p className="font-mono text-xs text-purple-400/30 text-center py-6">No moves yet</p>
                  ) : movePairs.map((pair, i) => (
                    <div key={i} className="grid grid-cols-[28px_1fr_1fr] gap-1 items-center">
                      <span className="font-mono text-[10px] text-purple-500/40">{i + 1}.</span>
                      <span className="font-mono text-xs text-purple-300/70 bg-purple-500/5 rounded px-2 py-0.5">{pair[0]}</span>
                      {pair[1] && <span className="font-mono text-xs text-purple-300/40 bg-purple-500/5 rounded px-2 py-0.5">{pair[1]}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Over */}
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
                  <button onClick={resetGame} className="px-6 py-2 rounded-full font-mono text-sm text-white btn-gradient">
                    Play Again
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(139,92,246,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.4); }
      `}</style>
    </main>
  );
}

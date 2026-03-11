'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type Square = string;

export default function ChessPage() {
  const [mounted, setMounted] = useState(false);
  const [game, setGame] = useState<Chess | null>(null);
  const [fen, setFen] = useState('start');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState(5);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'draw' | 'stalemate'>('playing');
  const [winner, setWinner] = useState<'white' | 'black' | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<{ white: string[]; black: string[] }>({
    white: [],
    black: [],
  });
  const [stockfish, setStockfish] = useState<Worker | null>(null);

  useEffect(() => {
    setMounted(true);
    const chessGame = new Chess();
    setGame(chessGame);

    // Initialize Stockfish
    if (typeof Worker !== 'undefined') {
      const sf = new Worker('https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js');
      sf.postMessage('uci');
      setStockfish(sf);

      return () => {
        sf.terminate();
      };
    }
  }, []);

  const updateCapturedPieces = useCallback((chessGame: Chess) => {
    const allPieces = 'ppppppppnnbbrrqqkPPPPPPPPNNBBRRQQK';
    const boardPieces = chessGame.board().flat().filter(Boolean).map((p) => p?.type + (p?.color === 'w' ? p.type.toUpperCase() : p?.type)).join('');
    
    const captured = { white: [] as string[], black: [] as string[] };
    
    for (const piece of allPieces) {
      const isWhite = piece === piece.toUpperCase();
      const pieceLower = piece.toLowerCase();
      
      const totalCount = allPieces.split('').filter(p => p.toLowerCase() === pieceLower).length / 2;
      const boardCount = boardPieces.split('').filter(p => p.toLowerCase() === pieceLower && (isWhite ? p === p.toUpperCase() : p === p.toLowerCase())).length;
      
      const capturedCount = totalCount - boardCount;
      
      for (let i = 0; i < capturedCount; i++) {
        if (isWhite) {
          captured.black.push(getPieceSymbol(pieceLower));
        } else {
          captured.white.push(getPieceSymbol(pieceLower));
        }
      }
    }
    
    setCapturedPieces(captured);
  }, []);

  const getPieceSymbol = (piece: string): string => {
    const symbols: { [key: string]: string } = {
      p: '♟',
      n: '♞',
      b: '♝',
      r: '♜',
      q: '♛',
      k: '♚',
    };
    return symbols[piece] || piece;
  };

  const checkGameStatus = useCallback((chessGame: Chess) => {
    if (chessGame.isCheckmate()) {
      setGameStatus('checkmate');
      setWinner(chessGame.turn() === 'w' ? 'black' : 'white');
    } else if (chessGame.isDraw()) {
      setGameStatus('draw');
    } else if (chessGame.isStalemate()) {
      setGameStatus('stalemate');
    } else {
      setGameStatus('playing');
    }
  }, []);

  const makeAiMove = useCallback(() => {
    if (!game || !stockfish || gameStatus !== 'playing') return;

    setIsAiThinking(true);

    const skillLevel = Math.min(20, Math.max(0, difficulty));

    stockfish.postMessage(`setoption name Skill Level value ${skillLevel}`);
    stockfish.postMessage(`position fen ${game.fen()}`);
    stockfish.postMessage(`go movetime ${1000 + difficulty * 100}`);

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      
      if (typeof message === 'string' && message.startsWith('bestmove')) {
        const moveMatch = message.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
        
        if (moveMatch && game) {
          const bestMove = moveMatch[1];
          const from = bestMove.substring(0, 2);
          const to = bestMove.substring(2, 4);
          const promotion = bestMove[4];

          try {
            const move = game.move({
              from,
              to,
              promotion: promotion || undefined,
            });

            if (move) {
              setFen(game.fen());
              setMoveHistory(game.history());
              updateCapturedPieces(game);
              checkGameStatus(game);
            }
          } catch (error) {
            console.error('Invalid AI move:', error);
          }
        }

        setIsAiThinking(false);
        stockfish.removeEventListener('message', handleMessage);
      }
    };

    stockfish.addEventListener('message', handleMessage);
  }, [game, stockfish, difficulty, gameStatus, updateCapturedPieces, checkGameStatus]);

  const onDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square) => {
      if (!game || isAiThinking || gameStatus !== 'playing') return false;

      try {
        const move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q',
        });

        if (move === null) return false;

        setFen(game.fen());
        setMoveHistory(game.history());
        updateCapturedPieces(game);
        checkGameStatus(game);

        // AI responds after a short delay
        setTimeout(() => {
          makeAiMove();
        }, 250);

        return true;
      } catch (error) {
        return false;
      }
    },
    [game, isAiThinking, makeAiMove, gameStatus, updateCapturedPieces, checkGameStatus]
  );

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setMoveHistory([]);
    setGameStatus('playing');
    setWinner(null);
    setCapturedPieces({ white: [], black: [] });
    setIsAiThinking(false);
  };

  const undoMove = () => {
    if (!game || moveHistory.length < 2) return;

    game.undo();
    game.undo();
    setFen(game.fen());
    setMoveHistory(game.history());
    updateCapturedPieces(game);
    setGameStatus('playing');
    setWinner(null);
  };

  if (!mounted || !game) {
    return <div className="min-h-screen bg-[#0a0118]" />;
  }

  return (
    <main className="relative bg-[#0a0118] min-h-screen">
      {/* Navigation */}
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
                className="font-mono text-sm text-purple-300/70 hover:text-purple-200 transition-colors"
              >
                OCR Tool
              </Link>
              <Link
                href="/chess"
                className="font-mono text-sm text-purple-300 border-b border-purple-500"
              >
                Chess
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-5xl md:text-7xl text-gradient mb-6 font-light tracking-tight">
              Chess vs AI
            </h1>
            <p className="font-mono text-sm text-purple-300/60 max-w-2xl mx-auto">
              Challenge yourself against Stockfish, one of the world's strongest chess engines.
              Adjust difficulty and test your skills.
            </p>
          </motion.div>

          {/* Game Board + Controls */}
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Chessboard */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="relative">
                {/* Decorative corners */}
                <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-purple-500/40 rounded-tl-2xl pointer-events-none z-10" />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-pink-500/40 rounded-br-2xl pointer-events-none z-10" />
                
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500/60 rounded-full blur-md pointer-events-none z-10" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-pink-500/60 rounded-full blur-md pointer-events-none z-10" />

                <div className="glass-strong rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-2xl glow-purple p-4 md:p-6">
                  <Chessboard
                    position={fen}
                    onPieceDrop={onDrop}
                    boardWidth={Math.min(600, typeof window !== 'undefined' ? window.innerWidth - 100 : 600)}
                    customBoardStyle={{
                      borderRadius: '8px',
                      boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
                    }}
                    customDarkSquareStyle={{ backgroundColor: '#8B5CF6' }}
                    customLightSquareStyle={{ backgroundColor: '#C4B5FD' }}
                  />
                  
                  {isAiThinking && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-center"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        <span className="font-mono text-sm text-purple-300">AI is thinking...</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Captured Pieces */}
              <div className="mt-6 glass-strong rounded-xl p-4 border border-purple-500/20">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-mono text-xs text-purple-400/60 mb-2">White Captured:</p>
                    <div className="flex flex-wrap gap-1">
                      {capturedPieces.white.map((piece, index) => (
                        <span key={index} className="text-2xl opacity-60">
                          {piece}
                        </span>
                      ))}
                      {capturedPieces.white.length === 0 && (
                        <span className="font-mono text-xs text-purple-400/30">None</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-purple-400/60 mb-2">Black Captured:</p>
                    <div className="flex flex-wrap gap-1">
                      {capturedPieces.black.map((piece, index) => (
                        <span key={index} className="text-2xl opacity-60">
                          {piece}
                        </span>
                      ))}
                      {capturedPieces.black.length === 0 && (
                        <span className="font-mono text-xs text-purple-400/30">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Controls Panel */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Difficulty Slider */}
              <div className="glass-strong rounded-xl p-6 border border-purple-500/20">
                <h3 className="font-mono text-sm text-purple-300 mb-4">AI Difficulty</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-purple-400/60">Level:</span>
                    <span className="font-mono text-lg text-gradient">{difficulty}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={difficulty}
                    onChange={(e) => setDifficulty(parseInt(e.target.value))}
                    className="w-full h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-pink-500 [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between font-mono text-xs text-purple-400/40">
                    <span>Beginner</span>
                    <span>Master</span>
                  </div>
                </div>
              </div>

              {/* Game Status */}
              <AnimatePresence>
                {gameStatus !== 'playing' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-strong rounded-xl p-6 border-2 border-purple-500/40 glow-purple"
                  >
                    <h3 className="font-display text-2xl text-gradient mb-2">
                      {gameStatus === 'checkmate' && `${winner === 'white' ? 'White' : 'Black'} Wins!`}
                      {gameStatus === 'draw' && 'Draw!'}
                      {gameStatus === 'stalemate' && 'Stalemate!'}
                    </h3>
                    <p className="font-mono text-sm text-purple-300/60">
                      {gameStatus === 'checkmate' && 'Checkmate! Game Over.'}
                      {gameStatus === 'draw' && 'Game ended in a draw.'}
                      {gameStatus === 'stalemate' && 'No legal moves available.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={undoMove}
                  disabled={moveHistory.length < 2 || isAiThinking}
                  className="w-full px-6 py-3 glass-strong rounded-full font-mono text-sm text-purple-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-purple-500/30 hover:border-purple-500/60"
                >
                  ↶ Undo Move
                </button>
                
                <button
                  onClick={resetGame}
                  disabled={isAiThinking}
                  className="w-full px-6 py-3 btn-gradient rounded-full font-mono text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⟳ New Game
                </button>
              </div>

              {/* Move History */}
              <div className="glass-strong rounded-xl p-6 border border-purple-500/20 max-h-96 overflow-y-auto custom-scrollbar">
                <h3 className="font-mono text-sm text-purple-300 mb-4">Move History</h3>
                {moveHistory.length > 0 ? (
                  <div className="space-y-1">
                    {moveHistory.map((move, index) => (
                      <div
                        key={index}
                        className="font-mono text-xs text-purple-300/60 flex items-center gap-2"
                      >
                        <span className="text-purple-500/50">{Math.floor(index / 2) + 1}.</span>
                        <span>{move}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-xs text-purple-400/30">No moves yet</p>
                )}
              </div>

              {/* Instructions */}
              <div className="glass rounded-xl p-4 border border-purple-500/10">
                <h4 className="font-mono text-xs text-purple-400/60 mb-2">How to Play:</h4>
                <ul className="space-y-1 font-mono text-xs text-purple-300/50">
                  <li>• Drag pieces to move</li>
                  <li>• You play as White</li>
                  <li>• AI plays as Black</li>
                  <li>• Adjust difficulty anytime</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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

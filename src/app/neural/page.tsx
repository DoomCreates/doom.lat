'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SubNav from '@/components/SubNav';

const ease = [0.16, 1, 0.3, 1] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type Dataset    = 'xor' | 'spiral' | 'circles' | 'linear';
type Activation = 'relu' | 'tanh' | 'sigmoid';

interface Config {
  dataset:    Dataset;
  layers:     number[];    // neurons per hidden layer
  activation: Activation;
  lr:         number;
  batchSize:  number;
}

interface TrainState {
  epoch:    number;
  loss:     number;
  accuracy: number;
  running:  boolean;
}

interface LossPoint { epoch: number; loss: number; }

// ─── Dataset generators ───────────────────────────────────────────────────────

function makeXOR(n = 200): [number[][], number[]] {
  const xs: number[][] = [], ys: number[] = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    xs.push([x, y]);
    ys.push((x > 0) !== (y > 0) ? 1 : 0);
  }
  return [xs, ys];
}

function makeSpiral(n = 200): [number[][], number[]] {
  const xs: number[][] = [], ys: number[] = [];
  const pts = n / 2;
  for (let c = 0; c < 2; c++) {
    for (let i = 0; i < pts; i++) {
      const r = (i / pts) * 0.95 + 0.05;
      const t = (i / pts) * 4 * Math.PI + (c * Math.PI) + (Math.random() * 0.4);
      xs.push([r * Math.sin(t), r * Math.cos(t)]);
      ys.push(c);
    }
  }
  return [xs, ys];
}

function makeCircles(n = 200): [number[][], number[]] {
  const xs: number[][] = [], ys: number[] = [];
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const inner = Math.random() < 0.5;
    const r = inner ? Math.random() * 0.4 + 0.05 : Math.random() * 0.35 + 0.6;
    const noise = (Math.random() - 0.5) * 0.08;
    xs.push([(r + noise) * Math.cos(angle), (r + noise) * Math.sin(angle)]);
    ys.push(inner ? 1 : 0);
  }
  return [xs, ys];
}

function makeLinear(n = 200): [number[][], number[]] {
  const xs: number[][] = [], ys: number[] = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    xs.push([x, y]);
    ys.push(y > x * 0.6 + (Math.random() - 0.5) * 0.2 ? 1 : 0);
  }
  return [xs, ys];
}

const GENERATORS: Record<Dataset, () => [number[][], number[]]> = {
  xor:     makeXOR,
  spiral:  makeSpiral,
  circles: makeCircles,
  linear:  makeLinear,
};

// ─── Decision boundary canvas ─────────────────────────────────────────────────

const GRID = 64; // resolution — 64×64 grid of probes

async function renderBoundary(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  canvas: HTMLCanvasElement,
  dataXs: number[][],
  dataYs: number[],
  tf: typeof import('@tensorflow/tfjs'),
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Build grid of probe points
  const probes: number[][] = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      probes.push([
        (col / (GRID - 1)) * 2 - 1,
        (row / (GRID - 1)) * 2 - 1,
      ]);
    }
  }

  // Get predictions
  const probeTensor = tf.tensor2d(probes);
  const predTensor  = model.predict(probeTensor) as import('@tensorflow/tfjs').Tensor;
  const preds       = await predTensor.data() as Float32Array;
  probeTensor.dispose(); predTensor.dispose();

  // Draw cells
  const cellW = W / GRID, cellH = H / GRID;
  for (let i = 0; i < GRID * GRID; i++) {
    const p   = preds[i];
    const row = Math.floor(i / GRID);
    const col = i % GRID;
    // Blue for class 0, orange-red for class 1
    const r = Math.round(p * 220);
    const b = Math.round((1 - p) * 220);
    ctx.fillStyle = `rgba(${r},${Math.round(Math.min(r, b) * 0.3)},${b},0.55)`;
    ctx.fillRect(col * cellW, row * cellH, cellW + 1, cellH + 1);
  }

  // Draw data points
  const ptR = Math.max(3, W / 80);
  dataXs.forEach(([x, y], idx) => {
    const px = ((x + 1) / 2) * W;
    const py = ((y + 1) / 2) * H;
    ctx.beginPath();
    ctx.arc(px, py, ptR, 0, Math.PI * 2);
    ctx.fillStyle   = dataYs[idx] === 1 ? 'rgba(255,120,80,0.9)' : 'rgba(80,140,255,0.9)';
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth   = 0.8;
    ctx.fill();
    ctx.stroke();
  });
}

// ─── Architecture SVG ─────────────────────────────────────────────────────────

interface ArchProps {
  config:   Config;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  weights:  any[];           // tf.LayerVariable[][]
  epoch:    number;
}

function ArchDiagram({ config, weights, epoch }: ArchProps) {
  const layers = [2, ...config.layers, 1];
  const maxN   = Math.max(...layers);
  const W      = 360;
  const H      = 280;
  const padX   = 36;
  const padY   = 24;
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;
  const layerX  = (i: number) => padX + (i / (layers.length - 1)) * usableW;
  const neuronY = (i: number, total: number) => {
    const spacing = usableH / (total + 1);
    return padY + spacing * (i + 1);
  };

  // Extract weight magnitudes if available
  const getWeight = (li: number, ni: number, nj: number): number => {
    if (!weights || !weights[li]) return 0;
    try {
      const w = weights[li];
      if (!w || !w[0]) return 0;
      const data = w[0] as number[][];
      if (!data[ni] || data[ni][nj] === undefined) return 0;
      return Math.tanh(Math.abs(data[ni][nj]) * 2);
    } catch { return 0; }
  };

  const getSign = (li: number, ni: number, nj: number): number => {
    if (!weights || !weights[li]) return 1;
    try {
      const w = weights[li];
      if (!w || !w[0]) return 1;
      const data = w[0] as number[][];
      if (!data[ni] || data[ni][nj] === undefined) return 1;
      return data[ni][nj] >= 0 ? 1 : -1;
    } catch { return 1; }
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" key={epoch}>
      {/* Connections */}
      {layers.slice(0, -1).map((fromN, li) =>
        Array.from({ length: fromN }).map((_, ni) =>
          Array.from({ length: layers[li + 1] }).map((__, nj) => {
            const x1 = layerX(li);
            const y1 = neuronY(ni, fromN);
            const x2 = layerX(li + 1);
            const y2 = neuronY(nj, layers[li + 1]);
            const mag  = getWeight(li, ni, nj);
            const sign = getSign(li, ni, nj);
            const alpha = Math.max(0.04, mag * 0.7);
            const color = sign > 0
              ? `rgba(120,180,255,${alpha})`
              : `rgba(255,120,80,${alpha})`;
            return (
              <line key={`${li}-${ni}-${nj}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={color}
                strokeWidth={Math.max(0.4, mag * 2)}
              />
            );
          })
        )
      )}

      {/* Neurons */}
      {layers.map((n, li) =>
        Array.from({ length: n }).map((_, ni) => {
          const x    = layerX(li);
          const y    = neuronY(ni, n);
          const isInput  = li === 0;
          const isOutput = li === layers.length - 1;
          return (
            <g key={`n-${li}-${ni}`}>
              <circle
                cx={x} cy={y}
                r={isInput || isOutput ? 9 : 7}
                fill={isInput ? 'rgba(80,140,255,0.25)' : isOutput ? 'rgba(255,120,80,0.25)' : 'rgba(255,255,255,0.08)'}
                stroke={isInput ? 'rgba(80,140,255,0.6)' : isOutput ? 'rgba(255,120,80,0.6)' : 'rgba(255,255,255,0.25)'}
                strokeWidth={0.8}
              />
              {isInput && (
                <text x={x} y={y + 3.5} textAnchor="middle"
                  className="fill-white/50 font-mono" fontSize={6}>
                  {ni === 0 ? 'x₁' : 'x₂'}
                </text>
              )}
              {isOutput && (
                <text x={x} y={y + 3.5} textAnchor="middle"
                  className="fill-white/50 font-mono" fontSize={6}>
                  ŷ
                </text>
              )}
            </g>
          );
        })
      )}

      {/* Layer labels */}
      {layers.map((n, li) => {
        const label = li === 0 ? 'Input' : li === layers.length - 1 ? 'Output' : `H${li}`;
        return (
          <text key={`l-${li}`} x={layerX(li)} y={H - 6} textAnchor="middle"
            fontSize={7} className="fill-white/20 font-mono">
            {label} ({n})
          </text>
        );
      })}
    </svg>
  );
}

// ─── Loss chart (simple canvas-based, no recharts needed) ─────────────────────

function LossChart({ points }: { points: LossPoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const maxLoss = Math.max(...points.map(p => p.loss), 0.01);
    const minLoss = Math.min(...points.map(p => p.loss));
    const padX = 4, padY = 4;

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padY + ((H - padY * 2) * i) / 4;
      ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(W - padX, y); ctx.stroke();
    }

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    points.forEach((pt, i) => {
      const x = padX + ((W - padX * 2) * i) / (points.length - 1);
      const y = H - padY - ((pt.loss - minLoss) / (maxLoss - minLoss + 1e-8)) * (H - padY * 2);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [points]);

  return (
    <canvas ref={canvasRef} width={320} height={80}
      className="w-full h-full" style={{ imageRendering: 'auto' }} />
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: Config = {
  dataset:    'spiral',
  layers:     [6, 4],
  activation: 'tanh',
  lr:         0.03,
  batchSize:  32,
};

export default function NeuralPage() {
  const [config, setConfig]           = useState<Config>(DEFAULT_CONFIG);
  const [trainState, setTrainState]   = useState<TrainState>({ epoch: 0, loss: 0, accuracy: 0, running: false });
  const [lossHistory, setLossHistory] = useState<LossPoint[]>([]);
  const [dataXs, setDataXs]           = useState<number[][]>([]);
  const [dataYs, setDataYs]           = useState<number[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [archWeights, setArchWeights] = useState<any[]>([]);
  const [tfLoaded, setTfLoaded]       = useState(false);
  const [mounted, setMounted]         = useState(false);

  const modelRef   = useRef<import('@tensorflow/tfjs').Sequential | null>(null);
  const tfRef      = useRef<typeof import('@tensorflow/tfjs') | null>(null);
  const runningRef = useRef(false);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const configRef  = useRef(config);

  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { setMounted(true); }, []);

  // Load TF.js once
  useEffect(() => {
    import('@tensorflow/tfjs').then(tf => {
      tfRef.current = tf;
      setTfLoaded(true);
    });
  }, []);

  // Generate dataset
  const generateData = useCallback(() => {
    const [xs, ys] = GENERATORS[configRef.current.dataset]();
    setDataXs(xs); setDataYs(ys);
    return { xs, ys };
  }, []);

  // Build model from config
  const buildModel = useCallback(() => {
    const tf  = tfRef.current;
    if (!tf) return null;
    const cfg = configRef.current;
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [2], units: cfg.layers[0], activation: cfg.activation }));
    for (let i = 1; i < cfg.layers.length; i++) {
      model.add(tf.layers.dense({ units: cfg.layers[i], activation: cfg.activation }));
    }
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
    model.compile({
      optimizer: tf.train.adam(cfg.lr),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });
    return model;
  }, []);

  // Extract weight matrices for architecture diagram
  const extractWeights = useCallback((model: import('@tensorflow/tfjs').Sequential) => {
    const tf = tfRef.current;
    if (!tf) return [];
    return model.layers.map(layer => {
      try {
        const w = layer.getWeights();
        if (!w.length) return null;
        const data = w[0].arraySync() as number[][];
        return [data];
      } catch { return null; }
    }).filter(Boolean);
  }, []);

  // Stop training
  const stop = useCallback(() => {
    runningRef.current = false;
    setTrainState(s => ({ ...s, running: false }));
  }, []);

  // Start / restart training
  const start = useCallback(async () => {
    const tf = tfRef.current;
    if (!tf) return;

    // Stop any running loop
    runningRef.current = false;
    await new Promise(r => setTimeout(r, 60));

    setLossHistory([]);
    setTrainState({ epoch: 0, loss: 0, accuracy: 0, running: true });
    runningRef.current = true;

    const { xs, ys } = generateData();
    const model = buildModel();
    if (!model) return;
    modelRef.current = model;

    const xTensor = tf.tensor2d(xs);
    const yTensor = tf.tensor2d(ys.map(y => [y]));

    let epoch = 0;
    const MAX_EPOCHS = 600;

    const step = async () => {
      if (!runningRef.current) {
        xTensor.dispose(); yTensor.dispose();
        return;
      }

      const h = await model.fit(xTensor, yTensor, {
        epochs: 1,
        batchSize: configRef.current.batchSize,
        verbose: 0,
      });

      epoch++;
      const loss     = h.history.loss[0] as number;
      const accuracy = (h.history.acc?.[0] ?? h.history.accuracy?.[0] ?? 0) as number;

      setTrainState({ epoch, loss, accuracy, running: true });
      setLossHistory(prev => [...prev.slice(-199), { epoch, loss }]);

      // Update architecture diagram every 20 epochs
      if (epoch % 20 === 0) {
        setArchWeights(extractWeights(model));
      }

      // Render boundary every 10 epochs
      if (epoch % 10 === 0 && canvasRef.current) {
        await renderBoundary(model, canvasRef.current, xs, ys, tf);
      }

      if (epoch < MAX_EPOCHS && runningRef.current) {
        setTimeout(step, 10);
      } else {
        runningRef.current = false;
        setTrainState(s => ({ ...s, running: false }));
        xTensor.dispose(); yTensor.dispose();
      }
    };

    step();
  }, [generateData, buildModel, extractWeights]);

  // Update config helper
  const update = <K extends keyof Config>(key: K, val: Config[K]) => {
    setConfig(prev => ({ ...prev, [key]: val }));
    stop();
  };

  const setLayer = (i: number, val: number) => {
    const next = [...config.layers];
    next[i] = val;
    update('layers', next);
  };

  const addLayer = () => {
    if (config.layers.length < 4) update('layers', [...config.layers, 4]);
  };

  const removeLayer = () => {
    if (config.layers.length > 1) update('layers', config.layers.slice(0, -1));
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const { epoch, loss, accuracy, running } = trainState;

  return (
    <main className="bg-black min-h-screen">
      <SubNav active="Neural" />

      <div className="pt-14">
        {/* Page header */}
        <div className="border-b border-white/8 px-6 md:px-12 lg:px-20 py-12 md:py-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease }}>
            <p className="font-mono text-[10px] text-white/25 tracking-[0.3em] uppercase mb-4">
              TensorFlow.js &nbsp;·&nbsp; Runs entirely in your browser
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-light tracking-tight text-white leading-tight">
              Neural Network
            </h1>
            <p className="font-mono text-xs text-white/30 mt-4 max-w-lg leading-relaxed">
              Configure and train a neural network live. Watch it learn decision boundaries in real-time.
            </p>
          </motion.div>
        </div>

        {!tfLoaded ? (
          <div className="flex items-center justify-center py-32">
            <motion.p
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="font-mono text-xs text-white/30"
            >
              Loading TensorFlow.js…
            </motion.p>
          </div>
        ) : (
          <div className="px-6 md:px-12 lg:px-20 py-10">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 xl:gap-12">

              {/* ── Left column: controls + stats ────────────────── */}
              <div className="space-y-8">

                {/* Config panel */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.1 }}
                  className="border border-white/8 p-6"
                >
                  <p className="font-mono text-[10px] text-white/25 uppercase tracking-[0.25em] mb-6">Configuration</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    {/* Dataset */}
                    <div>
                      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-3">Dataset</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(['xor', 'spiral', 'circles', 'linear'] as Dataset[]).map(d => (
                          <button key={d} onClick={() => update('dataset', d)}
                            className={`py-2 font-mono text-xs border capitalize transition-all ${
                              config.dataset === d
                                ? 'border-white/30 text-white bg-white/6'
                                : 'border-white/8 text-white/30 hover:border-white/18'
                            }`}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Activation */}
                    <div>
                      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-3">Activation</p>
                      <div className="flex flex-col gap-2">
                        {(['relu', 'tanh', 'sigmoid'] as Activation[]).map(a => (
                          <button key={a} onClick={() => update('activation', a)}
                            className={`py-2 font-mono text-xs border uppercase transition-all ${
                              config.activation === a
                                ? 'border-white/30 text-white bg-white/6'
                                : 'border-white/8 text-white/30 hover:border-white/18'
                            }`}>
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Layers */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">Hidden Layers</p>
                        <div className="flex gap-2">
                          <button onClick={removeLayer} disabled={config.layers.length <= 1}
                            className="w-6 h-6 border border-white/8 font-mono text-xs text-white/30 hover:text-white hover:border-white/25 transition-all disabled:opacity-20">
                            −
                          </button>
                          <button onClick={addLayer} disabled={config.layers.length >= 4}
                            className="w-6 h-6 border border-white/8 font-mono text-xs text-white/30 hover:text-white hover:border-white/25 transition-all disabled:opacity-20">
                            +
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {config.layers.map((n, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <span className="font-mono text-[10px] text-white/25 w-14 shrink-0">Layer {i + 1}: {n}</span>
                            <input type="range" min={2} max={8} value={n}
                              onChange={e => setLayer(i, +e.target.value)}
                              className="flex-1 accent-white h-px" />
                            <span className="font-mono text-[10px] text-white/20 w-4 text-right">{n}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Learning rate */}
                    <div>
                      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-3">
                        Learning Rate: {config.lr}
                      </p>
                      <input type="range" min={0.001} max={0.1} step={0.001} value={config.lr}
                        onChange={e => update('lr', +e.target.value)}
                        className="w-full accent-white h-px" />
                      <div className="flex justify-between mt-1">
                        <span className="font-mono text-[9px] text-white/18">0.001</span>
                        <span className="font-mono text-[9px] text-white/18">0.1</span>
                      </div>
                    </div>

                    {/* Batch size */}
                    <div>
                      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-3">
                        Batch Size: {config.batchSize}
                      </p>
                      <input type="range" min={8} max={128} step={8} value={config.batchSize}
                        onChange={e => update('batchSize', +e.target.value)}
                        className="w-full accent-white h-px" />
                      <div className="flex justify-between mt-1">
                        <span className="font-mono text-[9px] text-white/18">8</span>
                        <span className="font-mono text-[9px] text-white/18">128</span>
                      </div>
                    </div>
                  </div>

                  {/* Train / Stop button */}
                  <div className="mt-8 flex gap-3">
                    {running ? (
                      <button onClick={stop}
                        className="px-8 py-3 border border-white/18 font-mono text-sm text-white/60 hover:text-white hover:border-white/35 transition-all">
                        Stop
                      </button>
                    ) : (
                      <button onClick={start}
                        className="px-8 py-3 btn-gradient font-mono text-sm">
                        {epoch > 0 ? 'Restart' : 'Train'}
                      </button>
                    )}
                    {epoch > 0 && !running && (
                      <button onClick={start}
                        className="px-6 py-3 border border-white/8 font-mono text-xs text-white/30 hover:text-white hover:border-white/20 transition-all">
                        Resume
                      </button>
                    )}
                  </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.2 }}
                  className="border border-white/8 p-6"
                >
                  <p className="font-mono text-[10px] text-white/25 uppercase tracking-[0.25em] mb-6">Live Metrics</p>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-2">Epoch</p>
                      <p className="font-display text-3xl font-light text-white tabular-nums">{epoch}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-2">Loss</p>
                      <p className="font-display text-3xl font-light text-white tabular-nums">
                        {loss > 0 ? loss.toFixed(3) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-2">Accuracy</p>
                      <p className="font-display text-3xl font-light text-white tabular-nums">
                        {accuracy > 0 ? `${(accuracy * 100).toFixed(0)}%` : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Loss curve */}
                  <div>
                    <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest mb-2">Loss Curve</p>
                    <div className="h-20 border border-white/6 bg-black overflow-hidden">
                      {lossHistory.length > 1
                        ? <LossChart points={lossHistory} />
                        : <div className="h-full flex items-center justify-center">
                            <p className="font-mono text-[10px] text-white/15">Train to see loss curve</p>
                          </div>
                      }
                    </div>
                  </div>

                  {/* Training indicator */}
                  {running && (
                    <div className="mt-4 h-px bg-white/6 overflow-hidden">
                      <motion.div
                        className="h-full w-1/4 bg-white/40"
                        animate={{ x: ['-100%', '500%'] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                  )}
                </motion.div>
              </div>

              {/* ── Right column: visualizations ─────────────────── */}
              <div className="space-y-6">

                {/* Decision boundary */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.15 }}
                  className="border border-white/8 p-5"
                >
                  <p className="font-mono text-[10px] text-white/25 uppercase tracking-[0.25em] mb-4">
                    Decision Boundary
                  </p>
                  <div className="aspect-square relative border border-white/6 bg-[#050505] overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={320}
                      height={320}
                      className="w-full h-full"
                      style={{ imageRendering: 'auto' }}
                    />
                    {epoch === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="font-mono text-[10px] text-white/20">Press Train to begin</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-6 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[rgba(80,140,255,0.9)] border border-black/50" />
                      <span className="font-mono text-[10px] text-white/25">Class 0</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[rgba(255,120,80,0.9)] border border-black/50" />
                      <span className="font-mono text-[10px] text-white/25">Class 1</span>
                    </div>
                  </div>
                </motion.div>

                {/* Architecture diagram */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.25 }}
                  className="border border-white/8 p-5"
                >
                  <p className="font-mono text-[10px] text-white/25 uppercase tracking-[0.25em] mb-4">
                    Network Architecture
                    <span className="ml-3 text-white/15">
                      — connection brightness = weight magnitude
                    </span>
                  </p>
                  <div className="h-48 bg-[#050505] border border-white/6 flex items-center justify-center">
                    <ArchDiagram config={config} weights={archWeights} epoch={epoch} />
                  </div>
                  <div className="flex gap-6 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-px bg-[rgba(120,180,255,0.7)]" />
                      <span className="font-mono text-[10px] text-white/25">Positive weight</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-px bg-[rgba(255,120,80,0.7)]" />
                      <span className="font-mono text-[10px] text-white/25">Negative weight</span>
                    </div>
                  </div>
                </motion.div>

                {/* Dataset insight */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.3 }}
                  className="border border-white/6 p-5"
                >
                  <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest mb-3">About this dataset</p>
                  <p className="font-mono text-xs text-white/35 leading-relaxed">
                    {config.dataset === 'xor' && 'XOR requires at least one hidden layer — a single linear boundary cannot separate it. Watch how the network learns two overlapping regions.'}
                    {config.dataset === 'spiral' && 'Two interleaved spirals. One of the classic non-linear classification challenges. Requires deeper networks or more neurons to fully separate.'}
                    {config.dataset === 'circles' && 'Concentric circles — the inner cluster is one class, the outer ring is another. Requires a non-linear boundary (no straight line can separate them).'}
                    {config.dataset === 'linear' && 'Linearly separable with slight noise. Even a single perceptron can learn this. A hidden layer is unnecessary — watch how quickly it converges.'}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

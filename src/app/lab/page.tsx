'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToolId =
  | 'hash'
  | 'password'
  | 'qr'
  | 'url'
  | 'encrypt'
  | 'regex'
  | 'json'
  | 'jwt'
  | 'base64';

interface Tool {
  id: ToolId;
  label: string;
  description: string;
  icon: string;
  accent: string;
}

// ─── Tool Registry ────────────────────────────────────────────────────────────

const TOOLS: Tool[] = [
  { id: 'hash',     label: 'Hash Generator',     description: 'SHA-256 / SHA-1 / MD5 style hashing via Web Crypto', icon: '#',  accent: 'from-violet-500 to-purple-600'  },
  { id: 'password', label: 'Password Generator',  description: 'Cryptographically random passwords with custom rules',  icon: '🔑', accent: 'from-pink-500 to-rose-600'     },
  { id: 'qr',       label: 'QR Generator',        description: 'Generate a QR code for any URL or text string',         icon: '▦',  accent: 'from-cyan-500 to-blue-600'    },
  { id: 'url',      label: 'URL Parser',          description: 'Dissect any URL into its components',                   icon: '⛓', accent: 'from-teal-500 to-emerald-600' },
  { id: 'encrypt',  label: 'Text Encrypter',      description: 'AES-GCM encryption with user-set passphrase',           icon: '🔐', accent: 'from-amber-500 to-orange-600' },
  { id: 'regex',    label: 'Regex Tester',        description: 'Live regex matching with match highlights',             icon: '.*', accent: 'from-lime-500 to-green-600'   },
  { id: 'json',     label: 'JSON Formatter',      description: 'Prettify, minify and validate JSON instantly',          icon: '{}', accent: 'from-sky-500 to-indigo-600'   },
  { id: 'jwt',      label: 'JWT Decoder',         description: 'Decode and inspect JWT header, payload & signature',    icon: '🪙', accent: 'from-fuchsia-500 to-pink-600' },
  { id: 'base64',   label: 'Base64 Encoder',      description: 'Encode and decode Base64 strings instantly',           icon: '64', accent: 'from-orange-500 to-red-600'   },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha1(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple MD5 (pure JS, not crypto-secure — just for display)
function md5(input: string): string {
  function safeAdd(x: number, y: number) { const lsw = (x & 0xffff) + (y & 0xffff); return ((((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xffff)) >>> 0; }
  function bitRotateLeft(num: number, cnt: number) { return ((num << cnt) | (num >>> (32 - cnt))) >>> 0; }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & c) | (~b & d), a, b, x, s, t); }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }
  const str = unescape(encodeURIComponent(input));
  const x: number[] = [];
  for (let i = 0; i < str.length * 8; i += 8) x[i >> 5] = (x[i >> 5] || 0) | (str.charCodeAt(i / 8) << (i % 32));
  const len = str.length * 8;
  x[len >> 5] = (x[len >> 5] || 0) | (0x80 << (len % 32));
  x[(((len + 64) >>> 9) << 4) + 14] = len;
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < x.length; i += 16) {
    const [oa, ob, oc, od] = [a, b, c, d];
    a = md5ff(a,b,c,d,x[i+0]||0,7,-680876936);  d = md5ff(d,a,b,c,x[i+1]||0,12,-389564586); c = md5ff(c,d,a,b,x[i+2]||0,17,606105819);  b = md5ff(b,c,d,a,x[i+3]||0,22,-1044525330);
    a = md5ff(a,b,c,d,x[i+4]||0,7,-176418897);  d = md5ff(d,a,b,c,x[i+5]||0,12,1200080426);  c = md5ff(c,d,a,b,x[i+6]||0,17,-1473231341); b = md5ff(b,c,d,a,x[i+7]||0,22,-45705983);
    a = md5ff(a,b,c,d,x[i+8]||0,7,1770035416);  d = md5ff(d,a,b,c,x[i+9]||0,12,-1958414417); c = md5ff(c,d,a,b,x[i+10]||0,17,-42063);     b = md5ff(b,c,d,a,x[i+11]||0,22,-1990404162);
    a = md5ff(a,b,c,d,x[i+12]||0,7,1804603682); d = md5ff(d,a,b,c,x[i+13]||0,12,-40341101);  c = md5ff(c,d,a,b,x[i+14]||0,17,-1502002290);b = md5ff(b,c,d,a,x[i+15]||0,22,1236535329);
    a = md5gg(a,b,c,d,x[i+1]||0,5,-165796510);  d = md5gg(d,a,b,c,x[i+6]||0,9,-1069501632); c = md5gg(c,d,a,b,x[i+11]||0,14,643717713);  b = md5gg(b,c,d,a,x[i+0]||0,20,-373897302);
    a = md5gg(a,b,c,d,x[i+5]||0,5,-701558691);  d = md5gg(d,a,b,c,x[i+10]||0,9,38016083);   c = md5gg(c,d,a,b,x[i+15]||0,14,-660478335); b = md5gg(b,c,d,a,x[i+4]||0,20,-405537848);
    a = md5gg(a,b,c,d,x[i+9]||0,5,568446438);   d = md5gg(d,a,b,c,x[i+14]||0,9,-1019803690);c = md5gg(c,d,a,b,x[i+3]||0,14,-187363961);  b = md5gg(b,c,d,a,x[i+8]||0,20,1163531501);
    a = md5gg(a,b,c,d,x[i+13]||0,5,-1444681467);d = md5gg(d,a,b,c,x[i+2]||0,9,-51403784);   c = md5gg(c,d,a,b,x[i+7]||0,14,1735328473);  b = md5gg(b,c,d,a,x[i+12]||0,20,-1926607734);
    a = md5hh(a,b,c,d,x[i+5]||0,4,-378558);     d = md5hh(d,a,b,c,x[i+8]||0,11,-2022574463);c = md5hh(c,d,a,b,x[i+11]||0,16,1839030562); b = md5hh(b,c,d,a,x[i+14]||0,23,-35309556);
    a = md5hh(a,b,c,d,x[i+1]||0,4,-1530992060); d = md5hh(d,a,b,c,x[i+4]||0,11,1272893353);  c = md5hh(c,d,a,b,x[i+7]||0,16,-155497632);  b = md5hh(b,c,d,a,x[i+10]||0,23,-1094730640);
    a = md5hh(a,b,c,d,x[i+13]||0,4,681279174);  d = md5hh(d,a,b,c,x[i+0]||0,11,-358537222);  c = md5hh(c,d,a,b,x[i+3]||0,16,-722521979);  b = md5hh(b,c,d,a,x[i+6]||0,23,76029189);
    a = md5hh(a,b,c,d,x[i+9]||0,4,-640364487);  d = md5hh(d,a,b,c,x[i+12]||0,11,-421815835); c = md5hh(c,d,a,b,x[i+15]||0,16,530742520);  b = md5hh(b,c,d,a,x[i+2]||0,23,-995338651);
    a = md5ii(a,b,c,d,x[i+0]||0,6,-198630844);  d = md5ii(d,a,b,c,x[i+7]||0,10,1126891415);  c = md5ii(c,d,a,b,x[i+14]||0,15,-1416354905);b = md5ii(b,c,d,a,x[i+5]||0,21,-57434055);
    a = md5ii(a,b,c,d,x[i+12]||0,6,1700485571); d = md5ii(d,a,b,c,x[i+3]||0,10,-1894986606); c = md5ii(c,d,a,b,x[i+10]||0,15,-1051523);   b = md5ii(b,c,d,a,x[i+1]||0,21,-2054922799);
    a = md5ii(a,b,c,d,x[i+8]||0,6,1873313359);  d = md5ii(d,a,b,c,x[i+15]||0,10,-30611744);  c = md5ii(c,d,a,b,x[i+6]||0,15,-1560198380); b = md5ii(b,c,d,a,x[i+13]||0,21,1309151649);
    a = md5ii(a,b,c,d,x[i+4]||0,6,-145523070);  d = md5ii(d,a,b,c,x[i+11]||0,10,-1120210379);c = md5ii(c,d,a,b,x[i+2]||0,15,718787259);   b = md5ii(b,c,d,a,x[i+9]||0,21,-343485551);
    a = safeAdd(a,oa); b = safeAdd(b,ob); c = safeAdd(c,oc); d = safeAdd(d,od);
  }
  return [a,b,c,d].map(n => { const h = (n >>> 0).toString(16).padStart(8,'0'); return h.match(/../g)!.map(x => x[1]+x[0]).join(''); }).join('');
}

async function encryptText(text: string, passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt, 0); result.set(iv, 16); result.set(new Uint8Array(encrypted), 28);
  return btoa(String.fromCharCode(...result));
}

async function decryptText(ciphertext: string, passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const data = new Uint8Array(atob(ciphertext).split('').map(c => c.charCodeAt(0)));
  const salt = data.slice(0, 16), iv = data.slice(16, 28), encrypted = data.slice(28);
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
  return new TextDecoder().decode(decrypted);
}

// ─── Shared UI Bits ───────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="px-3 py-1.5 glass rounded-lg font-mono text-xs text-purple-300 hover:text-white border border-purple-500/20 hover:border-purple-500/40 transition-all flex items-center gap-1.5">
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function OutputBox({ value, label }: { value: string; label?: string }) {
  if (!value) return null;
  return (
    <div className="mt-4">
      {label && <p className="font-mono text-[10px] text-purple-400/50 uppercase tracking-widest mb-1">{label}</p>}
      <div className="flex items-start gap-2">
        <div className="flex-1 glass rounded-xl p-3 font-mono text-xs text-purple-200/80 break-all whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
          {value}
        </div>
        <CopyButton text={value} />
      </div>
    </div>
  );
}

function InputArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full glass rounded-xl p-3 font-mono text-xs text-purple-200/80 placeholder:text-purple-400/30 border border-purple-500/20 focus:border-purple-500/50 focus:outline-none resize-none transition-colors bg-transparent"
    />
  );
}

function InputField({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full glass rounded-xl px-3 py-2.5 font-mono text-xs text-purple-200/80 placeholder:text-purple-400/30 border border-purple-500/20 focus:border-purple-500/50 focus:outline-none transition-colors bg-transparent"
    />
  );
}

function ActionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="px-5 py-2 rounded-xl font-mono text-xs text-white btn-gradient transition-all hover:opacity-90 active:scale-95">
      {children}
    </button>
  );
}

// ─── Individual Tools ─────────────────────────────────────────────────────────

function HashTool() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<{ sha256: string; sha1: string; md5: string } | null>(null);

  const generate = async () => {
    if (!input) return;
    const [s256, s1] = await Promise.all([sha256(input), sha1(input)]);
    setResults({ sha256: s256, sha1: s1, md5: md5(input) });
  };

  return (
    <div className="space-y-3">
      <InputArea value={input} onChange={setInput} placeholder="Enter text to hash..." rows={2} />
      <ActionButton onClick={generate}>Generate Hashes</ActionButton>
      {results && (
        <div className="space-y-2 mt-2">
          <OutputBox value={results.sha256} label="SHA-256" />
          <OutputBox value={results.sha1}   label="SHA-1"   />
          <OutputBox value={results.md5}    label="MD5"     />
        </div>
      )}
    </div>
  );
}

function PasswordTool() {
  const [length, setLength] = useState(20);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [output, setOutput] = useState('');

  const generate = () => {
    let chars = '';
    if (useUpper)   chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower)   chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) return;
    const arr = crypto.getRandomValues(new Uint32Array(length));
    setOutput(Array.from(arr).map(x => chars[x % chars.length]).join(''));
  };

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-all ${value ? 'bg-purple-500/20 border-purple-500/50 text-purple-200' : 'glass border-purple-500/10 text-purple-400/40'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-purple-300/50 w-16">Length: {length}</span>
        <input type="range" min={8} max={64} value={length} onChange={e => setLength(+e.target.value)}
          className="flex-1 accent-purple-500" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Toggle label="A–Z" value={useUpper}   onChange={setUseUpper}   />
        <Toggle label="a–z" value={useLower}   onChange={setUseLower}   />
        <Toggle label="0–9" value={useNumbers} onChange={setUseNumbers} />
        <Toggle label="!@#" value={useSymbols} onChange={setUseSymbols} />
      </div>
      <ActionButton onClick={generate}>Generate Password</ActionButton>
      <OutputBox value={output} label="Generated Password" />
    </div>
  );
}

function QRTool() {
  const [input, setInput] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  const generate = () => {
    if (!input) return;
    const encoded = encodeURIComponent(input);
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}&bgcolor=0a0118&color=a78bfa&margin=10`);
  };

  return (
    <div className="space-y-3">
      <InputField value={input} onChange={setInput} placeholder="Enter URL or text..." />
      <ActionButton onClick={generate}>Generate QR</ActionButton>
      {qrUrl && (
        <div className="mt-3 flex flex-col items-center gap-3">
          <div className="p-3 glass rounded-xl border border-purple-500/20">
            <img src={qrUrl} alt="QR Code" className="w-40 h-40 rounded-lg" />
          </div>
          <a href={qrUrl} download="qr.png" className="font-mono text-xs text-purple-400/60 hover:text-purple-300 transition-colors">
            ↓ Download PNG
          </a>
        </div>
      )}
    </div>
  );
}

function URLTool() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState('');

  const parse = () => {
    setError('');
    try {
      const u = new URL(input.startsWith('http') ? input : 'https://' + input);
      const params: Record<string, string> = {};
      u.searchParams.forEach((v, k) => { params[k] = v; });
      setParsed({
        Protocol:  u.protocol,
        Host:      u.host,
        Hostname:  u.hostname,
        Port:      u.port || '(default)',
        Pathname:  u.pathname,
        Search:    u.search || '(none)',
        Hash:      u.hash || '(none)',
        Origin:    u.origin,
        ...(Object.keys(params).length ? { 'Query Params': JSON.stringify(params, null, 2) } : {}),
      });
    } catch {
      setError('Invalid URL');
      setParsed(null);
    }
  };

  return (
    <div className="space-y-3">
      <InputField value={input} onChange={setInput} placeholder="https://example.com/path?foo=bar#hash" />
      <ActionButton onClick={parse}>Parse URL</ActionButton>
      {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      {parsed && (
        <div className="mt-3 space-y-1.5">
          {Object.entries(parsed).map(([k, v]) => (
            <div key={k} className="grid grid-cols-[120px_1fr] gap-2 items-start">
              <span className="font-mono text-[10px] text-purple-400/50 uppercase tracking-wider pt-0.5">{k}</span>
              <span className="font-mono text-xs text-purple-200/80 glass rounded-lg px-2 py-1 break-all">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EncryptTool() {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [text, setText] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const run = async () => {
    setError(''); setOutput('');
    if (!text || !passphrase) return;
    try {
      if (mode === 'encrypt') {
        setOutput(await encryptText(text, passphrase));
      } else {
        setOutput(await decryptText(text, passphrase));
      }
    } catch {
      setError('Decryption failed — wrong key or corrupted data.');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['encrypt', 'decrypt'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setOutput(''); setError(''); }}
            className={`flex-1 py-2 rounded-xl font-mono text-xs border transition-all capitalize ${mode === m ? 'bg-purple-500/20 border-purple-500/50 text-purple-200' : 'glass border-purple-500/10 text-purple-400/40'}`}>
            {m}
          </button>
        ))}
      </div>
      <InputArea value={text} onChange={setText} placeholder={mode === 'encrypt' ? 'Text to encrypt...' : 'Ciphertext to decrypt...'} rows={3} />
      <InputField value={passphrase} onChange={setPassphrase} placeholder="Passphrase / key..." type="password" />
      <ActionButton onClick={run}>{mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}</ActionButton>
      {error && <p className="font-mono text-xs text-red-400 mt-2">{error}</p>}
      <OutputBox value={output} label={mode === 'encrypt' ? 'Encrypted (AES-GCM)' : 'Decrypted Text'} />
    </div>
  );
}

function RegexTool() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testStr, setTestStr] = useState('');
  const [error, setError] = useState('');

  let highlighted = testStr;
  let matchCount = 0;
  if (pattern && testStr) {
    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      const matches = [...testStr.matchAll(re)];
      matchCount = matches.length;
      highlighted = testStr.replace(re, m => `@@${m}@@`);
      setError('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid regex');
    }
  }

  const parts = highlighted.split('@@');

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <InputField value={pattern} onChange={v => { setPattern(v); setError(''); }} placeholder="Regex pattern..." />
        </div>
        <div className="w-20">
          <InputField value={flags} onChange={setFlags} placeholder="flags" />
        </div>
      </div>
      <InputArea value={testStr} onChange={setTestStr} placeholder="Test string..." rows={4} />
      {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      {pattern && testStr && !error && (
        <div className="mt-2">
          <p className="font-mono text-[10px] text-purple-400/50 uppercase tracking-widest mb-1">
            {matchCount} match{matchCount !== 1 ? 'es' : ''}
          </p>
          <div className="glass rounded-xl p-3 font-mono text-xs text-purple-200/70 leading-relaxed break-all">
            {parts.map((part, i) =>
              i % 2 === 1
                ? <mark key={i} className="bg-purple-500/30 text-purple-100 rounded px-0.5">{part}</mark>
                : <span key={i}>{part}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function JSONTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const format = () => {
    setError('');
    try { setOutput(JSON.stringify(JSON.parse(input), null, 2)); } catch { setError('Invalid JSON'); }
  };
  const minify = () => {
    setError('');
    try { setOutput(JSON.stringify(JSON.parse(input))); } catch { setError('Invalid JSON'); }
  };

  return (
    <div className="space-y-3">
      <InputArea value={input} onChange={setInput} placeholder='{"key": "value"}' rows={5} />
      <div className="flex gap-2">
        <ActionButton onClick={format}>Prettify</ActionButton>
        <ActionButton onClick={minify}>Minify</ActionButton>
      </div>
      {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      <OutputBox value={output} label="Output" />
    </div>
  );
}

function JWTTool() {
  const [input, setInput] = useState('');

  let header = '', payload = '', sigNote = '';
  let parseError = '';

  if (input.trim()) {
    const parts = input.trim().split('.');
    if (parts.length === 3) {
      try {
        const decode = (s: string) => JSON.parse(atob(s.replace(/-/g, '+').replace(/_/g, '/')));
        header  = JSON.stringify(decode(parts[0]), null, 2);
        payload = JSON.stringify(decode(parts[1]), null, 2);
        sigNote = parts[2] ? `${parts[2].slice(0, 20)}... (not verified — client-side only)` : '';
      } catch { parseError = 'Could not decode JWT — make sure it is valid.'; }
    } else {
      parseError = 'Not a valid JWT (expected 3 dot-separated parts).';
    }
  }

  return (
    <div className="space-y-3">
      <InputArea value={input} onChange={setInput} placeholder="Paste JWT token here..." rows={3} />
      {parseError && <p className="font-mono text-xs text-red-400">{parseError}</p>}
      {header  && <OutputBox value={header}  label="Header"    />}
      {payload && <OutputBox value={payload} label="Payload"   />}
      {sigNote && <OutputBox value={sigNote} label="Signature" />}
    </div>
  );
}

function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const run = useCallback(() => {
    setError('');
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch {
      setError('Invalid Base64 input.');
    }
  }, [mode, input]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['encode', 'decode'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setOutput(''); setError(''); }}
            className={`flex-1 py-2 rounded-xl font-mono text-xs border transition-all capitalize ${mode === m ? 'bg-purple-500/20 border-purple-500/50 text-purple-200' : 'glass border-purple-500/10 text-purple-400/40'}`}>
            {m}
          </button>
        ))}
      </div>
      <InputArea value={input} onChange={v => { setInput(v); setOutput(''); }} placeholder={mode === 'encode' ? 'Text to encode...' : 'Base64 to decode...'} rows={3} />
      <ActionButton onClick={run}>{mode === 'encode' ? 'Encode' : 'Decode'}</ActionButton>
      {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      <OutputBox value={output} label="Result" />
    </div>
  );
}

// ─── Tool Renderer ────────────────────────────────────────────────────────────

const TOOL_COMPONENTS: Record<ToolId, React.ReactNode> = {
  hash:     <HashTool />,
  password: <PasswordTool />,
  qr:       <QRTool />,
  url:      <URLTool />,
  encrypt:  <EncryptTool />,
  regex:    <RegexTool />,
  json:     <JSONTool />,
  jwt:      <JWTTool />,
  base64:   <Base64Tool />,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LabPage() {
  const [activeId, setActiveId] = useState<ToolId | null>(null);
  const activeTool = TOOLS.find(t => t.id === activeId) ?? null;

  return (
    <main className="relative bg-[#0a0118] min-h-screen">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-white font-light">DOOM</Link>
          <div className="flex items-center gap-6">
            <Link href="/"      className="font-mono text-sm text-purple-300/70 hover:text-purple-200 transition-colors">Home</Link>
            <Link href="/#projects" className="font-mono text-sm text-purple-300/70 hover:text-purple-200 transition-colors">Projects</Link>
            <Link href="/ocr"   className="font-mono text-sm text-purple-300/70 hover:text-purple-200 transition-colors">OCR</Link>
            <Link href="/chess" className="font-mono text-sm text-purple-300/70 hover:text-purple-200 transition-colors">Chess</Link>
            <Link href="/lab"   className="font-mono text-sm text-purple-300 border-b border-purple-500">Lab</Link>
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
            className="text-center mb-14"
          >
            <span className="inline-block px-4 py-1.5 glass rounded-full font-mono text-xs tracking-[0.2em] text-purple-300/60 uppercase border border-purple-500/20 mb-4">
              Client-side · No data leaves your browser
            </span>
            <h1 className="font-display text-5xl md:text-7xl text-gradient mb-4 font-light tracking-tight">
              Hacker Lab
            </h1>
            <p className="font-mono text-sm text-purple-300/60 max-w-lg mx-auto">
              A toolbox of mini utilities. Click any card to expand it.
            </p>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOLS.map((tool, i) => {
              const isOpen = activeId === tool.id;
              return (
                <motion.div
                  key={tool.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className={`glass-strong rounded-2xl border transition-colors overflow-hidden ${
                    isOpen ? 'border-purple-500/40' : 'border-purple-500/10 hover:border-purple-500/25'
                  }`}
                >
                  {/* Card header — always visible */}
                  <button
                    onClick={() => setActiveId(isOpen ? null : tool.id)}
                    className="w-full flex items-center gap-4 p-5 text-left group"
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.accent} flex items-center justify-center font-mono text-white text-sm font-bold shrink-0 shadow-lg`}>
                      {tool.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-purple-200 group-hover:text-white transition-colors truncate">
                        {tool.label}
                      </p>
                      <p className="font-mono text-[11px] text-purple-400/50 truncate mt-0.5">
                        {tool.description}
                      </p>
                    </div>

                    {/* Chevron */}
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="shrink-0"
                    >
                      <svg className="w-4 h-4 text-purple-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-purple-500/10 pt-4">
                          {TOOL_COMPONENTS[tool.id]}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(139,92,246,0.05); border-radius:10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.2); border-radius:10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.4); }
      `}</style>
    </main>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

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
  glyph: string;
}

const TOOLS: Tool[] = [
  { id: 'hash',     label: 'Hash Generator',    description: 'SHA-256 / SHA-1 / MD5 via Web Crypto',              glyph: '#'   },
  { id: 'password', label: 'Password Generator', description: 'Cryptographically random passwords',                 glyph: '**'  },
  { id: 'qr',       label: 'QR Generator',       description: 'Generate a QR code for any URL or text',            glyph: 'QR'  },
  { id: 'url',      label: 'URL Parser',         description: 'Dissect any URL into its components',               glyph: '//'  },
  { id: 'encrypt',  label: 'Text Encrypter',     description: 'AES-GCM encryption with a passphrase',              glyph: 'AES' },
  { id: 'regex',    label: 'Regex Tester',       description: 'Live regex matching with highlights',               glyph: '.*'  },
  { id: 'json',     label: 'JSON Formatter',     description: 'Prettify, minify and validate JSON',                glyph: '{}'  },
  { id: 'jwt',      label: 'JWT Decoder',        description: 'Decode JWT header, payload and signature',          glyph: 'JWT' },
  { id: 'base64',   label: 'Base64 Encoder',     description: 'Encode and decode Base64 strings',                  glyph: 'b64' },
];

// ─── Crypto helpers ───────────────────────────────────────────────────────────

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function sha1(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function md5(str: string): string {
  function safeAdd(x: number, y: number) { const lsw=(x&0xffff)+(y&0xffff);const msw=(x>>16)+(y>>16)+(lsw>>16);return(msw<<16)|(lsw&0xffff); }
  function bitRotateLeft(num: number,cnt: number){return(num<<cnt)|(num>>>(32-cnt));}
  function md5cmn(q:number,a:number,b:number,x:number,s:number,t:number){return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b);}
  function md5ff(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn((b&c)|(~b&d),a,b,x,s,t);}
  function md5gg(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn((b&d)|(c&~d),a,b,x,s,t);}
  function md5hh(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn(b^c^d,a,b,x,s,t);}
  function md5ii(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn(c^(b|~d),a,b,x,s,t);}
  const utf8=unescape(encodeURIComponent(str));const len=utf8.length;const words:number[]=[];
  for(let i=0;i<len;i+=4)words[i>>2]=(utf8.charCodeAt(i)&0xff)|((utf8.charCodeAt(i+1)&0xff)<<8)|((utf8.charCodeAt(i+2)&0xff)<<16)|((utf8.charCodeAt(i+3)&0xff)<<24);
  words[len>>2]|=0x80<<(len%4*8);words[(((len+8)>>>6)<<4)+14]=len*8;
  let a=1732584193,b=-271733879,c=-1732584194,d=271733878;
  for(let i=0;i<words.length;i+=16){
    const[oa,ob,oc,od]=[a,b,c,d];
    a=md5ff(a,b,c,d,words[i+0],7,-680876936);d=md5ff(d,a,b,c,words[i+1],12,-389564586);c=md5ff(c,d,a,b,words[i+2],17,606105819);b=md5ff(b,c,d,a,words[i+3],22,-1044525330);
    a=md5ff(a,b,c,d,words[i+4],7,-176418897);d=md5ff(d,a,b,c,words[i+5],12,1200080426);c=md5ff(c,d,a,b,words[i+6],17,-1473231341);b=md5ff(b,c,d,a,words[i+7],22,-45705983);
    a=md5ff(a,b,c,d,words[i+8],7,1770035416);d=md5ff(d,a,b,c,words[i+9],12,-1958414417);c=md5ff(c,d,a,b,words[i+10],17,-42063);b=md5ff(b,c,d,a,words[i+11],22,-1990404162);
    a=md5ff(a,b,c,d,words[i+12],7,1804603682);d=md5ff(d,a,b,c,words[i+13],12,-40341101);c=md5ff(c,d,a,b,words[i+14],17,-1502002290);b=md5ff(b,c,d,a,words[i+15],22,1236535329);
    a=md5gg(a,b,c,d,words[i+1],5,-165796510);d=md5gg(d,a,b,c,words[i+6],9,-1069501632);c=md5gg(c,d,a,b,words[i+11],14,643717713);b=md5gg(b,c,d,a,words[i+0],20,-373897302);
    a=md5gg(a,b,c,d,words[i+5],5,-701558691);d=md5gg(d,a,b,c,words[i+10],9,38016083);c=md5gg(c,d,a,b,words[i+15],14,-660478335);b=md5gg(b,c,d,a,words[i+4],20,-405537848);
    a=md5gg(a,b,c,d,words[i+9],5,568446438);d=md5gg(d,a,b,c,words[i+14],9,-1019803690);c=md5gg(c,d,a,b,words[i+3],14,-187363961);b=md5gg(b,c,d,a,words[i+8],20,1163531501);
    a=md5gg(a,b,c,d,words[i+13],5,-1444681467);d=md5gg(d,a,b,c,words[i+2],9,-51403784);c=md5gg(c,d,a,b,words[i+7],14,1735328473);b=md5gg(b,c,d,a,words[i+12],20,-1926607734);
    a=md5hh(a,b,c,d,words[i+5],4,-378558);d=md5hh(d,a,b,c,words[i+8],11,-2022574463);c=md5hh(c,d,a,b,words[i+11],16,1839030562);b=md5hh(b,c,d,a,words[i+14],23,-35309556);
    a=md5hh(a,b,c,d,words[i+1],4,-1530992060);d=md5hh(d,a,b,c,words[i+4],11,1272893353);c=md5hh(c,d,a,b,words[i+7],16,-155497632);b=md5hh(b,c,d,a,words[i+10],23,-1094730640);
    a=md5hh(a,b,c,d,words[i+13],4,681279174);d=md5hh(d,a,b,c,words[i+0],11,-358537222);c=md5hh(c,d,a,b,words[i+3],16,-722521979);b=md5hh(b,c,d,a,words[i+6],23,76029189);
    a=md5hh(a,b,c,d,words[i+9],4,-640364487);d=md5hh(d,a,b,c,words[i+12],11,-421815835);c=md5hh(c,d,a,b,words[i+15],16,530742520);b=md5hh(b,c,d,a,words[i+2],23,-995338651);
    a=md5ii(a,b,c,d,words[i+0],6,-198630844);d=md5ii(d,a,b,c,words[i+7],10,1126891415);c=md5ii(c,d,a,b,words[i+14],15,-1416354905);b=md5ii(b,c,d,a,words[i+5],21,-57434055);
    a=md5ii(a,b,c,d,words[i+12],6,1700485571);d=md5ii(d,a,b,c,words[i+3],10,-1894986606);c=md5ii(c,d,a,b,words[i+10],15,-1051523);b=md5ii(b,c,d,a,words[i+1],21,-2054922799);
    a=md5ii(a,b,c,d,words[i+8],6,1873313359);d=md5ii(d,a,b,c,words[i+15],10,-30611744);c=md5ii(c,d,a,b,words[i+6],15,-1560198380);b=md5ii(b,c,d,a,words[i+13],21,1309151649);
    a=md5ii(a,b,c,d,words[i+4],6,-145523070);d=md5ii(d,a,b,c,words[i+11],10,-1120210379);c=md5ii(c,d,a,b,words[i+2],15,718787259);b=md5ii(b,c,d,a,words[i+9],21,-343485551);
    a=safeAdd(a,oa);b=safeAdd(b,ob);c=safeAdd(c,oc);d=safeAdd(d,od);
  }
  return[a,b,c,d].map(n=>{let s='';for(let i=0;i<4;i++)s+=('0'+((n>>>(i*8))&0xff).toString(16)).slice(-2);return s;}).join('');
}

async function encryptText(text: string, passphrase: string): Promise<string> {
  const enc=new TextEncoder();
  const km=await crypto.subtle.importKey('raw',enc.encode(passphrase),{name:'PBKDF2'},false,['deriveKey']);
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:100000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['encrypt']);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(text));
  const combined=new Uint8Array(salt.byteLength+iv.byteLength+encrypted.byteLength);
  combined.set(salt,0);combined.set(iv,salt.byteLength);combined.set(new Uint8Array(encrypted),salt.byteLength+iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

async function decryptText(ciphertext: string, passphrase: string): Promise<string> {
  const enc=new TextEncoder();
  const combined=Uint8Array.from(atob(ciphertext),c=>c.charCodeAt(0));
  const salt=combined.slice(0,16);const iv=combined.slice(16,28);const data=combined.slice(28);
  const km=await crypto.subtle.importKey('raw',enc.encode(passphrase),{name:'PBKDF2'},false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:100000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
  const decrypted=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,data);
  return new TextDecoder().decode(decrypted);
}

// ─── Shared UI Primitives ─────────────────────────────────────────────────────

function OutputBox({ value, label }: { value: string; label?: string }) {
  const copy = () => navigator.clipboard.writeText(value);
  if (!value) return null;
  return (
    <div className="mt-2">
      {label && <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-1">{label}</p>}
      <div className="flex gap-2 items-start">
        <div className="flex-1 glass border border-white/7 p-3 font-mono text-xs text-white/55 break-all whitespace-pre-wrap max-h-36 overflow-y-auto custom-scrollbar">
          {value}
        </div>
        <button onClick={copy} className="px-3 py-2 glass border border-white/7 font-mono text-xs text-white/30 shrink-0">
          Copy
        </button>
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
      className="w-full glass border border-white/7 focus:border-white/20 p-3 font-mono text-xs text-white/60 placeholder:text-white/20 focus:outline-none resize-none transition-colors bg-transparent"
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
      className="w-full glass border border-white/7 focus:border-white/20 px-3 py-2.5 font-mono text-xs text-white/60 placeholder:text-white/20 focus:outline-none transition-colors bg-transparent"
    />
  );
}

function ActionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="px-5 py-2.5 btn-gradient font-mono text-xs active:scale-[0.98] transition-all">
      {children}
    </button>
  );
}

// ─── Tool Components ──────────────────────────────────────────────────────────

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
      <InputArea value={input} onChange={setInput} placeholder="Enter text to hash..." rows={3} />
      <ActionButton onClick={generate}>Generate Hashes</ActionButton>
      {results && (<div className="space-y-2 mt-2"><OutputBox value={results.sha256} label="SHA-256" /><OutputBox value={results.sha1} label="SHA-1" /><OutputBox value={results.md5} label="MD5" /></div>)}
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
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) return;
    const arr = crypto.getRandomValues(new Uint32Array(length));
    setOutput(Array.from(arr).map(x => chars[x % chars.length]).join(''));
  };
  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className={`px-3 py-2 font-mono text-xs border transition-all ${value ? 'bg-white/10 border-white/25 text-white' : 'glass border-white/6 text-white/25'}`}>
      {label}
    </button>
  );
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-white/30 w-20 shrink-0">Length: {length}</span>
        <input type="range" min={8} max={64} value={length} onChange={e => setLength(+e.target.value)} className="flex-1 accent-white" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Toggle label="A–Z" value={useUpper} onChange={setUseUpper} />
        <Toggle label="a–z" value={useLower} onChange={setUseLower} />
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
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(input)}&bgcolor=000000&color=ffffff&margin=10`);
  };
  return (
    <div className="space-y-3">
      <InputField value={input} onChange={setInput} placeholder="Enter URL or text..." />
      <ActionButton onClick={generate}>Generate QR</ActionButton>
      {qrUrl && (
        <div className="mt-3 flex flex-col items-center gap-3">
          <div className="p-3 glass border border-white/8"><img src={qrUrl} alt="QR Code" className="w-36 h-36" /></div>
          <a href={qrUrl} download="qr.png" className="font-mono text-xs text-white/30">Save PNG</a>
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
      setParsed({ Protocol: u.protocol, Host: u.host, Hostname: u.hostname, Port: u.port || '(default)', Pathname: u.pathname, Search: u.search || '(none)', Hash: u.hash || '(none)', Origin: u.origin, ...(Object.keys(params).length ? { 'Query Params': JSON.stringify(params, null, 2) } : {}) });
    } catch { setError('Invalid URL'); setParsed(null); }
  };
  return (
    <div className="space-y-3">
      <InputField value={input} onChange={setInput} placeholder="https://example.com/path?foo=bar" />
      <ActionButton onClick={parse}>Parse URL</ActionButton>
      {error && <p className="font-mono text-xs text-red-400/70">{error}</p>}
      {parsed && (
        <div className="mt-3 space-y-1.5">
          {Object.entries(parsed).map(([k, v]) => (
            <div key={k} className="flex flex-col sm:grid sm:grid-cols-[90px_1fr] gap-1 sm:gap-2 items-start">
              <span className="font-mono text-[10px] text-white/25 uppercase tracking-wider">{k}</span>
              <span className="font-mono text-xs text-white/55 glass border border-white/6 px-2 py-1 break-all w-full">{v}</span>
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
      setOutput(mode === 'encrypt' ? await encryptText(text, passphrase) : await decryptText(text, passphrase));
    } catch { setError('Decryption failed — wrong key or corrupted data.'); }
  };
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['encrypt', 'decrypt'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setOutput(''); setError(''); }}
            className={`flex-1 py-2.5 font-mono text-xs border capitalize ${mode === m ? 'bg-white/10 border-white/25 text-white' : 'glass border-white/6 text-white/25'}`}>{m}</button>
        ))}
      </div>
      <InputArea value={text} onChange={setText} placeholder={mode === 'encrypt' ? 'Text to encrypt...' : 'Ciphertext to decrypt...'} rows={3} />
      <InputField value={passphrase} onChange={setPassphrase} placeholder="Passphrase / key..." type="password" />
      <ActionButton onClick={run}>{mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}</ActionButton>
      {error && <p className="font-mono text-xs text-red-400/70">{error}</p>}
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
      matchCount = [...testStr.matchAll(re)].length;
      highlighted = testStr.replace(re, m => `@@${m}@@`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Invalid regex'); }
  }
  const parts = highlighted.split('@@');
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1"><InputField value={pattern} onChange={v => { setPattern(v); setError(''); }} placeholder="Regex pattern..." /></div>
        <div className="w-16"><InputField value={flags} onChange={setFlags} placeholder="flags" /></div>
      </div>
      <InputArea value={testStr} onChange={setTestStr} placeholder="Test string..." rows={4} />
      {error && <p className="font-mono text-xs text-red-400/70">{error}</p>}
      {pattern && testStr && !error && (
        <div className="mt-2">
          <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-1">{matchCount} match{matchCount !== 1 ? 'es' : ''}</p>
          <div className="glass border border-white/6 p-3 font-mono text-xs text-white/55 leading-relaxed break-all">
            {parts.map((part, i) => i % 2 === 1
              ? <mark key={i} className="bg-white/15 text-white px-0.5">{part}</mark>
              : <span key={i}>{part}</span>)}
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
  const format = () => { setError(''); try { setOutput(JSON.stringify(JSON.parse(input), null, 2)); } catch { setError('Invalid JSON'); } };
  const minify = () => { setError(''); try { setOutput(JSON.stringify(JSON.parse(input))); } catch { setError('Invalid JSON'); } };
  return (
    <div className="space-y-3">
      <InputArea value={input} onChange={setInput} placeholder='{"key": "value"}' rows={5} />
      <div className="flex gap-2"><ActionButton onClick={format}>Prettify</ActionButton><ActionButton onClick={minify}>Minify</ActionButton></div>
      {error && <p className="font-mono text-xs text-red-400/70">{error}</p>}
      <OutputBox value={output} label="Output" />
    </div>
  );
}

function JWTTool() {
  const [input, setInput] = useState('');
  let header = '', payload = '', sigNote = '', parseError = '';
  if (input.trim()) {
    const parts = input.trim().split('.');
    if (parts.length === 3) {
      try {
        const decode = (s: string) => JSON.parse(atob(s.replace(/-/g, '+').replace(/_/g, '/')));
        header = JSON.stringify(decode(parts[0]), null, 2);
        payload = JSON.stringify(decode(parts[1]), null, 2);
        sigNote = parts[2] ? `${parts[2].slice(0, 20)}... (not verified — client-side only)` : '';
      } catch { parseError = 'Could not decode JWT.'; }
    } else { parseError = 'Not a valid JWT (expected 3 dot-separated parts).'; }
  }
  return (
    <div className="space-y-3">
      <InputArea value={input} onChange={setInput} placeholder="Paste JWT token here..." rows={3} />
      {parseError && <p className="font-mono text-xs text-red-400/70">{parseError}</p>}
      {header && <OutputBox value={header} label="Header" />}
      {payload && <OutputBox value={payload} label="Payload" />}
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
      setOutput(mode === 'encode' ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input))));
    } catch { setError('Invalid Base64 input.'); }
  }, [mode, input]);
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['encode', 'decode'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setOutput(''); setError(''); }}
            className={`flex-1 py-2.5 font-mono text-xs border capitalize ${mode === m ? 'bg-white/10 border-white/25 text-white' : 'glass border-white/6 text-white/25'}`}>{m}</button>
        ))}
      </div>
      <InputArea value={input} onChange={v => { setInput(v); setOutput(''); }} placeholder={mode === 'encode' ? 'Text to encode...' : 'Base64 to decode...'} rows={3} />
      <ActionButton onClick={run}>{mode === 'encode' ? 'Encode' : 'Decode'}</ActionButton>
      {error && <p className="font-mono text-xs text-red-400/70">{error}</p>}
      <OutputBox value={output} label="Result" />
    </div>
  );
}

const TOOL_COMPONENTS: Record<ToolId, React.ReactNode> = {
  hash: <HashTool />, password: <PasswordTool />, qr: <QRTool />, url: <URLTool />,
  encrypt: <EncryptTool />, regex: <RegexTool />, json: <JSONTool />, jwt: <JWTTool />, base64: <Base64Tool />,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LabPage() {
  const [activeId, setActiveId] = useState<ToolId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="relative bg-black min-h-screen">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/6">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-white font-light tracking-wide">DOOM</Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="font-mono text-sm text-white/30 hover:text-white/70 transition-colors">Home</Link>
            <Link href="/#projects" className="font-mono text-sm text-white/30 hover:text-white/70 transition-colors">Projects</Link>
            <Link href="/ocr" className="font-mono text-sm text-white/30 hover:text-white/70 transition-colors">OCR</Link>
            <Link href="/chess" className="font-mono text-sm text-white/30 hover:text-white/70 transition-colors">Chess</Link>
            <Link href="/lab" className="font-mono text-sm text-white border-b border-white/50 pb-px">Lab</Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-px bg-white/50 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
            <span className={`block w-5 h-px bg-white/50 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-white/50 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/98 backdrop-blur-md flex flex-col items-center justify-center gap-8 md:hidden"
            onClick={() => setMenuOpen(false)}
          >
            {[{ href: '/', label: 'Home' }, { href: '/#projects', label: 'Projects' }, { href: '/ocr', label: 'OCR' }, { href: '/chess', label: 'Chess' }, { href: '/lab', label: 'Lab' }].map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className="font-mono text-2xl text-white/60 hover:text-white transition-colors tracking-[0.1em]">{label}</Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-20 md:pt-24 px-4 sm:px-5 pb-20">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-10 md:mb-14"
          >
            <span className="inline-block px-4 py-1.5 glass border border-white/8 font-mono text-[10px] md:text-xs tracking-[0.2em] text-white/30 uppercase mb-4">
              Client-side / No data leaves your browser
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl text-gradient mb-3 font-light tracking-tight">
              Hacker Lab
            </h1>
            <p className="font-mono text-xs md:text-sm text-white/30 max-w-sm mx-auto">
              A toolbox of mini utilities. Tap any card to expand it.
            </p>
          </motion.div>

          {/* Grid — single col on mobile, 2 cols sm, 3 cols lg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TOOLS.map((tool, i) => {
              const isOpen = activeId === tool.id;
              return (
                <motion.div
                  key={tool.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className={`glass-strong border transition-colors overflow-hidden ${isOpen ? 'border-white/20' : 'border-white/6 hover:border-white/13'}`}
                >
                  {/* Card header — larger tap target on mobile */}
                  <button
                    onClick={() => setActiveId(isOpen ? null : tool.id)}
                    className="w-full flex items-center gap-4 p-4 sm:p-5 text-left"
                  >
                    <div className={`w-10 h-10 border flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${isOpen ? 'bg-white/10 border-white/25 text-white' : 'glass border-white/8 text-white/30'}`}>
                      {tool.glyph}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-mono text-sm transition-colors truncate ${isOpen ? 'text-white' : 'text-white/55'}`}>{tool.label}</p>
                      <p className="font-mono text-[11px] text-white/20 truncate mt-0.5">{tool.description}</p>
                    </div>
                    <svg className={`w-4 h-4 text-white/20 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="px-4 sm:px-5 pb-5 border-t border-white/5 pt-4">
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
    </main>
  );
}

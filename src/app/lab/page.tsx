'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SubNav from '@/components/SubNav';

const ease = [0.16, 1, 0.3, 1] as const;

type ToolId = 'hash' | 'password' | 'qr' | 'url' | 'encrypt' | 'regex' | 'json' | 'jwt' | 'base64';

interface Tool { id: ToolId; label: string; description: string; glyph: string; }

const TOOLS: Tool[] = [
  { id: 'hash',     label: 'Hash Generator',    description: 'SHA-256 / SHA-1 / MD5 via Web Crypto',       glyph: '#'   },
  { id: 'password', label: 'Password Generator', description: 'Cryptographically random passwords',          glyph: '**'  },
  { id: 'qr',       label: 'QR Generator',       description: 'Generate a QR code for any URL or text',     glyph: 'QR'  },
  { id: 'url',      label: 'URL Parser',         description: 'Dissect any URL into its components',        glyph: '//'  },
  { id: 'encrypt',  label: 'Text Encrypter',     description: 'AES-GCM encryption with a passphrase',       glyph: 'AES' },
  { id: 'regex',    label: 'Regex Tester',       description: 'Live regex matching with highlights',        glyph: '.*'  },
  { id: 'json',     label: 'JSON Formatter',     description: 'Prettify, minify and validate JSON',         glyph: '{}'  },
  { id: 'jwt',      label: 'JWT Decoder',        description: 'Decode JWT header, payload and signature',   glyph: 'JWT' },
  { id: 'base64',   label: 'Base64 Encoder',     description: 'Encode and decode Base64 strings',           glyph: 'b64' },
];

/* ─── Crypto ──────────────────────────────────────────────── */
async function sha256(t: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
async function sha1(t: string) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(t));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
function md5(str: string): string {
  function safeAdd(x:number,y:number){const lsw=(x&0xffff)+(y&0xffff);const msw=(x>>16)+(y>>16)+(lsw>>16);return(msw<<16)|(lsw&0xffff);}
  function bitRotateLeft(num:number,cnt:number){return(num<<cnt)|(num>>>(32-cnt));}
  function md5cmn(q:number,a:number,b:number,x:number,s:number,t:number){return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b);}
  function md5ff(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn((b&c)|(~b&d),a,b,x,s,t);}
  function md5gg(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn((b&d)|(c&~d),a,b,x,s,t);}
  function md5hh(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn(b^c^d,a,b,x,s,t);}
  function md5ii(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn(c^(b|~d),a,b,x,s,t);}
  const utf8=unescape(encodeURIComponent(str));const len=utf8.length;const words:number[]=[];
  for(let i=0;i<len;i+=4)words[i>>2]=(utf8.charCodeAt(i)&0xff)|((utf8.charCodeAt(i+1)&0xff)<<8)|((utf8.charCodeAt(i+2)&0xff)<<16)|((utf8.charCodeAt(i+3)&0xff)<<24);
  words[len>>2]|=0x80<<(len%4*8);words[(((len+8)>>>6)<<4)+14]=len*8;
  let a=1732584193,b=-271733879,c=-1732584194,d=271733878;
  for(let i=0;i<words.length;i+=16){const[oa,ob,oc,od]=[a,b,c,d];
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
    a=safeAdd(a,oa);b=safeAdd(b,ob);c=safeAdd(c,oc);d=safeAdd(d,od);}
  return[a,b,c,d].map(n=>{let s='';for(let i=0;i<4;i++)s+=('0'+((n>>>(i*8))&0xff).toString(16)).slice(-2);return s;}).join('');
}

async function encryptText(text: string, pw: string): Promise<string> {
  const enc=new TextEncoder(),km=await crypto.subtle.importKey('raw',enc.encode(pw),{name:'PBKDF2'},false,['deriveKey']);
  const salt=crypto.getRandomValues(new Uint8Array(16)) as Uint8Array<ArrayBuffer>;
  const iv=crypto.getRandomValues(new Uint8Array(12)) as Uint8Array<ArrayBuffer>;
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:100000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['encrypt']);
  const enc2=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(text));
  const combined=new Uint8Array(28+enc2.byteLength);combined.set(salt,0);combined.set(iv,16);combined.set(new Uint8Array(enc2),28);
  return btoa(String.fromCharCode(...combined));
}

async function decryptText(ct: string, pw: string): Promise<string> {
  const enc=new TextEncoder(),combined=Uint8Array.from(atob(ct),c=>c.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
  const salt=combined.slice(0,16) as Uint8Array<ArrayBuffer>,iv=combined.slice(16,28) as Uint8Array<ArrayBuffer>,data=combined.slice(28) as Uint8Array<ArrayBuffer>;
  const km=await crypto.subtle.importKey('raw',enc.encode(pw),{name:'PBKDF2'},false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:100000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
  return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},key,data));
}

/* ─── Shared UI ───────────────────────────────────────────── */
function Field({ value, onChange, placeholder, type='text', rows }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number }) {
  const cls = 'w-full bg-transparent border border-white/8 focus:border-white/22 px-3 py-2.5 font-mono text-xs text-white/60 placeholder:text-white/18 focus:outline-none transition-colors';
  if (rows) return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={cls + ' resize-none'} />;
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />;
}

function Out({ value, label }: { value: string; label?: string }) {
  if (!value) return null;
  return (
    <div className="mt-2">
      {label && <p className="font-mono text-[10px] text-white/22 uppercase tracking-widest mb-1">{label}</p>}
      <div className="flex gap-2 items-start">
        <div className="flex-1 border border-white/6 bg-white/[0.02] p-3 font-mono text-xs text-white/50 break-all whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
          {value}
        </div>
        <button onClick={() => navigator.clipboard.writeText(value)}
          className="px-3 py-2 border border-white/8 font-mono text-xs text-white/25 hover:text-white transition-colors shrink-0">
          Copy
        </button>
      </div>
    </div>
  );
}

function Btn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="px-5 py-2 btn-gradient font-mono text-xs active:scale-[0.98] transition-transform">
      {children}
    </button>
  );
}

/* ─── Tools ───────────────────────────────────────────────── */
function HashTool() {
  const [input, setInput] = useState('');
  const [res, setRes] = useState<{sha256:string;sha1:string;md5:string}|null>(null);
  const run = async () => { if(!input) return; const [s256,s1]= await Promise.all([sha256(input),sha1(input)]); setRes({sha256:s256,sha1:s1,md5:md5(input)}); };
  return <div className="space-y-3"><Field value={input} onChange={setInput} placeholder="Enter text to hash…" rows={3}/><Btn onClick={run}>Generate</Btn>{res&&<><Out value={res.sha256} label="SHA-256"/><Out value={res.sha1} label="SHA-1"/><Out value={res.md5} label="MD5"/></>}</div>;
}

function PasswordTool() {
  const [len,setLen]=useState(20);const [upper,setUpper]=useState(true);const [lower,setLower]=useState(true);const [nums,setNums]=useState(true);const [syms,setSyms]=useState(true);const [out,setOut]=useState('');
  const gen=()=>{ let c='';if(upper)c+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';if(lower)c+='abcdefghijklmnopqrstuvwxyz';if(nums)c+='0123456789';if(syms)c+='!@#$%^&*()_+-=[]{}|;:,.<>?';if(!c)return;const a=crypto.getRandomValues(new Uint32Array(len));setOut(Array.from(a).map(x=>c[x%c.length]).join('')); };
  const T=({label,val,set}:{label:string;val:boolean;set:(v:boolean)=>void})=><button onClick={()=>set(!val)} className={`px-3 py-1.5 font-mono text-xs border transition-all ${val?'border-white/25 text-white bg-white/6':'border-white/8 text-white/28'}`}>{label}</button>;
  return <div className="space-y-3"><div className="flex items-center gap-3"><span className="font-mono text-xs text-white/30 shrink-0">Length: {len}</span><input type="range" min={8} max={64} value={len} onChange={e=>setLen(+e.target.value)} className="flex-1 accent-white"/></div><div className="flex flex-wrap gap-2"><T label="A–Z" val={upper} set={setUpper}/><T label="a–z" val={lower} set={setLower}/><T label="0–9" val={nums} set={setNums}/><T label="!@#" val={syms} set={setSyms}/></div><Btn onClick={gen}>Generate</Btn><Out value={out} label="Password"/></div>;
}

function QRTool() {
  const [inp,setInp]=useState('');const [url,setUrl]=useState('');
  const gen=()=>{ if(!inp) return; setUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inp)}&bgcolor=000000&color=ffffff&margin=10`); };
  return <div className="space-y-3"><Field value={inp} onChange={setInp} placeholder="URL or text…"/><Btn onClick={gen}>Generate</Btn>{url&&<div className="mt-3 flex flex-col items-center gap-3"><div className="p-3 border border-white/8"><img src={url} alt="QR" className="w-36 h-36"/></div><a href={url} download="qr.png" className="font-mono text-xs text-white/28 hover:text-white transition-colors">Save PNG</a></div>}</div>;
}

function URLTool() {
  const [inp,setInp]=useState('');const [parsed,setParsed]=useState<Record<string,string>|null>(null);const [err,setErr]=useState('');
  const parse=()=>{ setErr(''); try { const u=new URL(inp.startsWith('http')?inp:'https://'+inp);const params:Record<string,string>={};u.searchParams.forEach((v,k)=>{params[k]=v;});setParsed({Protocol:u.protocol,Host:u.host,Hostname:u.hostname,Port:u.port||'(default)',Pathname:u.pathname,Search:u.search||'(none)',Hash:u.hash||'(none)',Origin:u.origin,...(Object.keys(params).length?{'Query Params':JSON.stringify(params,null,2)}:{})}); } catch { setErr('Invalid URL'); setParsed(null); } };
  return <div className="space-y-3"><Field value={inp} onChange={setInp} placeholder="https://example.com/path?foo=bar"/><Btn onClick={parse}>Parse</Btn>{err&&<p className="font-mono text-xs text-red-400/60">{err}</p>}{parsed&&<div className="mt-2 space-y-1.5">{Object.entries(parsed).map(([k,v])=><div key={k} className="flex flex-col sm:grid sm:grid-cols-[90px_1fr] gap-1"><span className="font-mono text-[10px] text-white/25 uppercase tracking-wider">{k}</span><span className="font-mono text-xs text-white/50 border border-white/6 px-2 py-1 break-all">{v}</span></div>)}</div>}</div>;
}

function EncryptTool() {
  const [mode,setMode]=useState<'encrypt'|'decrypt'>('encrypt');const [text,setText]=useState('');const [pw,setPw]=useState('');const [out,setOut]=useState('');const [err,setErr]=useState('');
  const run=async()=>{ setErr('');setOut('');if(!text||!pw)return;try{setOut(mode==='encrypt'?await encryptText(text,pw):await decryptText(text,pw));}catch{setErr('Failed — wrong key or corrupted data.');} };
  return <div className="space-y-3"><div className="flex gap-2">{(['encrypt','decrypt'] as const).map(m=><button key={m} onClick={()=>{setMode(m);setOut('');setErr('');}} className={`flex-1 py-2 font-mono text-xs border capitalize transition-all ${mode===m?'border-white/25 text-white bg-white/6':'border-white/8 text-white/28'}`}>{m}</button>)}</div><Field value={text} onChange={setText} placeholder={mode==='encrypt'?'Text to encrypt…':'Ciphertext…'} rows={3}/><Field value={pw} onChange={setPw} placeholder="Passphrase…" type="password"/><Btn onClick={run}>{mode==='encrypt'?'Encrypt':'Decrypt'}</Btn>{err&&<p className="font-mono text-xs text-red-400/60">{err}</p>}<Out value={out} label={mode==='encrypt'?'Encrypted (AES-GCM)':'Decrypted'}/></div>;
}

function RegexTool() {
  const [pat,setPat]=useState('');const [flags,setFlags]=useState('g');const [test,setTest]=useState('');const [err,setErr]=useState('');
  let highlighted=test,count=0;
  if(pat&&test){try{const re=new RegExp(pat,flags.includes('g')?flags:flags+'g');count=[...test.matchAll(re)].length;highlighted=test.replace(re,m=>`@@${m}@@`);setErr('');}catch(e:unknown){setErr(e instanceof Error?e.message:'Invalid regex');}}
  const parts=highlighted.split('@@');
  return <div className="space-y-3"><div className="flex gap-2"><div className="flex-1"><Field value={pat} onChange={v=>{setPat(v);setErr('');}} placeholder="Regex…"/></div><div className="w-16"><Field value={flags} onChange={setFlags} placeholder="flags"/></div></div><Field value={test} onChange={setTest} placeholder="Test string…" rows={4}/>{err&&<p className="font-mono text-xs text-red-400/60">{err}</p>}{pat&&test&&!err&&<div className="mt-2"><p className="font-mono text-[10px] text-white/25 mb-1">{count} match{count!==1?'es':''}</p><div className="border border-white/6 p-3 font-mono text-xs text-white/50 break-all leading-relaxed">{parts.map((p,i)=>i%2===1?<mark key={i} className="bg-white/12 text-white px-0.5">{p}</mark>:<span key={i}>{p}</span>)}</div></div>}</div>;
}

function JSONTool() {
  const [inp,setInp]=useState('');const [out,setOut]=useState('');const [err,setErr]=useState('');
  const fmt=()=>{setErr('');try{setOut(JSON.stringify(JSON.parse(inp),null,2));}catch{setErr('Invalid JSON');}};
  const min=()=>{setErr('');try{setOut(JSON.stringify(JSON.parse(inp)));}catch{setErr('Invalid JSON');}};
  return <div className="space-y-3"><Field value={inp} onChange={setInp} placeholder='{"key":"value"}' rows={5}/><div className="flex gap-2"><Btn onClick={fmt}>Prettify</Btn><Btn onClick={min}>Minify</Btn></div>{err&&<p className="font-mono text-xs text-red-400/60">{err}</p>}<Out value={out} label="Output"/></div>;
}

function JWTTool() {
  const [inp,setInp]=useState('');
  let header='',payload='',sig='',err='';
  if(inp.trim()){const p=inp.trim().split('.');if(p.length===3){try{const d=(s:string)=>JSON.parse(atob(s.replace(/-/g,'+').replace(/_/g,'/')));header=JSON.stringify(d(p[0]),null,2);payload=JSON.stringify(d(p[1]),null,2);sig=`${p[2].slice(0,20)}… (not verified)`;}catch{err='Could not decode JWT.';}}else{err='Expected 3 dot-separated parts.';}}
  return <div className="space-y-3"><Field value={inp} onChange={setInp} placeholder="Paste JWT…" rows={3}/>{err&&<p className="font-mono text-xs text-red-400/60">{err}</p>}{header&&<Out value={header} label="Header"/>}{payload&&<Out value={payload} label="Payload"/>}{sig&&<Out value={sig} label="Signature"/>}</div>;
}

function Base64Tool() {
  const [mode,setMode]=useState<'encode'|'decode'>('encode');const [inp,setInp]=useState('');const [out,setOut]=useState('');const [err,setErr]=useState('');
  const run=useCallback(()=>{setErr('');try{setOut(mode==='encode'?btoa(unescape(encodeURIComponent(inp))):decodeURIComponent(escape(atob(inp))));}catch{setErr('Invalid input.');}}, [mode,inp]);
  return <div className="space-y-3"><div className="flex gap-2">{(['encode','decode'] as const).map(m=><button key={m} onClick={()=>{setMode(m);setOut('');setErr('');}} className={`flex-1 py-2 font-mono text-xs border capitalize transition-all ${mode===m?'border-white/25 text-white bg-white/6':'border-white/8 text-white/28'}`}>{m}</button>)}</div><Field value={inp} onChange={v=>{setInp(v);setOut('');}} placeholder={mode==='encode'?'Text…':'Base64…'} rows={3}/><Btn onClick={run}>{mode==='encode'?'Encode':'Decode'}</Btn>{err&&<p className="font-mono text-xs text-red-400/60">{err}</p>}<Out value={out} label="Result"/></div>;
}

const COMPONENTS: Record<ToolId, React.ReactNode> = {
  hash:<HashTool/>, password:<PasswordTool/>, qr:<QRTool/>, url:<URLTool/>,
  encrypt:<EncryptTool/>, regex:<RegexTool/>, json:<JSONTool/>, jwt:<JWTTool/>, base64:<Base64Tool/>,
};

/* ─── Page ────────────────────────────────────────────────── */
export default function LabPage() {
  const [active, setActive] = useState<ToolId | null>(null);

  return (
    <main className="bg-black min-h-screen">
      <SubNav active="Lab" />

      <div className="pt-14">
        {/* Page header */}
        <div className="border-b border-white/8 px-6 md:px-12 lg:px-20 py-12 md:py-16">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, ease }}>
            <p className="font-mono text-[10px] text-white/25 tracking-[0.3em] uppercase mb-4">
              Client-side &nbsp;·&nbsp; No data leaves your browser
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-light tracking-tight text-white leading-tight">
              Hacker Lab
            </h1>
          </motion.div>
        </div>

        {/* Tool list */}
        <div className="border-b border-white/6">
          {TOOLS.map((tool, i) => {
            const isOpen = active === tool.id;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                transition={{ duration:0.45, ease, delay: i * 0.04 }}
                className="border-b border-white/5 last:border-0"
              >
                <button
                  onClick={() => setActive(isOpen ? null : tool.id)}
                  className="w-full flex items-center gap-6 px-6 md:px-12 lg:px-20 py-5 text-left hover:bg-white/[0.012] transition-colors duration-150 group"
                >
                  {/* Index */}
                  <span className="font-mono text-xs text-index opacity-50 shrink-0 w-6 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Glyph */}
                  <span className={`font-mono text-xs w-8 shrink-0 transition-colors ${isOpen ? 'text-white/70' : 'text-white/25 group-hover:text-white/45'}`}>
                    {tool.glyph}
                  </span>

                  {/* Label + description */}
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                    <span className={`font-mono text-sm transition-colors ${isOpen ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>
                      {tool.label}
                    </span>
                    <span className="font-mono text-xs text-white/22 truncate hidden sm:block">
                      {tool.description}
                    </span>
                  </div>

                  {/* Toggle */}
                  <span className={`font-mono text-white/22 text-base shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                      exit={{ height:0, opacity:0 }} transition={{ duration:0.22, ease }}
                      style={{ overflow:'hidden' }}
                    >
                      <div className="px-6 md:px-12 lg:px-20 pb-8 pt-2 border-t border-white/5">
                        <div className="ml-0 sm:ml-20 max-w-xl">
                          {COMPONENTS[tool.id]}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

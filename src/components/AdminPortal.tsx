'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64
  createdAt: number;
}

interface Link {
  id: string;
  title: string;
  url: string;
  note: string;
  createdAt: number;
}

interface Secret {
  id: string;
  label: string;
  value: string; // stored as plaintext in memory, encrypted in localStorage
  createdAt: number;
}

type Tab = 'notes' | 'files' | 'links' | 'secrets';

// ─── Crypto helpers ───────────────────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password + 'doom.lat.admin.salt'));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    km,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptValue(text: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text));
  const combined = new Uint8Array(salt.byteLength + iv.byteLength + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, 16);
  combined.set(new Uint8Array(encrypted), 28);
  return btoa(String.fromCharCode(...combined));
}

async function decryptValue(ciphertext: string, password: string): Promise<string> {
  const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const data = combined.slice(28);
  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS = {
  get: <T>(key: string, fallback: T): T => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set: (key: string, value: unknown) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
  },
};

const KEYS = {
  passwordHash: 'admin_pw_hash',
  notes: 'admin_notes',
  files: 'admin_files',
  links: 'admin_links',
  secrets: 'admin_secrets_enc',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ── Notes Tab ──────────────────────────────────────────────────────────────────
function NotesTab() {
  const [notes, setNotes] = useState<Note[]>(() => LS.get(KEYS.notes, []));
  const [editing, setEditing] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [search, setSearch] = useState('');

  const save = (ns: Note[]) => { setNotes(ns); LS.set(KEYS.notes, ns); };

  const openNew = () => {
    const n: Note = { id: uid(), title: 'Untitled', body: '', createdAt: Date.now(), updatedAt: Date.now() };
    const ns = [n, ...notes];
    save(ns);
    setEditing(n);
    setTitle(n.title);
    setBody(n.body);
  };

  const selectNote = (n: Note) => { setEditing(n); setTitle(n.title); setBody(n.body); };

  const saveEdit = () => {
    if (!editing) return;
    const ns = notes.map(n => n.id === editing.id ? { ...n, title, body, updatedAt: Date.now() } : n);
    save(ns);
    setEditing(prev => prev ? { ...prev, title, body } : null);
  };

  const deleteNote = (id: string) => {
    save(notes.filter(n => n.id !== id));
    if (editing?.id === id) { setEditing(null); setTitle(''); setBody(''); }
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.body.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full gap-4">
      {/* Sidebar */}
      <div className="w-48 sm:w-56 shrink-0 flex flex-col gap-2">
        <input
          value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          className="w-full glass border border-white/8 px-3 py-2 font-mono text-xs text-white/60 placeholder:text-white/20 focus:outline-none focus:border-white/20 bg-transparent"
        />
        <button onClick={openNew} className="w-full py-2 btn-gradient font-mono text-xs">+ New Note</button>
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 min-h-0">
          {filtered.length === 0 && <p className="font-mono text-[10px] text-white/20 text-center pt-4">No notes</p>}
          {filtered.map(n => (
            <button
              key={n.id}
              onClick={() => selectNote(n)}
              className={`w-full text-left px-3 py-2 font-mono text-xs border transition-colors ${editing?.id === n.id ? 'bg-white/8 border-white/20 text-white' : 'glass border-white/5 text-white/40 hover:border-white/15 hover:text-white/70'}`}
            >
              <div className="truncate">{n.title || 'Untitled'}</div>
              <div className="text-[10px] text-white/20 mt-0.5">{new Date(n.updatedAt).toLocaleDateString()}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {editing ? (
          <>
            <div className="flex items-center gap-2">
              <input
                value={title} onChange={e => setTitle(e.target.value)}
                className="flex-1 glass border border-white/8 px-3 py-2 font-mono text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 bg-transparent"
                placeholder="Title"
              />
              <button onClick={saveEdit} className="px-4 py-2 btn-gradient font-mono text-xs shrink-0">Save</button>
              <button onClick={() => deleteNote(editing.id)} className="px-3 py-2 glass border border-white/8 font-mono text-xs text-white/30 hover:text-red-400 hover:border-red-400/30 transition-colors shrink-0">Del</button>
            </div>
            <textarea
              value={body} onChange={e => setBody(e.target.value)}
              onBlur={saveEdit}
              className="flex-1 glass border border-white/7 focus:border-white/18 p-4 font-mono text-xs text-white/70 placeholder:text-white/20 focus:outline-none resize-none bg-transparent leading-relaxed"
              placeholder="Write anything..."
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-mono text-xs text-white/15">Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Files Tab ──────────────────────────────────────────────────────────────────
function FilesTab() {
  const [files, setFiles] = useState<StoredFile[]>(() => LS.get(KEYS.files, []));
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const MAX_MB = 5;

  const storeFiles = (fs: StoredFile[]) => { setFiles(fs); LS.set(KEYS.files, fs); };

  const handleFile = (file: File) => {
    setError('');
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`${file.name} exceeds ${MAX_MB}MB limit.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const sf: StoredFile = {
        id: uid(), name: file.name, type: file.type,
        size: file.size, data: reader.result as string, createdAt: Date.now(),
      };
      storeFiles([sf, ...files]);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    Array.from(e.dataTransfer.files).forEach(handleFile);
  };

  const download = (f: StoredFile) => {
    const a = document.createElement('a');
    a.href = f.data; a.download = f.name; a.click();
  };

  const remove = (id: string) => storeFiles(files.filter(f => f.id !== id));

  const formatSize = (bytes: number) => bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border cursor-pointer p-6 text-center transition-colors ${dragging ? 'border-white/30 bg-white/5' : 'border-white/8 hover:border-white/18 glass'}`}
      >
        <input ref={inputRef} type="file" multiple className="hidden" onChange={e => Array.from(e.target.files ?? []).forEach(handleFile)} />
        <p className="font-mono text-xs text-white/40">Drop files here or tap to browse</p>
        <p className="font-mono text-[10px] text-white/20 mt-1">Max {MAX_MB}MB per file · stored in browser</p>
      </div>
      {error && <p className="font-mono text-xs text-red-400/70">{error}</p>}

      {/* File list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 min-h-0">
        {files.length === 0 && <p className="font-mono text-xs text-white/20 text-center pt-6">No files stored</p>}
        {files.map(f => (
          <div key={f.id} className="glass border border-white/7 flex items-center gap-3 px-4 py-3">
            {/* Preview for images */}
            {f.type.startsWith('image/') ? (
              <img src={f.data} alt={f.name} className="w-10 h-10 object-cover border border-white/10 shrink-0" />
            ) : (
              <div className="w-10 h-10 glass border border-white/8 flex items-center justify-center shrink-0">
                <span className="font-mono text-[9px] text-white/30 uppercase">{f.name.split('.').pop()}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs text-white/70 truncate">{f.name}</p>
              <p className="font-mono text-[10px] text-white/25">{formatSize(f.size)} &middot; {new Date(f.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => download(f)} className="px-3 py-1.5 glass border border-white/8 font-mono text-xs text-white/35 hover:text-white transition-colors">
                Save
              </button>
              <button onClick={() => remove(f.id)} className="px-3 py-1.5 glass border border-white/8 font-mono text-xs text-white/25 hover:text-red-400 hover:border-red-400/30 transition-colors">
                Del
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Links Tab ──────────────────────────────────────────────────────────────────
function LinksTab() {
  const [links, setLinks] = useState<Link[]>(() => LS.get(KEYS.links, []));
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');

  const save = (ls: Link[]) => { setLinks(ls); LS.set(KEYS.links, ls); };

  const add = () => {
    if (!url) return;
    const u = url.startsWith('http') ? url : 'https://' + url;
    save([{ id: uid(), title: title || u, url: u, note, createdAt: Date.now() }, ...links]);
    setTitle(''); setUrl(''); setNote(''); setAdding(false);
  };

  const remove = (id: string) => save(links.filter(l => l.id !== id));

  const filtered = links.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.url.toLowerCase().includes(search.toLowerCase()) ||
    l.note.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search links..."
          className="flex-1 glass border border-white/8 px-3 py-2 font-mono text-xs text-white/60 placeholder:text-white/20 focus:outline-none focus:border-white/20 bg-transparent" />
        <button onClick={() => setAdding(v => !v)} className="px-4 py-2 btn-gradient font-mono text-xs shrink-0">
          {adding ? 'Cancel' : '+ Add'}
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="glass border border-white/10 p-4 space-y-2">
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL *"
                className="w-full glass border border-white/8 px-3 py-2 font-mono text-xs text-white/60 placeholder:text-white/20 focus:outline-none focus:border-white/20 bg-transparent" />
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Label (optional)"
                className="w-full glass border border-white/8 px-3 py-2 font-mono text-xs text-white/60 placeholder:text-white/20 focus:outline-none focus:border-white/20 bg-transparent" />
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optional)"
                className="w-full glass border border-white/8 px-3 py-2 font-mono text-xs text-white/60 placeholder:text-white/20 focus:outline-none focus:border-white/20 bg-transparent" />
              <button onClick={add} className="px-5 py-2 btn-gradient font-mono text-xs">Save Link</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 min-h-0">
        {filtered.length === 0 && <p className="font-mono text-xs text-white/20 text-center pt-6">No links saved</p>}
        {filtered.map(l => (
          <div key={l.id} className="glass border border-white/7 px-4 py-3 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <a href={l.url} target="_blank" rel="noopener noreferrer"
                className="font-mono text-xs text-white/75 hover:text-white transition-colors truncate block">
                {l.title}
              </a>
              <p className="font-mono text-[10px] text-white/25 truncate mt-0.5">{l.url}</p>
              {l.note && <p className="font-mono text-[10px] text-white/35 mt-1">{l.note}</p>}
            </div>
            <button onClick={() => remove(l.id)} className="px-3 py-1.5 glass border border-white/8 font-mono text-xs text-white/25 hover:text-red-400 hover:border-red-400/30 transition-colors shrink-0">
              Del
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Secrets Tab ────────────────────────────────────────────────────────────────
function SecretsTab({ password }: { password: string }) {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copyMsg, setCopyMsg] = useState('');

  // Decrypt all secrets on mount
  useEffect(() => {
    const raw: { id: string; label: string; enc: string; createdAt: number }[] = LS.get(KEYS.secrets, []);
    Promise.all(
      raw.map(async r => {
        try {
          const val = await decryptValue(r.enc, password);
          return { id: r.id, label: r.label, value: val, createdAt: r.createdAt };
        } catch {
          return { id: r.id, label: r.label, value: '[decrypt failed]', createdAt: r.createdAt };
        }
      })
    ).then(s => { setSecrets(s); setLoaded(true); });
  }, [password]);

  const persistSecrets = async (ss: Secret[]) => {
    const encrypted = await Promise.all(
      ss.map(async s => ({
        id: s.id, label: s.label,
        enc: await encryptValue(s.value, password),
        createdAt: s.createdAt,
      }))
    );
    LS.set(KEYS.secrets, encrypted);
  };

  const add = async () => {
    if (!label || !value) return;
    const s: Secret = { id: uid(), label, value, createdAt: Date.now() };
    const next = [s, ...secrets];
    setSecrets(next);
    await persistSecrets(next);
    setLabel(''); setValue(''); setAdding(false);
  };

  const remove = async (id: string) => {
    const next = secrets.filter(s => s.id !== id);
    setSecrets(next);
    await persistSecrets(next);
  };

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopyMsg('Copied');
    setTimeout(() => setCopyMsg(''), 1500);
  };

  const toggleReveal = (id: string) => {
    setRevealed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (!loaded) return <div className="flex items-center justify-center h-full"><p className="font-mono text-xs text-white/20">Decrypting...</p></div>;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex gap-2">
        <button onClick={() => setAdding(v => !v)} className="px-4 py-2 btn-gradient font-mono text-xs">
          {adding ? 'Cancel' : '+ Add Secret'}
        </button>
        {copyMsg && <span className="font-mono text-xs text-white/40 self-center">{copyMsg}</span>}
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="glass border border-white/10 p-4 space-y-2">
              <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label (e.g. GitHub Token)"
                className="w-full glass border border-white/8 px-3 py-2 font-mono text-xs text-white/60 placeholder:text-white/20 focus:outline-none focus:border-white/20 bg-transparent" />
              <input value={value} onChange={e => setValue(e.target.value)} placeholder="Secret value" type="password"
                className="w-full glass border border-white/8 px-3 py-2 font-mono text-xs text-white/60 placeholder:text-white/20 focus:outline-none focus:border-white/20 bg-transparent" />
              <p className="font-mono text-[10px] text-white/20">Encrypted with AES-GCM using your admin password.</p>
              <button onClick={add} className="px-5 py-2 btn-gradient font-mono text-xs">Save Secret</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 min-h-0">
        {secrets.length === 0 && <p className="font-mono text-xs text-white/20 text-center pt-6">No secrets stored</p>}
        {secrets.map(s => (
          <div key={s.id} className="glass border border-white/7 px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs text-white/60 flex-1 truncate">{s.label}</span>
              <span className="font-mono text-[10px] text-white/20">{new Date(s.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 glass border border-white/6 px-3 py-1.5 font-mono text-xs text-white/50 truncate min-w-0">
                {revealed.has(s.id) ? s.value : '•'.repeat(Math.min(s.value.length, 24))}
              </div>
              <button onClick={() => toggleReveal(s.id)} className="px-2.5 py-1.5 glass border border-white/8 font-mono text-[10px] text-white/30 hover:text-white transition-colors shrink-0">
                {revealed.has(s.id) ? 'Hide' : 'Show'}
              </button>
              <button onClick={() => copy(s.value)} className="px-2.5 py-1.5 glass border border-white/8 font-mono text-[10px] text-white/30 hover:text-white transition-colors shrink-0">
                Copy
              </button>
              <button onClick={() => remove(s.id)} className="px-2.5 py-1.5 glass border border-white/8 font-mono text-[10px] text-white/25 hover:text-red-400 hover:border-red-400/30 transition-colors shrink-0">
                Del
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main AdminPortal Component ───────────────────────────────────────────────

export default function AdminPortal() {
  const [open, setOpen] = useState(false);
  const [authState, setAuthState] = useState<'idle' | 'setup' | 'login' | 'unlocked'>('idle');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [sessionPassword, setSessionPassword] = useState(''); // plaintext, only in memory
  const [tab, setTab] = useState<Tab>('notes');
  const [showTrigger, setShowTrigger] = useState(false);

  // Determine auth state on open
  const handleOpen = useCallback(() => {
    const hash = localStorage.getItem(KEYS.passwordHash);
    if (!hash) {
      setAuthState('setup');
    } else {
      setAuthState('login');
    }
    setPasswordInput('');
    setConfirmInput('');
    setAuthError('');
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setPasswordInput('');
    setConfirmInput('');
    setAuthError('');
    // Keep session unlocked so re-opening is instant within same session
  }, []);

  // Re-open directly unlocked if already have session password
  const handleTrigger = useCallback(() => {
    if (sessionPassword) {
      setOpen(true);
    } else {
      handleOpen();
    }
  }, [sessionPassword, handleOpen]);

  // ESC to close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) handleClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, handleClose]);

  // Show trigger dot after a short delay (so it's not instantly obvious on load)
  useEffect(() => {
    const t = setTimeout(() => setShowTrigger(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleSetup = async () => {
    setAuthError('');
    if (passwordInput.length < 6) { setAuthError('Password must be at least 6 characters.'); return; }
    if (passwordInput !== confirmInput) { setAuthError('Passwords do not match.'); return; }
    const hash = await hashPassword(passwordInput);
    localStorage.setItem(KEYS.passwordHash, hash);
    setSessionPassword(passwordInput);
    setAuthState('unlocked');
  };

  const handleLogin = async () => {
    setAuthError('');
    const storedHash = localStorage.getItem(KEYS.passwordHash) ?? '';
    const inputHash = await hashPassword(passwordInput);
    if (inputHash !== storedHash) {
      setAuthError('Incorrect password.');
      setPasswordInput('');
      return;
    }
    setSessionPassword(passwordInput);
    setAuthState('unlocked');
  };

  const handleChangePassword = async () => {
    if (passwordInput.length < 6) { setAuthError('Password must be at least 6 characters.'); return; }
    // Re-encrypt all secrets with new password
    const rawSecrets: { id: string; label: string; enc: string; createdAt: number }[] = LS.get(KEYS.secrets, []);
    const reEncrypted = await Promise.all(
      rawSecrets.map(async r => {
        try {
          const val = await decryptValue(r.enc, sessionPassword);
          const enc = await encryptValue(val, passwordInput);
          return { ...r, enc };
        } catch { return r; }
      })
    );
    LS.set(KEYS.secrets, reEncrypted);
    const hash = await hashPassword(passwordInput);
    localStorage.setItem(KEYS.passwordHash, hash);
    setSessionPassword(passwordInput);
    setPasswordInput('');
    setAuthError('Password updated.');
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'notes',   label: 'Notes'   },
    { id: 'files',   label: 'Files'   },
    { id: 'links',   label: 'Links'   },
    { id: 'secrets', label: 'Secrets' },
  ];

  return (
    <>
      {/* ── Hidden trigger dot ──────────────────────────────── */}
      <AnimatePresence>
        {showTrigger && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            onClick={handleTrigger}
            aria-label="Admin"
            className="fixed bottom-5 right-5 z-[9997] w-2 h-2 rounded-full bg-white/15 hover:bg-white/40 transition-colors duration-300"
          />
        )}
      </AnimatePresence>

      {/* ── Portal overlay ──────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/92 backdrop-blur-md"
              onClick={handleClose}
            />

            {/* Panel */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-4xl h-[85vh] max-h-[720px] glass-strong border border-white/10 flex flex-col overflow-hidden z-10"
              onClick={e => e.stopPropagation()}
            >
              {/* Auth screens */}
              {(authState === 'setup' || authState === 'login') && (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                  {/* Corner marks */}
                  <div className="absolute top-0 left-0 w-10 h-10 border-t border-l border-white/10" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b border-r border-white/8" />

                  <div className="text-center">
                    <p className="font-mono text-[10px] text-white/20 uppercase tracking-[0.3em] mb-2">Admin Portal</p>
                    <h2 className="font-display text-3xl text-gradient font-light">
                      {authState === 'setup' ? 'Set Password' : 'Enter Password'}
                    </h2>
                    {authState === 'setup' && (
                      <p className="font-mono text-xs text-white/25 mt-2 max-w-xs">
                        This password protects your admin portal and encrypts your secrets. Choose carefully — it cannot be recovered.
                      </p>
                    )}
                  </div>

                  <div className="w-full max-w-xs space-y-3">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (authState === 'setup' ? handleSetup() : handleLogin())}
                      placeholder="Password"
                      autoFocus
                      className="w-full glass border border-white/10 focus:border-white/25 px-4 py-3 font-mono text-sm text-white placeholder:text-white/20 focus:outline-none bg-transparent text-center tracking-widest"
                    />
                    {authState === 'setup' && (
                      <input
                        type="password"
                        value={confirmInput}
                        onChange={e => setConfirmInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSetup()}
                        placeholder="Confirm password"
                        className="w-full glass border border-white/10 focus:border-white/25 px-4 py-3 font-mono text-sm text-white placeholder:text-white/20 focus:outline-none bg-transparent text-center tracking-widest"
                      />
                    )}
                    {authError && <p className="font-mono text-xs text-red-400/70 text-center">{authError}</p>}
                    <button
                      onClick={authState === 'setup' ? handleSetup : handleLogin}
                      className="w-full py-3 btn-gradient font-mono text-sm"
                    >
                      {authState === 'setup' ? 'Create Portal' : 'Unlock'}
                    </button>
                  </div>
                </div>
              )}

              {/* Unlocked portal */}
              {authState === 'unlocked' && (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-4 px-5 py-4 border-b border-white/6 shrink-0">
                    <p className="font-mono text-[10px] text-white/20 uppercase tracking-[0.2em]">Admin Portal</p>
                    <div className="flex-1" />
                    {/* Tab bar */}
                    <div className="flex gap-1">
                      {TABS.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setTab(t.id)}
                          className={`px-3 py-1.5 font-mono text-xs border transition-colors ${tab === t.id ? 'bg-white/8 border-white/20 text-white' : 'glass border-white/5 text-white/30 hover:border-white/15 hover:text-white/60'}`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-7 h-7 glass border border-white/8 flex items-center justify-center text-white/30 hover:text-white transition-colors shrink-0"
                      aria-label="Close"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Tab content */}
                  <div className="flex-1 overflow-hidden p-5">
                    {tab === 'notes'   && <NotesTab />}
                    {tab === 'files'   && <FilesTab />}
                    {tab === 'links'   && <LinksTab />}
                    {tab === 'secrets' && <SecretsTab password={sessionPassword} />}
                  </div>

                  {/* Footer — change password */}
                  <div className="flex items-center gap-3 px-5 py-3 border-t border-white/5 shrink-0">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      placeholder="New password..."
                      className="w-44 glass border border-white/6 px-3 py-1.5 font-mono text-xs text-white/50 placeholder:text-white/15 focus:outline-none focus:border-white/18 bg-transparent"
                    />
                    <button onClick={handleChangePassword} className="px-4 py-1.5 glass border border-white/8 font-mono text-xs text-white/30 hover:text-white/70 transition-colors">
                      Change Password
                    </button>
                    {authError && <p className="font-mono text-xs text-white/35">{authError}</p>}
                    <div className="flex-1" />
                    <p className="font-mono text-[10px] text-white/12">doom.lat admin</p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

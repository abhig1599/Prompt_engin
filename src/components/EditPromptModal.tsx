'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import TagInput from './TagInput';

import { Prompt } from '@/hooks/usePrompts';

const IT = "'Inter Tight', sans-serif";
const MODELS = ['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'DALL·E 3', 'Stable Diffusion', 'Adobe Firefly', 'Flux', 'Other'];
const MAX_CHARS = 1000;

interface SaveData {
  prompt: string;
  imageFile?: File | null;
  image?: string | null;
  tags?: string[];
  model?: string | null;
  inputsNeeded?: string | null;
}

interface Props { prompt: Prompt; onClose: () => void; onSave: (id: string, data: SaveData) => Promise<void>; }

const fieldStyle = {
  display: 'flex' as const,
  flexDirection: 'column' as const,
  gap: '6px',
};
const labelStyle = {
  fontFamily: IT,
  fontWeight: 500,
  fontSize: '11px',
  color: '#808080',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
};
const inputStyle = {
  fontFamily: IT,
  fontWeight: 400,
  fontSize: '14px',
  color: '#222222',
  background: '#ffffff',
  border: '1px solid #dedede',
  borderRadius: '8px',
  padding: '8px 12px',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s',
};

export default function EditPromptModal({ prompt, onClose, onSave }: Props) {
  const [val, setVal] = useState(prompt.prompt);
  const [tags, setTags] = useState<string[]>(prompt.tags || []);
  const [inputsNeeded, setInputsNeeded] = useState(prompt.inputsNeeded || '');
  const [model, setModel] = useState<string>(prompt.model || '');
  const [preview, setPreview] = useState<string | null>(prompt.image || null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const readFile = useCallback((file: File) => {
    const r = new FileReader();
    r.onload = e => { setPreview(e.target?.result as string); setFile(file); };
    r.readAsDataURL(file);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!val.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(prompt.id, { prompt: val.trim(), imageFile: file, image: preview, tags, model: model || null, inputsNeeded: inputsNeeded.trim() || null });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(34,34,34,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '32px',
          width: '100%',
          maxWidth: '460px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: IT, fontWeight: 300, fontSize: '32px', color: '#222222', lineHeight: 1, margin: 0 }}>
            Edit Prompt
          </h2>
          <button
            onClick={onClose}
            style={{ fontFamily: IT, fontSize: '20px', color: '#808080', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '0 0 0 16px' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Image drop zone */}
          <label
            style={{
              display: 'block',
              background: dragOver ? '#f0f0f0' : '#f7f7f7',
              border: `1px dashed ${dragOver ? '#222222' : '#b8b8b8'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              overflow: 'hidden',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f?.type.startsWith('image/')) readFile(f); }}
          >
            {preview ? (
              <div style={{ position: 'relative', height: '180px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0'; }}
                >
                  <span style={{ fontFamily: IT, fontSize: '13px', color: '#fff' }}>Click to change</span>
                </div>
              </div>
            ) : (
              <div style={{ height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#808080" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span style={{ fontFamily: IT, fontSize: '12px', color: '#808080' }}>Drop image or click to browse</span>
              </div>
            )}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
          </label>

          {/* Prompt */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Prompt <span style={{ color: '#222222' }}>*</span></label>
            <textarea
              rows={4}
              maxLength={MAX_CHARS}
              value={val}
              onChange={e => setVal(e.target.value)}
              required
              autoFocus
              placeholder="e.g. A cinematic photo of a neon-lit Tokyo alley…"
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
              onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#222222'; }}
              onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#dedede'; }}
            />
            <span style={{ fontFamily: IT, fontSize: '11px', color: '#b8b8b8', textAlign: 'right' }}>{val.length} / {MAX_CHARS}</span>
          </div>

          {/* Tags */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Tags <span style={{ textTransform: 'none', fontWeight: 400, letterSpacing: 0, color: '#b8b8b8' }}>(Enter or comma)</span></label>
            <TagInput tags={tags} onChange={setTags} placeholder="Add tag…" />
          </div>

          {/* What to provide */}
          <div style={fieldStyle}>
            <label style={labelStyle}>What to provide to AI</label>
            <input type="text" value={inputsNeeded} onChange={e => setInputsNeeded(e.target.value)} placeholder="e.g. Your photo, product image…" style={inputStyle}
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#222222'; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#dedede'; }}
            />
          </div>

          {/* Model */}
          <div style={fieldStyle}>
            <label style={labelStyle}>AI Model</label>
            <select value={model} onChange={e => setModel(e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
              <option value="">— Select model —</option>
              {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, fontFamily: IT, fontWeight: 500, fontSize: '13px', padding: '9px 0', borderRadius: '8px', border: '1px solid #dedede', background: 'transparent', color: '#222222', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={!val.trim() || saving} style={{ flex: 1, fontFamily: IT, fontWeight: 500, fontSize: '13px', padding: '9px 0', borderRadius: '8px', border: 'none', background: val.trim() ? '#222222' : '#b8b8b8', color: '#ffffff', cursor: val.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.15s' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';
import { useState, KeyboardEvent } from 'react';

const IT = "'Inter Tight', sans-serif";
interface Props { tags: string[]; onChange: (t: string[]) => void; placeholder?: string; id?: string; }

export default function TagInput({ tags, onChange, placeholder = 'Add tag…', id }: Props) {
  const [input, setInput] = useState('');

  const addTag = (raw: string) => {
    const t = raw.trim().replace(/^#+/, '');
    if (!t || tags.includes(t)) return;
    onChange([...tags, t]);
    setInput('');
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); }
    if (e.key === 'Backspace' && !input && tags.length) onChange(tags.slice(0, -1));
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '6px 10px', border: '1px solid #dedede', borderRadius: '8px', background: '#ffffff', minHeight: '40px', alignItems: 'center' }}>
      {tags.map((t, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: IT, fontWeight: 500, fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#e9e9e9', color: '#4d4d4d' }}>
          {t}
          <button type="button" onClick={() => onChange(tags.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#808080', fontSize: '13px', lineHeight: 1 }}>×</button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => { if (input.trim()) addTag(input); }}
        placeholder={tags.length === 0 ? placeholder : ''}
        style={{ fontFamily: IT, fontWeight: 400, fontSize: '13px', color: '#222222', background: 'none', border: 'none', outline: 'none', minWidth: '100px', flex: 1 }}
      />
    </div>
  );
}

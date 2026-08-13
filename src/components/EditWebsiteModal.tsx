'use client';
import { useState, useRef, useEffect } from 'react';
import type { Website } from '@/hooks/useWebsites';

const IT = "'Inter Tight', sans-serif";

interface Props {
  website: Website;
  onClose: () => void;
  onSave: (id: string, data: Partial<Omit<Website, 'id' | 'createdAt' | 'isOwner'>>) => Promise<void>;
}

export default function EditWebsiteModal({ website, onClose, onSave }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  
  const [name, setName] = useState(website.name);
  const [url, setUrl] = useState(website.url);
  const [tags, setTags] = useState((website.tags || []).join(', '));
  const [faviconUrl, setFaviconUrl] = useState(website.faviconUrl || '');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let finalFavicon = faviconUrl.trim();
    if (!finalFavicon && url.trim()) {
      try {
        const urlObj = new URL(url.trim());
        finalFavicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
      } catch {
        // invalid URL, ignore
      }
    }

      await onSave(website.id, {
        name: name.trim(),
        url: url.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        faviconUrl: finalFavicon || null
      });
    setLoading(false);
    onClose();
  };

  const inputStyle = {
    width: '100%',
    fontFamily: IT,
    fontWeight: 400,
    fontSize: '14px',
    color: '#222222',
    background: '#f9f9f9',
    border: '1px solid #dedede',
    borderRadius: '8px',
    padding: '12px 16px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    fontFamily: IT,
    fontWeight: 500,
    fontSize: '13px',
    color: '#222222',
    marginBottom: '6px',
  };

  return (
    <div
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 150,
        background: 'rgba(34,34,34,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '32px',
          width: '100%',
          maxWidth: '480px',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: IT, fontWeight: 300, fontSize: '32px', color: '#222222', lineHeight: 1, margin: 0 }}>
            Edit Website
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ fontFamily: IT, fontSize: '20px', color: '#808080', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '0 0 0 16px' }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Website Name *</label>
            <input required value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="e.g. Awwwards" />
          </div>
          <div>
            <label style={labelStyle}>URL *</label>
            <input required type="url" value={url} onChange={e => setUrl(e.target.value)} style={inputStyle} placeholder="https://..." />
          </div>
          <div>
            <label style={labelStyle}>Tags (comma separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} style={inputStyle} placeholder="e.g. Design, Inspiration" />
          </div>
          <div>
            <label style={labelStyle}>Favicon URL (Optional)</label>
            <input value={faviconUrl} onChange={e => setFaviconUrl(e.target.value)} style={inputStyle} placeholder="Leave blank to auto-fetch" />
          </div>

          <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid #dedede' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, fontFamily: IT, fontWeight: 500, fontSize: '13px', padding: '12px 0', borderRadius: '8px', border: '1px solid #dedede', background: 'transparent', color: '#222222', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading || !name.trim() || !url.trim()} style={{ flex: 1, fontFamily: IT, fontWeight: 500, fontSize: '13px', padding: '10px 0', borderRadius: '8px', border: 'none', background: (name.trim() && url.trim()) ? '#222222' : '#b8b8b8', color: '#ffffff', cursor: (name.trim() && url.trim()) ? 'pointer' : 'not-allowed', transition: 'background 0.15s' }}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

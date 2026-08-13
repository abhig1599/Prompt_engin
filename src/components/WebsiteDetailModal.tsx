'use client';
import { useRef, useEffect } from 'react';
import type { Website } from '@/hooks/useWebsites';

const IT = "'Inter Tight', sans-serif";

interface Props {
  website: Website;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export default function WebsiteDetailModal({ website: w, onClose, onEdit, onDelete }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const dateStr = new Date(w.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '32px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {w.faviconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={w.faviconUrl} alt={w.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'contain', background: '#f5f5f5', padding: '4px' }} />
            ) : (
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: IT, fontWeight: 700, fontSize: '20px', color: '#fff' }}>{w.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div>
              <h2 style={{ fontFamily: IT, fontWeight: 500, fontSize: '24px', color: '#222222', lineHeight: 1.1, margin: '0 0 6px' }}>
                {w.name}
              </h2>
              <a href={w.url} target="_blank" rel="noreferrer" style={{ fontFamily: IT, fontWeight: 400, fontSize: '13px', color: '#1873d3', textDecoration: 'none' }}>
                {w.url}
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ fontFamily: IT, fontSize: '20px', color: '#808080', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '0 0 0 16px' }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Tags */}
          {w.tags.length > 0 && (
            <div>
              <p style={{ fontFamily: IT, fontWeight: 500, fontSize: '11px', color: '#808080', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Tags</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {w.tags.map(t => (
                  <span key={t} style={{
                    fontFamily: IT, fontWeight: 500, fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: '#e9e9e9', color: '#4d4d4d',
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Date Added */}
          <div>
            <p style={{ fontFamily: IT, fontWeight: 500, fontSize: '11px', color: '#808080', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Date Added</p>
            <p style={{ fontFamily: IT, fontWeight: 400, fontSize: '14px', color: '#222222', margin: 0 }}>{dateStr}</p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', paddingTop: '20px', borderTop: '1px solid #dedede' }}>
            {w.isOwner && (
              <>
                <button
                  onClick={onEdit}
                  style={{ flex: 1, fontFamily: IT, fontWeight: 500, fontSize: '13px', padding: '12px 0', borderRadius: '8px', border: '1px solid #dedede', background: 'transparent', color: '#222', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(w.id)}
                  style={{ flex: 1, fontFamily: IT, fontWeight: 500, fontSize: '13px', padding: '12px 0', borderRadius: '8px', border: '1px solid #dedede', background: 'transparent', color: '#d93025', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </>
            )}
            <button
              onClick={() => window.open(w.url, '_blank')}
              style={{ flex: 1, fontFamily: IT, fontWeight: 500, fontSize: '13px', padding: '12px 0', borderRadius: '8px', border: 'none', background: '#222222', color: '#ffffff', cursor: 'pointer' }}
            >
              Visit Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

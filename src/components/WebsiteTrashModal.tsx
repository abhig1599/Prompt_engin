'use client';
import { useRef, useEffect } from 'react';
import type { TrashedWebsite } from '@/hooks/useWebsites';

const IT = "'Inter Tight', sans-serif";

interface Props {
  trash: TrashedWebsite[];
  onClose: () => void;
  onRecover: (id: string) => void;
  onPurge: (id: string) => void;
}

export default function WebsiteTrashModal({ trash, onClose, onRecover, onPurge }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

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
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: IT, fontWeight: 300, fontSize: '32px', color: '#222222', lineHeight: 1, margin: 0 }}>
            Trash ({trash.length})
          </h2>
          <button
            onClick={onClose}
            style={{ fontFamily: IT, fontSize: '20px', color: '#808080', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '0 0 0 16px' }}
          >
            ×
          </button>
        </div>

        {trash.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ fontFamily: IT, fontWeight: 400, fontSize: '15px', color: '#808080', margin: 0 }}>
              Trash is empty.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontFamily: IT, fontWeight: 400, fontSize: '13px', color: '#808080', margin: '0 0 8px' }}>
              Items in trash will be permanently deleted after 30 days.
            </p>
            {trash.map(w => (
              <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #dedede' }}>
                <div style={{ minWidth: 0, paddingRight: '16px' }}>
                  <p style={{ fontFamily: IT, fontWeight: 500, fontSize: '15px', color: '#222222', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {w.name}
                  </p>
                  <p style={{ fontFamily: IT, fontWeight: 400, fontSize: '12px', color: '#808080', margin: 0 }}>
                    Deleted {new Date(w.deletedAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => onRecover(w.id)}
                    style={{ fontFamily: IT, fontWeight: 500, fontSize: '12px', padding: '6px 12px', borderRadius: '6px', background: '#222222', color: '#ffffff', border: 'none', cursor: 'pointer' }}
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => onPurge(w.id)}
                    style={{ fontFamily: IT, fontWeight: 500, fontSize: '12px', padding: '6px 12px', borderRadius: '6px', background: 'transparent', color: '#d93025', border: '1px solid #d93025', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

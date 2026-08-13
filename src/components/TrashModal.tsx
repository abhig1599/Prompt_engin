'use client';
import { useRef } from 'react';
import type { TrashedPrompt } from '@/hooks/usePrompts';

const IT = "'Inter Tight', sans-serif";
interface Props { trash: TrashedPrompt[]; onClose: () => void; onRecover: (id: string) => void; onPurge: (id: string) => void; }

export default function TrashModal({ trash, onClose, onRecover, onPurge }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} onClick={e => { if (e.target === ref.current) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(34,34,34,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#ffffff', borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: IT, fontWeight: 300, fontSize: '32px', color: '#222222', lineHeight: 1, margin: 0 }}>Trash</h2>
          <button onClick={onClose} style={{ fontFamily: IT, fontSize: '20px', color: '#808080', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 16px' }}>×</button>
        </div>
        {trash.length === 0 ? (
          <p style={{ fontFamily: IT, fontWeight: 400, fontSize: '14px', color: '#808080', textAlign: 'center', padding: '40px 0' }}>Trash is empty</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {trash.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', borderRadius: '8px', background: '#f7f7f7', border: '1px solid #dedede' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: IT, fontWeight: 400, fontSize: '13px', color: '#222222', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.prompt}</p>
                  <p style={{ fontFamily: IT, fontWeight: 400, fontSize: '11px', color: '#808080', margin: 0 }}>Deleted {new Date(p.deletedAt).toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => onRecover(p.id)} style={{ fontFamily: IT, fontWeight: 500, fontSize: '12px', padding: '5px 12px', borderRadius: '8px', border: '1px solid #dedede', background: 'transparent', color: '#222222', cursor: 'pointer' }}>Recover</button>
                  <button onClick={() => onPurge(p.id)} style={{ fontFamily: IT, fontWeight: 500, fontSize: '12px', padding: '5px 12px', borderRadius: '8px', border: 'none', background: '#222222', color: '#ffffff', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

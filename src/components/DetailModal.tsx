'use client';
import { useRef, useEffect } from 'react';
import type { Prompt } from '@/hooks/usePrompts';

const IT = "'Inter Tight', sans-serif";

interface Props {
  prompt: Prompt;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onCopy: (msg: string) => void;
}

export default function DetailModal({ prompt, onClose, onEdit, onDelete, onCopy }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt).then(() => {
      onCopy('Copied to clipboard');
    });
  };

  const handleDelete = () => {
    onDelete(prompt.id);
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
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: IT, fontWeight: 300, fontSize: '32px', color: '#222222', lineHeight: 1, margin: 0 }}>
            Prompt Details
          </h2>
          <button
            onClick={onClose}
            style={{ fontFamily: IT, fontSize: '20px', color: '#808080', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '0 0 0 16px' }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Image */}
          {prompt.image && (
            <div style={{
              width: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#e9e9e9',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={prompt.image} alt="Prompt visual" style={{ width: '100%', display: 'block', objectFit: 'contain' }} />
            </div>
          )}

          {/* Model and Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {prompt.model && (
              <span style={{
                fontFamily: IT, fontWeight: 600, fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#222222', color: '#ffffff',
              }}>
                {prompt.model}
              </span>
            )}
            {prompt.tags?.map((t, i) => (
              <span key={i} style={{
                fontFamily: IT, fontWeight: 500, fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#e9e9e9', color: '#4d4d4d',
              }}>
                {t}
              </span>
            ))}
          </div>

          {/* Prompt Content */}
          <div style={{
            background: '#f9f9f9',
            border: '1px solid #dedede',
            borderRadius: '8px',
            padding: '16px',
            position: 'relative',
          }}>
            <p style={{
              fontFamily: IT, fontWeight: 400, fontSize: '14px', color: '#222222', lineHeight: 1.6, margin: 0,
              whiteSpace: 'pre-wrap',
            }}>
              {prompt.prompt}
            </p>
            <button
              onClick={handleCopy}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                fontFamily: IT, fontWeight: 500, fontSize: '11px', padding: '4px 8px',
                borderRadius: '4px', border: '1px solid #dedede', background: '#ffffff', color: '#222222',
                cursor: 'pointer',
              }}
            >
              Copy
            </button>
          </div>

          {/* Inputs Needed */}
          {prompt.inputsNeeded && (
            <div>
              <p style={{ fontFamily: IT, fontWeight: 500, fontSize: '11px', color: '#808080', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Inputs Needed</p>
              <p style={{ fontFamily: IT, fontWeight: 400, fontSize: '13px', color: '#222222', margin: 0 }}>{prompt.inputsNeeded}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid #dedede' }}>
            <button
              onClick={onClose}
              style={{ flex: 1, fontFamily: IT, fontWeight: 500, fontSize: '13px', padding: '9px 0', borderRadius: '8px', border: '1px solid #dedede', background: 'transparent', color: '#222222', cursor: 'pointer' }}
            >
              Close
            </button>
            {prompt.isOwner && (
              <>
                <button
                  onClick={onEdit}
                  style={{ flex: 1, fontFamily: IT, fontWeight: 500, fontSize: '13px', padding: '9px 0', borderRadius: '8px', border: '1px solid #222', background: 'transparent', color: '#222', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  style={{ flex: 1, fontFamily: IT, fontWeight: 500, fontSize: '13px', padding: '9px 0', borderRadius: '8px', border: 'none', background: '#222222', color: '#ffffff', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

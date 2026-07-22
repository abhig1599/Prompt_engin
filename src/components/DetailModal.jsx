// src/components/DetailModal.jsx — Caldera style
import { useState, useEffect, useRef } from 'react';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DetailModal({ prompt: p, onClose, onFav, onCopy }) {
  const [copied, setCopied] = useState(false);
  const backdropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(p.prompt).then(() => {
      setCopied(true);
      onCopy('Prompt copied!');
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="modal-box modal-lg">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>

        <div className="detail-layout">
          {/* Left — Image / Ember block */}
          <div className="detail-img-col">
            {p.image
              ? <img src={p.image} alt="Prompt visual" />
              : <div className="detail-no-img">PROMPT</div>
            }
          </div>

          {/* Right — Info */}
          <div className="detail-info-col">

            {/* Tags — Sulfur pills */}
            {(p.tags?.length > 0 || p.model) && (
              <div className="detail-tags">
                {p.tags?.map(t => <span key={t} className="tag">{t}</span>)}
                {p.model && <span className="tag tag-model">{p.model}</span>}
              </div>
            )}

            {/* Prompt box */}
            <div className="detail-prompt-box">
              <div className="detail-prompt-label">Prompt</div>
              <p className="detail-prompt-text">{p.prompt}</p>
            </div>

            {/* Copy CTA — Ember pill */}
            <button
              className={`detail-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ Copied to clipboard!' : '⎘ Copy Prompt'}
            </button>

            {/* Fav — secondary 40px button */}
            <button
              className={`detail-fav-btn ${p.fav ? 'active' : ''}`}
              onClick={() => onFav(p.id)}
            >
              {p.fav ? '❤ Saved to Favorites' : '♡ Add to Favorites'}
            </button>

            {/* Model */}
            {p.model && (
              <div className="detail-meta">
                Generated with <span className="model-badge">{p.model}</span>
              </div>
            )}

            <div className="detail-date">Added {formatDate(p.createdAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

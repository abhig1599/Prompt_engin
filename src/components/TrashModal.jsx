// src/components/TrashModal.jsx — Caldera style
import { useState, useEffect, useRef } from 'react';

const TRASH_TTL_DAYS = 30;

function daysRemaining(deletedAt) {
  const ms      = Date.now() - new Date(deletedAt).getTime();
  const elapsed = Math.floor(ms / (1000 * 60 * 60 * 24));
  return Math.max(0, TRASH_TTL_DAYS - elapsed);
}

function formatDeletedDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function CountdownPill({ days }) {
  const cls =
    days <= 3  ? 'countdown-pill danger'  :
    days <= 7  ? 'countdown-pill warning' :
    days <= 14 ? 'countdown-pill amber'   :
                 'countdown-pill safe';
  return (
    <span className={cls}>
      {days === 0 ? 'Expiring today' : `${days}d left`}
    </span>
  );
}

function TrashRow({ item, onRecover, onPurge }) {
  const [confirmPurge, setConfirmPurge] = useState(false);
  const days = daysRemaining(item.deletedAt);

  return (
    <div className="trash-row">
      {/* Left — info */}
      <div className="trash-row-info">
        <div className="trash-row-top">
          <span className="trash-row-prompt">{item.prompt}</span>
          <CountdownPill days={days} />
        </div>
        <div className="trash-row-meta">
          {item.model && <span className="tag tag-model">{item.model}</span>}
          {item.tags?.slice(0, 3).map(t => (
            <span key={t} className="tag">{t}</span>
          ))}
          <span className="trash-row-date">Deleted {formatDeletedDate(item.deletedAt)}</span>
        </div>
      </div>

      {/* Right — actions */}
      <div className="trash-row-actions">
        <button
          className="trash-recover-btn"
          onClick={() => onRecover(item.id)}
        >
          Recover
        </button>

        {!confirmPurge ? (
          <button
            className="trash-purge-btn"
            onClick={() => setConfirmPurge(true)}
            title="Permanently delete"
          >
            Delete Forever
          </button>
        ) : (
          <div className="trash-purge-confirm">
            <span>Sure?</span>
            <button className="trash-purge-yes" onClick={() => onPurge(item.id)}>Yes</button>
            <button className="trash-purge-no"  onClick={() => setConfirmPurge(false)}>No</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrashModal({ trash, onClose, onRecover, onPurge }) {
  const backdropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="modal-box modal-lg trash-modal">
        {/* Header */}
        <div className="trash-modal-header">
          <div className="trash-modal-title-wrap">
            <h2 className="trash-modal-title">TRASH</h2>
            {trash.length > 0 && (
              <span className="trash-modal-subtitle">
                Prompts are permanently deleted after {TRASH_TTL_DAYS} days
              </span>
            )}
          </div>
          <button className="modal-close-btn trash-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div className="trash-modal-body">
          {trash.length === 0 ? (
            <div className="trash-empty">
              <div className="trash-empty-icon">🗑</div>
              <h3 className="trash-empty-title">Your trash is clean</h3>
              <p className="trash-empty-sub">Deleted prompts will appear here for 30 days before being permanently removed.</p>
            </div>
          ) : (
            <div className="trash-list">
              {[...trash].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt)).map(item => (
                <TrashRow
                  key={item.id}
                  item={item}
                  onRecover={onRecover}
                  onPurge={onPurge}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

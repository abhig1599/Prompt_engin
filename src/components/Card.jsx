// src/components/Card.jsx — Caldera style
import { useState, useCallback } from 'react';

export default function Card({ prompt: p, onFav, onCopy, onClick }) {
  const [copied, setCopied]   = useState(false);
  const [popFav, setPopFav]   = useState(false);

  const handleCopy = useCallback((e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(p.prompt).then(() => {
      setCopied(true);
      onCopy('Prompt copied!');
      setTimeout(() => setCopied(false), 1800);
    });
  }, [p.prompt, onCopy]);

  const handleFav = useCallback((e) => {
    e.stopPropagation();
    onFav(p.id);
    setPopFav(true);
    setTimeout(() => setPopFav(false), 400);
  }, [p.id, onFav]);

  return (
    <article className="card" onClick={() => onClick(p.id)}>
      {/* Image / Ember placeholder block */}
      {p.image ? (
        <div className="card-img-wrap">
          <img className="card-img" src={p.image} alt="Prompt visual" loading="lazy" />
        </div>
      ) : (
        <div className="card-no-img">PROMPT</div>
      )}

      {/* Fav button */}
      <button
        className={`card-fav-btn ${p.fav ? 'active' : ''} ${popFav ? 'pop' : ''}`}
        aria-label={p.fav ? 'Remove from favorites' : 'Add to favorites'}
        onClick={handleFav}
      >
        {p.fav ? '❤' : '♡'}
      </button>

      {/* Card body — 40px padding */}
      <div className="card-body">
        {(p.tags?.length > 0 || p.model) && (
          <div className="card-tags">
            {/* Sulfur tags */}
            {p.tags?.map(t => <span key={t} className="tag">{t}</span>)}
            {/* Ember model badge */}
            {p.model && <span className="tag tag-model">{p.model}</span>}
          </div>
        )}
        <p className="card-prompt">{p.prompt}</p>
      </div>

      {/* Copy button — Ember pill, shows on hover */}
      <button
        className={`card-copy-btn ${copied ? 'copied' : ''}`}
        onClick={handleCopy}
      >
        {copied ? '✓ Copied!' : '⎘ Copy Prompt'}
      </button>
    </article>
  );
}

import { useState, useCallback, useEffect } from 'react';

/* Map model names → the URL to open (prompt is appended as a query param) */
const MODEL_URLS = {
  'ChatGPT':           (p) => `https://chat.openai.com/?q=${encodeURIComponent(p)}`,
  'Gemini':            (p) => `https://gemini.google.com/app?q=${encodeURIComponent(p)}`,
  'Gemini Nano':       (p) => `https://gemini.google.com/app?q=${encodeURIComponent(p)}`,
  'Google Imagen':     (p) => `https://gemini.google.com/app?q=${encodeURIComponent(p)}`,
  'Claude':            (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}`,
  'Midjourney':        (p) => `https://www.midjourney.com/imagine?q=${encodeURIComponent(p)}`,
  'DALL·E 3':          (p) => `https://labs.openai.com/`,
  'Stable Diffusion':  (p) => `https://stablediffusionweb.com/`,
  'Adobe Firefly':     (p) => `https://firefly.adobe.com/`,
  'Flux':              (p) => `https://fal.ai/models/fal-ai/flux/dev`,
  'Other':             (p) => `https://chat.openai.com/?q=${encodeURIComponent(p)}`,
};

function getModelUrl(model, prompt) {
  if (!model) return `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`;
  const builder = MODEL_URLS[model];
  return builder ? builder(prompt) : `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`;
}

export default function Card({ prompt: p, onFav, onCopy, onClick }) {
  const [copied,     setCopied]     = useState(false);
  const [popFav,     setPopFav]     = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    if (p.image) {
      const img = new Image();
      img.src = p.image;
      img.onload = () => {
        if (img.naturalHeight > img.naturalWidth) {
          setIsPortrait(true);
        } else {
          setIsPortrait(false);
        }
      };
    } else {
      setIsPortrait(false);
    }
  }, [p.image]);

  const handleCopy = useCallback((e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(p.prompt).then(() => {
      setCopied(true);
      onCopy('Prompt copied!');
      setTimeout(() => setCopied(false), 1800);
    });
  }, [p.prompt, onCopy]);

  const handleTry = useCallback((e) => {
    e.stopPropagation();
    const url = getModelUrl(p.model, p.prompt);
    window.open(url, '_blank', 'noopener,noreferrer');
    onCopy(`Opening in ${p.model || 'ChatGPT'}…`);
  }, [p.model, p.prompt, onCopy]);

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
        <div className={`card-img-wrap ${isPortrait ? 'card-img-portrait' : ''}`}>
          <img
            className="card-img"
            src={p.image}
            alt="Prompt visual"
            loading="lazy"
            onLoad={(e) => {
              if (e.target.naturalHeight > e.target.naturalWidth) {
                setIsPortrait(true);
              }
            }}
          />
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

      {/* Card body */}
      <div className="card-body">
        {(p.tags?.length > 0 || p.model) && (
          <div className="card-tags">
            {p.tags?.map(t => <span key={t} className="tag">{t}</span>)}
            {p.model && <span className="tag tag-model">{p.model}</span>}
          </div>
        )}
        {/* Truncated prompt text — 3 lines max */}
        <p className="card-prompt">{p.prompt}</p>
      </div>

      {/* Hover action buttons row */}
      <div className="card-actions">
        <button
          className={`card-action-btn card-copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Copy prompt to clipboard"
        >
          {copied ? 'Copied!' : 'Copy Prompt'}
        </button>
        <button
          className="card-action-btn card-try-btn"
          onClick={handleTry}
          title={`Open in ${p.model || 'ChatGPT'}`}
        >
          Try Prompt
        </button>
      </div>
    </article>
  );
}

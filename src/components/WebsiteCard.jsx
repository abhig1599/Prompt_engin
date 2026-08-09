// src/components/WebsiteCard.jsx — Firecrawl Design System
import { useState, useCallback } from 'react';

function formatDate(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseWebsiteUrl(promptText, inputsNeeded) {
  if (inputsNeeded && /^https?:\/\/[^\s]+/i.test(inputsNeeded.trim())) {
    return inputsNeeded.trim();
  }
  if (promptText) {
    const match = promptText.match(/https?:\/\/[^\s)]+/i);
    if (match) return match[0];
  }
  return '';
}

function extractDomain(url) {
  if (url) {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    } catch { /* fallback */ }
  }
  return '';
}

function cleanTitle(promptText) {
  if (!promptText) return 'Untitled Website';
  const line = promptText.split('\n')[0].replace(/\(https?:\/\/[^\s)]+\)/gi, '').trim();
  return line.length > 48 ? line.slice(0, 48).trim() + '…' : (line || 'Untitled Website');
}

export default function WebsiteCard({ prompt: p, onFav, onCopy, onClick }) {
  const [popFav, setPopFav] = useState(false);

  const tags = Array.isArray(p.tags) ? p.tags
    : (typeof p.tags === 'string' ? p.tags.split(',').map(t => t.trim()).filter(Boolean) : []);

  const primaryTag = tags[0] || p.model || 'Website';
  const detectedUrl = parseWebsiteUrl(p.prompt, p.inputsNeeded);
  const domain = extractDomain(detectedUrl);
  const title = cleanTitle(p.prompt);
  const date = formatDate(p.createdAt);
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : '';

  const handleFav = useCallback((e) => {
    e.stopPropagation();
    onFav(p.id);
    setPopFav(true);
    setTimeout(() => setPopFav(false), 400);
  }, [p.id, onFav]);

  const handleVisit = useCallback((e) => {
    e.stopPropagation();
    window.open(detectedUrl || `https://${domain}`, '_blank', 'noopener,noreferrer');
    onCopy(`Opening ${domain}…`);
  }, [detectedUrl, domain, onCopy]);

  return (
    <article className="wc" onClick={() => onClick(p.id)}>
      {/* Header strip */}
      <div className="wc-header">
        <div className="wc-header-left">
          <span className="wc-dot" />
          <span className="wc-header-label">{p.model || 'Web App'}</span>
        </div>
        <span className="wc-header-date">{date}</span>
      </div>

      {/* Body */}
      <div className="wc-body">
        <div className="wc-meta-row">
          <div className="wc-favicon-wrap">
            {faviconUrl ? (
              <img src={faviconUrl} alt="" width="16" height="16"
                onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#949494" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            )}
          </div>
          <span className="wc-domain">{domain || 'No URL added'}</span>
        </div>

        <h3 className="wc-title">{title}</h3>

        {tags.length > 0 && (
          <div className="wc-tags">
            <span className="wc-tag-primary">
              {primaryTag.startsWith('#') ? primaryTag : `#${primaryTag}`}
            </span>
            {tags.length > 1 && (
              <span className="wc-tag-count">+{tags.length - 1}</span>
            )}
          </div>
        )}

        <div className="wc-divider" />

        {/* Footer */}
        <div className="wc-footer">
          <button
            className={`wc-fav ${p.fav ? 'active' : ''} ${popFav ? 'pop' : ''}`}
            aria-label={p.fav ? 'Remove from favorites' : 'Add to favorites'}
            onClick={handleFav}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={p.fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

          <button className="wc-visit" onClick={handleVisit} title={`Visit ${domain}`}>
            Visit →
          </button>
        </div>
      </div>
    </article>
  );
}

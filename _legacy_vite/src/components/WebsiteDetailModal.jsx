// src/components/WebsiteDetailModal.jsx — Firecrawl Design System
import { useState, useEffect, useRef, useCallback } from 'react';
import TagInput from './TagInput';

function formatDate(iso) {
  if (!iso) return 'Recently';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function parseUrl(prompt, inputs) {
  if (inputs && /^https?:\/\//i.test(inputs.trim())) return inputs.trim();
  const m = (prompt || '').match(/https?:\/\/[^\s)]+/i);
  return m ? m[0] : '';
}

function extractDomain(url) {
  if (url) {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    } catch { /* fallback */ }
  }
  return '';
}

function cleanTitle(text) {
  if (!text) return 'Untitled Website';
  const line = text.split('\n')[0].replace(/\(https?:\/\/[^\s)]+\)/gi, '').trim();
  return line.length > 80 ? line.slice(0, 80) + '…' : (line || 'Untitled Website');
}

export default function WebsiteDetailModal({ prompt: p, onClose, onFav, onCopy, onDelete, onUpdate }) {
  const [copied, setCopied]       = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);

  const url = parseUrl(p.prompt, p.inputsNeeded);
  const displayUrl = url || '';
  const domain = extractDomain(displayUrl);
  const favicon = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : '';
  const title = cleanTitle(p.prompt);

  const [editName, setEditName]       = useState(title);
  const [editUrl, setEditUrl]         = useState(url);
  const [editCat, setEditCat]         = useState(p.model || 'Web App');
  const [editTags, setEditTags]       = useState(p.tags || []);
  const [editNotes, setEditNotes]     = useState(p.inputsNeeded || '');

  const ref = useRef(null);

  useEffect(() => {
    setEditName(cleanTitle(p.prompt));
    setEditUrl(parseUrl(p.prompt, p.inputsNeeded));
    setEditCat(p.model || 'Web App');
    setEditTags(p.tags || []);
    setEditNotes(p.inputsNeeded || '');
    setEditing(false);
  }, [p]);

  const onBackdrop = (e) => { if (e.target === ref.current) onClose(); };

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(editUrl || displayUrl).then(() => {
      setCopied(true);
      onCopy('URL copied to clipboard');
      setTimeout(() => setCopied(false), 1800);
    });
  }, [editUrl, displayUrl, onCopy]);

  const visit = useCallback(() => {
    window.open(editUrl || displayUrl, '_blank', 'noopener,noreferrer');
    onCopy(`Opening ${domain}…`);
  }, [editUrl, displayUrl, domain, onCopy]);

  const saveEdit = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      let finalPrompt = editName.trim();
      if (editUrl.trim() && !finalPrompt.includes(editUrl.trim())) {
        finalPrompt = `${finalPrompt} (${editUrl.trim()})`;
      }
      await onUpdate(p.id, {
        prompt: finalPrompt,
        model: editCat.trim() || 'Web App',
        tags: editTags,
        inputsNeeded: editNotes.trim() || (editUrl.trim() || null)
      });
      setEditing(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDeleteConfirm = () => {
    onDelete(p.id);
    onClose();
  };

  const tags = Array.isArray(p.tags) ? p.tags
    : (typeof p.tags === 'string' ? p.tags.split(',').map(t => t.trim()).filter(Boolean) : []);

  return (
    <div className="modal-backdrop wdm-backdrop" ref={ref} onClick={onBackdrop}>
      <div className="wdm" role="dialog" aria-modal="true">

        {/* Header bar — Ink (#262626) */}
        <div className="wdm-header">
          <div className="wdm-header-left">
            <span className="wdm-dot" />
            <span className="wdm-badge">WEBSITE BOOKMARK</span>
            <span className="wdm-date">{formatDate(p.createdAt)}</span>
          </div>
          <button className="wdm-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        {/* Body */}
        <div className="wdm-body">
          {!editing ? (
            <>
              {/* Meta row */}
              <div className="wdm-meta">
                <div className="wdm-meta-left">
                  {favicon ? (
                    <img className="wdm-favicon" src={favicon} alt="" width="20" height="20"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <svg className="wdm-favicon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#949494" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ padding: '2px' }}>
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                  )}
                  <span className="wdm-cat">{p.model || 'Web App'}</span>
                </div>
                <div className="wdm-tags">
                  {tags.map((t, i) => (
                    <span key={`${t}-${i}`} className="wdm-tag">{t.startsWith('#') ? t : `#${t}`}</span>
                  ))}
                </div>
              </div>

              {/* Title */}
              <h2 className="wdm-title">{title}</h2>

              {/* URL card */}
              {displayUrl && (
                <div className="wdm-url-card">
                  <div className="wdm-url-info">
                    <span className="wdm-url-label">WEBSITE URL</span>
                    <a href={displayUrl} target="_blank" rel="noopener noreferrer"
                      className="wdm-url-link" onClick={(e) => e.stopPropagation()}>
                      {displayUrl}
                    </a>
                  </div>
                  <button className={`wdm-copy ${copied ? 'copied' : ''}`} onClick={copyLink}>
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              )}

              {/* Notes */}
              {p.inputsNeeded && !p.inputsNeeded.startsWith('http') && (
                <div className="wdm-notes">
                  <h4>NOTES</h4>
                  <p>{p.inputsNeeded}</p>
                </div>
              )}

              {/* Full description if long */}
              {p.prompt && p.prompt.length > 80 && (!p.inputsNeeded || p.inputsNeeded.startsWith('http')) && (
                <div className="wdm-notes">
                  <h4>DESCRIPTION</h4>
                  <p>{p.prompt}</p>
                </div>
              )}

              <div className="wdm-divider" />

              {/* Actions */}
              <div className="wdm-actions">
                <button className="wdm-visit" onClick={visit}>
                  Visit Website →
                </button>
                <div className="wdm-actions-right">
                  <button
                    className={`wdm-fav ${p.fav ? 'active' : ''}`}
                    onClick={() => onFav(p.id)}
                    aria-label={p.fav ? 'Unfavorite' : 'Favorite'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={p.fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                  <button className="wdm-btn-ghost" onClick={() => setEditing(true)}>Edit</button>
                </div>
              </div>

              {/* ── Delete zone ── */}
              <div className="detail-delete-zone" style={{ marginTop: '16px' }}>
                {p.isOwner === false ? (
                  <div style={{ textAlign: 'center', opacity: 0.65, fontSize: '0.85rem', color: '#727272', padding: '12px 0' }}>
                    Only the creator of this website can delete it
                  </div>
                ) : !confirming ? (
                  <button
                    className="detail-delete-btn"
                    onClick={() => setConfirming(true)}
                    aria-label="Move to trash"
                  >
                    Move to Trash
                  </button>
                ) : (
                  <div className="detail-confirm-strip">
                    <span className="detail-confirm-label">Move this website to trash?</span>
                    <div className="detail-confirm-actions">
                      <button
                        className="detail-confirm-cancel"
                        onClick={() => setConfirming(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="detail-confirm-delete"
                        onClick={handleDeleteConfirm}
                      >
                        Yes, Trash It
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Edit mode */
            <div className="wdm-edit">
              <h3 className="wdm-edit-title">Edit Bookmark</h3>

              <div className="wdm-field">
                <label>Website Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Stripe Design System" />
              </div>

              <div className="wdm-field">
                <label>Website URL</label>
                <input type="url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://example.com" />
              </div>

              <div className="wdm-field">
                <label>Category</label>
                <input type="text" value={editCat} onChange={(e) => setEditCat(e.target.value)}
                  placeholder="e.g. Portfolio, SaaS, Agency" />
              </div>

              <div className="wdm-field">
                <label>Tags</label>
                <TagInput tags={editTags} setTags={setEditTags} />
              </div>

              <div className="wdm-field">
                <label>Notes</label>
                <textarea rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes about this website..." />
              </div>

              <div className="wdm-edit-actions">
                <button className="wdm-visit" onClick={saveEdit} disabled={saving || !editName.trim()}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button className="wdm-btn-ghost" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

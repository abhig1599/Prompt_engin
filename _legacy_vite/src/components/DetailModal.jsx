// src/components/DetailModal.jsx — Caldera style with Edit support
import { useState, useEffect, useRef, useCallback } from 'react';
import TagInput from './TagInput';
import { convertToWebP } from '../utils/imageUtils';

const MODELS = ['Midjourney', 'DALL·E 3', 'Stable Diffusion', 'Adobe Firefly', 'Google Imagen', 'Flux', 'Gemini Nano', 'ChatGPT', 'Other'];

function formatDate(iso) {
  if (!iso) return 'Recently';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function extractImageUrlFromHtml(html) {
  if (!html) return null;
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const img = doc.querySelector('img');
    if (img && img.src) return img.src;
  } catch (e) {
    // fallback
  }
  const match = html.match(/<img[^>]+src=["']?([^"'\s>]+)/i);
  return match ? match[1] : null;
}

function isImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim();
  if (clean.startsWith('data:image/')) return true;
  if (/^https?:\/\//i.test(clean)) return true;
  return false;
}

export default function DetailModal({ prompt: p, onClose, onFav, onCopy, onDelete, onUpdate }) {
  const [copied,       setCopied]       = useState(false);
  const [confirming,   setConfirming]   = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [isEditing,    setIsEditing]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [dragOver,     setDragOver]     = useState(false);
  const [loadingImg,   setLoadingImg]   = useState(false);

  // Edit form state
  const [editPrompt, setEditPrompt]             = useState(p.prompt || '');
  const [editModel,  setEditModel]              = useState(p.model || '');
  const [editTags,   setEditTags]               = useState(p.tags || []);
  const [editInputsNeeded, setEditInputsNeeded] = useState(p.inputsNeeded || '');
  const [editImage,  setEditImage]              = useState(p.image || null);
  const [imageFile,  setImageFile]              = useState(null);
  const [removeImg,  setRemoveImg]              = useState(false);

  const backdropRef = useRef(null);

  useEffect(() => {
    setEditPrompt(p.prompt || '');
    setEditModel(p.model || '');
    setEditTags(p.tags || []);
    setEditInputsNeeded(p.inputsNeeded || '');
    setEditImage(p.image || null);
    setImageFile(null);
    setRemoveImg(false);
    setIsEditing(false);
  }, [p]);

  const readFile = useCallback((file) => {
    if (!file) return;
    setLoadingImg(true);
    setRemoveImg(false);
    convertToWebP(file)
      .then(({ dataUrl, file: webpFile }) => {
        setEditImage(dataUrl);
        setImageFile(webpFile || file);
      })
      .catch((err) => {
        console.warn('WebP conversion fallback:', err);
        const reader = new FileReader();
        setImageFile(file);
        reader.onload = (evt) => setEditImage(evt.target.result);
        reader.readAsDataURL(file);
      })
      .finally(() => {
        setLoadingImg(false);
      });
  }, []);

  const processImageUrl = useCallback((url) => {
    if (!url || typeof url !== 'string') return;
    const cleanUrl = url.trim();
    if (!cleanUrl) return;

    setRemoveImg(false);
    setLoadingImg(true);

    convertToWebP(cleanUrl)
      .then(({ dataUrl, file: webpFile }) => {
        setEditImage(dataUrl);
        if (webpFile) setImageFile(webpFile);
      })
      .catch((err) => {
        console.warn('CORS or WebP fetch restriction, using direct image URL:', err);
        setEditImage(cleanUrl);
      })
      .finally(() => {
        setLoadingImg(false);
      });
  }, []);

  const handleDataTransfer = useCallback((dataTransfer) => {
    if (!dataTransfer) return false;
    if (dataTransfer.files && dataTransfer.files.length > 0) {
      const file = dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        readFile(file);
        return true;
      }
    }
    if (dataTransfer.items && dataTransfer.items.length > 0) {
      for (const item of dataTransfer.items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            readFile(file);
            return true;
          }
        }
      }
    }
    const uriList = dataTransfer.getData('text/uri-list');
    if (uriList) {
      const urls = uriList.split('\n').map(u => u.trim()).filter(u => u && !u.startsWith('#'));
      if (urls.length > 0 && isImageUrl(urls[0])) {
        processImageUrl(urls[0]);
        return true;
      }
    }
    const html = dataTransfer.getData('text/html');
    if (html) {
      const imgUrl = extractImageUrlFromHtml(html);
      if (imgUrl) {
        processImageUrl(imgUrl);
        return true;
      }
    }
    const plainText = dataTransfer.getData('text/plain') || dataTransfer.getData('URL');
    if (plainText && isImageUrl(plainText)) {
      processImageUrl(plainText.trim());
      return true;
    }
    return false;
  }, [readFile, processImageUrl]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (!isEditing) return;
    const pasteHandler = (e) => {
      if (!e.clipboardData) return;
      const items = Array.from(e.clipboardData.items ?? []);
      const imgItem = items.find(i => i.type.startsWith('image/'));
      if (imgItem) {
        const file = imgItem.getAsFile();
        if (file) {
          readFile(file);
          e.preventDefault();
          return;
        }
      }
      const html = e.clipboardData.getData('text/html');
      if (html) {
        const imgUrl = extractImageUrlFromHtml(html);
        if (imgUrl) {
          processImageUrl(imgUrl);
          e.preventDefault();
          return;
        }
      }
      const uriList = e.clipboardData.getData('text/uri-list');
      if (uriList) {
        const urls = uriList.split('\n').map(u => u.trim()).filter(u => u && !u.startsWith('#'));
        if (urls.length > 0 && isImageUrl(urls[0])) {
          processImageUrl(urls[0]);
          e.preventDefault();
          return;
        }
      }
      const text = e.clipboardData.getData('text/plain')?.trim();
      if (text) {
        const targetTag = e.target?.tagName?.toLowerCase();
        const isTextInput = targetTag === 'textarea' || targetTag === 'input';
        if (isImageUrl(text) && (!isTextInput || text.startsWith('data:image/') || /\.(jpeg|jpg|png|webp|gif|svg|avif)(\?.*)?$/i.test(text))) {
          processImageUrl(text);
          e.preventDefault();
        }
      }
    };
    document.addEventListener('paste', pasteHandler);
    return () => document.removeEventListener('paste', pasteHandler);
  }, [isEditing, readFile, processImageUrl]);

  useEffect(() => {
    const imgUrl = isEditing ? editImage : p.image;
    if (imgUrl) {
      const img = new Image();
      img.src = imgUrl;
      img.onload = () => {
        setIsHorizontal(img.naturalWidth > img.naturalHeight);
      };
    } else {
      setIsHorizontal(false);
    }
  }, [p.image, editImage, isEditing]);

  const handleCopy = () => {
    navigator.clipboard.writeText(p.prompt).then(() => {
      setCopied(true);
      onCopy('Prompt copied!');
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const handleDeleteConfirm = () => {
    onDelete(p.id);
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) readFile(file);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editPrompt.trim()) return;
    setSaving(true);
    try {
      await onUpdate(p.id, {
        prompt: editPrompt.trim(),
        model: editModel || null,
        tags: Array.isArray(editTags) ? editTags : [],
        inputsNeeded: editInputsNeeded.trim() || null,
        imageFile: imageFile,
        removeImage: removeImg,
        image: removeImg ? null : editImage
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update prompt:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className={`modal-box ${isEditing ? 'modal-sm' : 'modal-lg'} ${!isEditing && isHorizontal ? 'modal-horizontal' : ''}`}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">×</button>

        {!isEditing ? (
          /* READ MODE */
          <div className={`detail-layout ${isHorizontal ? 'detail-layout-horizontal' : ''}`}>
            {/* Image / Ember block */}
            <div className="detail-img-col">
              {p.image ? (
                <img
                  src={p.image}
                  alt="Prompt visual"
                  onLoad={(e) => {
                    if (e.target.naturalWidth > e.target.naturalHeight) {
                      setIsHorizontal(true);
                    }
                  }}
                />
              ) : (
                <div className="detail-no-img">PROMPT</div>
              )}
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

              {/* What to provide to AI */}
              {p.inputsNeeded && (
                <div className="detail-inputs-box">
                  <div className="detail-inputs-label">What to provide to AI</div>
                  <p className="detail-inputs-text">{p.inputsNeeded}</p>
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
                {copied ? 'Copied to clipboard!' : 'Copy Prompt'}
              </button>

              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                {/* Edit Button — enabled for owner only */}
                {p.isOwner !== false ? (
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, padding: '10px 16px', borderRadius: '40px' }}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Prompt
                  </button>
                ) : (
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, padding: '10px 16px', borderRadius: '40px', opacity: 0.5, cursor: 'not-allowed' }}
                    onClick={() => onCopy('Only the creator of this prompt can edit it.')}
                    title="Only the creator can edit this prompt"
                  >
                    Creator Only
                  </button>
                )}

                {/* Fav — secondary button */}
                <button
                  className={`detail-fav-btn ${p.fav ? 'active' : ''}`}
                  style={{ flex: 1, marginTop: 0 }}
                  onClick={() => onFav(p.id)}
                >
                  {p.fav ? 'Favorited' : 'Favorite'}
                </button>
              </div>

              <div className="detail-date">Added {formatDate(p.createdAt)}</div>

              {/* ── Delete zone ── */}
              <div className="detail-delete-zone">
                {p.isOwner === false ? (
                  <div style={{ textAlign: 'center', opacity: 0.65, fontSize: '0.85rem', color: 'var(--color-obsidian)', padding: '12px 0' }}>
                    Only the creator of this prompt can delete it
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
                    <span className="detail-confirm-label">Move this prompt to trash?</span>
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
            </div>
          </div>
        ) : (
          /* EDIT MODE */
          <div className="add-modal-inner">
            <h2 className="modal-title">EDIT PROMPT</h2>
            <p className="modal-subtitle">Update your prompt content, required inputs, tags, and image</p>

            <form className="modal-form" onSubmit={handleSaveEdit} noValidate>
              {/* Image update zone */}
              <div className="field">
                <label className="field-label">Visual / Image</label>
                {loadingImg ? (
                  <div className="upload-zone" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div className="upload-placeholder">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      <span className="upload-label">Loading image...</span>
                    </div>
                  </div>
                ) : editImage && !removeImg ? (
                  <label
                    className={`upload-zone upload-zone-has-img ${dragOver ? 'drag-over' : ''}`}
                    htmlFor="editImageInput"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOver(false);
                      handleDataTransfer(e.dataTransfer);
                    }}
                  >
                    <div className="upload-img-wrap">
                      <img src={editImage} alt="Current Preview" />
                      <div className="upload-change">Click, paste (Cmd+V), or drop image to replace</div>
                      <button
                        type="button"
                        className="remove-img-pill"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setRemoveImg(true);
                          setEditImage(null);
                          setImageFile(null);
                        }}
                        title="Remove image"
                      >
                        × Remove
                      </button>
                    </div>
                    <input
                      id="editImageInput"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <label
                    className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                    htmlFor="editImageInput"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOver(false);
                      handleDataTransfer(e.dataTransfer);
                    }}
                  >
                    <div className="upload-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span className="upload-label">Drop image or click to browse</span>
                      <span className="upload-sub">PNG · JPG · WebP · GIF · Drag from webpage · Paste (Cmd+V)</span>
                    </div>
                    <input
                      id="editImageInput"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              {/* Prompt textarea */}
              <div className="field">
                <label className="field-label" htmlFor="editPromptText">
                  Prompt Content <span className="required">*</span>
                </label>
                <textarea
                  className="field-textarea"
                  id="editPromptText"
                  rows={4}
                  maxLength={1000}
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  required
                />
                <span className="field-counter">{editPrompt.length} / 1000</span>
              </div>

              {/* What to provide to AI */}
              <div className="field">
                <label className="field-label" htmlFor="editInputsNeededField">
                  What to provide to AI <span className="field-hint">(e.g. face photo, product image, logo)</span>
                </label>
                <input
                  className="field-input"
                  id="editInputsNeededField"
                  type="text"
                  placeholder="e.g. Your photo, product image, logo PNG, reference style…"
                  value={editInputsNeeded}
                  onChange={(e) => setEditInputsNeeded(e.target.value)}
                />
              </div>

              <div className="edit-form-grid">
                {/* Tags */}
                <div className="field">
                  <label className="field-label" htmlFor="editTagsField">
                    Tags <span className="field-hint">(type & press Enter or comma)</span>
                  </label>
                  <TagInput
                    id="editTagsField"
                    tags={editTags}
                    onChange={setEditTags}
                    placeholder="Type tag and press Enter…"
                  />
                </div>

                {/* Model select */}
                <div className="field">
                  <label className="field-label" htmlFor="editModelField">AI Model</label>
                  <select
                    className="field-select"
                    id="editModelField"
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                  >
                    <option value="">— Select model —</option>
                    {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!editPrompt.trim() || saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

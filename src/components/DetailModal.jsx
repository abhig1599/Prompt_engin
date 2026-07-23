// src/components/DetailModal.jsx — Caldera style with Edit support
import { useState, useEffect, useRef } from 'react';

const MODELS = ['Midjourney', 'DALL·E 3', 'Stable Diffusion', 'Adobe Firefly', 'Google Imagen', 'Flux', 'Gemini Nano', 'ChatGPT', 'Other'];

function formatDate(iso) {
  if (!iso) return 'Recently';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DetailModal({ prompt: p, onClose, onFav, onCopy, onDelete, onUpdate }) {
  const [copied,       setCopied]       = useState(false);
  const [confirming,   setConfirming]   = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [isEditing,    setIsEditing]    = useState(false);
  const [saving,       setSaving]       = useState(false);

  // Edit form state
  const [editPrompt, setEditPrompt]   = useState(p.prompt || '');
  const [editModel,  setEditModel]    = useState(p.model || '');
  const [editTags,   setEditTags]     = useState((p.tags || []).join(', '));
  const [editImage,  setEditImage]    = useState(p.image || null);
  const [imageFile,  setImageFile]    = useState(null);
  const [removeImg,  setRemoveImg]    = useState(false);

  const backdropRef = useRef(null);

  useEffect(() => {
    setEditPrompt(p.prompt || '');
    setEditModel(p.model || '');
    setEditTags((p.tags || []).join(', '));
    setEditImage(p.image || null);
    setImageFile(null);
    setRemoveImg(false);
    setIsEditing(false);
  }, [p]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

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
    if (!file) return;
    setImageFile(file);
    setRemoveImg(false);
    const reader = new FileReader();
    reader.onload = (evt) => setEditImage(evt.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editPrompt.trim()) return;
    setSaving(true);
    try {
      await onUpdate(p.id, {
        prompt: editPrompt.trim(),
        model: editModel || null,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
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
      <div className={`modal-box modal-lg ${isHorizontal ? 'modal-horizontal' : ''}`}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>

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
                {/* Edit Button */}
                <button
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: '40px' }}
                  onClick={() => setIsEditing(true)}
                >
                  ✎ Edit Prompt
                </button>

                {/* Fav — secondary button */}
                <button
                  className={`detail-fav-btn ${p.fav ? 'active' : ''}`}
                  style={{ flex: 1, marginTop: 0 }}
                  onClick={() => onFav(p.id)}
                >
                  {p.fav ? '❤ Favorited' : '♡ Favorite'}
                </button>
              </div>

              {/* Model */}
              {p.model && (
                <div className="detail-meta">
                  Generated with <span className="model-badge">{p.model}</span>
                </div>
              )}

              <div className="detail-date">Added {formatDate(p.createdAt)}</div>

              {/* ── Delete zone ── */}
              <div className="detail-delete-zone">
                {!confirming ? (
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
          <div className="add-modal-inner" style={{ padding: '8px 0' }}>
            <h2 className="modal-title">EDIT PROMPT</h2>

            <form className="modal-form" onSubmit={handleSaveEdit} noValidate>
              {/* Image update zone */}
              <div className="field">
                <label className="field-label">Visual / Image</label>
                {editImage && !removeImg ? (
                  <div className="upload-img-wrap" style={{ maxHeight: '180px', marginBottom: '8px' }}>
                    <img src={editImage} alt="Current Preview" style={{ maxHeight: '180px', objectFit: 'contain' }} />
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ marginTop: '8px', padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => { setRemoveImg(true); setEditImage(null); }}
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <label className="upload-zone" htmlFor="editImageInput">
                    <div className="upload-placeholder">
                      <span className="upload-icon">🖼</span>
                      <span className="upload-label">Upload image or click to browse</span>
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
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  required
                />
              </div>

              {/* Tags */}
              <div className="field">
                <label className="field-label" htmlFor="editTagsField">
                  Tags <span className="field-hint">(comma separated)</span>
                </label>
                <input
                  className="field-input"
                  id="editTagsField"
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
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

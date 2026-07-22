// src/components/AddModal.jsx — Caldera style
import { useState, useRef, useCallback, useEffect } from 'react';

const MODELS = ['Midjourney', 'DALL·E 3', 'Stable Diffusion', 'Adobe Firefly', 'Google Imagen', 'Flux', 'Other'];
const MAX_CHARS = 1000;

export default function AddModal({ onClose, onSave }) {
  const [prompt, setPrompt]     = useState('');
  const [tags, setTags]         = useState('');
  const [model, setModel]       = useState('');
  const [image, setImage]       = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const backdropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const img   = items.find(i => i.type.startsWith('image/'));
      if (img) readFile(img.getAsFile());
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, []);

  const readFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) readFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSave({
      prompt: prompt.trim(),
      image:  image || null,
      tags:   tags.split(',').map(t => t.trim()).filter(Boolean),
      model:  model || null,
    });
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="modal-box modal-sm">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>

        <div className="add-modal-inner">
          {/* Caldera display font title */}
          <h2 className="modal-title">NEW PROMPT</h2>

          <form className="modal-form" onSubmit={handleSubmit} noValidate>

            {/* Upload zone — dashed Obsidian border, 40px radius */}
            <label
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              htmlFor="imageInput"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {image ? (
                <div className="upload-img-wrap">
                  <img src={image} alt="Preview" />
                  <div className="upload-change">Click to change</div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">🖼</span>
                  <span className="upload-label">Drop image or click to browse</span>
                  <span className="upload-sub">PNG · JPG · WebP · GIF · Paste from clipboard</span>
                </div>
              )}
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => readFile(e.target.files[0])}
              />
            </label>

            {/* Prompt — 40px radius textarea */}
            <div className="field">
              <label className="field-label" htmlFor="promptText">
                Prompt <span className="required">*</span>
              </label>
              <textarea
                className="field-textarea"
                id="promptText"
                rows={4}
                maxLength={MAX_CHARS}
                placeholder="e.g. A cinematic photo of a neon-lit Tokyo alley at night, rain reflections, 8K…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                autoFocus
              />
              <span className="field-counter">{prompt.length} / {MAX_CHARS}</span>
            </div>

            {/* Tags — 100px radius input */}
            <div className="field">
              <label className="field-label" htmlFor="tagsField">
                Tags <span className="field-hint">(comma separated)</span>
              </label>
              <input
                className="field-input"
                id="tagsField"
                type="text"
                placeholder="e.g. cinematic, portrait, sci-fi"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            {/* Model — 100px radius select */}
            <div className="field">
              <label className="field-label" htmlFor="modelField">AI Model</label>
              <select
                className="field-select"
                id="modelField"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="">— Select model —</option>
                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Actions */}
            <div className="modal-actions">
              {/* Secondary 40px radius button */}
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              {/* Primary Ember pill */}
              <button type="submit" className="btn-primary" disabled={!prompt.trim()}>
                Save to Board
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

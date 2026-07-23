// src/components/AddModal.jsx — Caldera style
import { useState, useRef, useCallback, useEffect } from 'react';
import TagInput from './TagInput';
import { convertToWebP } from '../utils/imageUtils';

const MODELS = ['Midjourney', 'DALL·E 3', 'Stable Diffusion', 'Adobe Firefly', 'Google Imagen', 'Flux', 'Gemini Nano', 'ChatGPT', 'Other'];
const MAX_CHARS = 1000;

function extractImageUrlFromHtml(html) {
  if (!html) return null;
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const img = doc.querySelector('img');
    if (img && img.src) return img.src;
  } catch (e) {
    // fallback regex
  }
  const match = html.match(/<img[^>]+src=["']?([^"'\s>]+)/i);
  return match ? match[1] : null;
}

function isImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim();
  if (clean.startsWith('data:image/')) return true;
  if (/^https?:\/\//i.test(clean)) {
    return true;
  }
  return false;
}

export default function AddModal({ onClose, onSave }) {
  const [prompt, setPrompt]         = useState('');
  const [tags, setTags]             = useState([]);
  const [inputsNeeded, setInputsNeeded] = useState('');
  const [model, setModel]           = useState('');
  const [image, setImage]           = useState(null);
  const [imageFile, setImageFile]   = useState(null);
  const [dragOver, setDragOver]     = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const backdropRef = useRef(null);

  const readFile = useCallback((file) => {
    if (!file) return;
    setLoadingImage(true);
    convertToWebP(file)
      .then(({ dataUrl, file: webpFile }) => {
        setImage(dataUrl);
        setImageFile(webpFile || file);
      })
      .catch((err) => {
        console.warn('WebP conversion fallback to original file:', err);
        const reader = new FileReader();
        setImageFile(file);
        reader.onload = (e) => setImage(e.target.result);
        reader.readAsDataURL(file);
      })
      .finally(() => {
        setLoadingImage(false);
      });
  }, []);

  const processImageUrl = useCallback((url) => {
    if (!url || typeof url !== 'string') return;
    const cleanUrl = url.trim();
    if (!cleanUrl) return;

    setLoadingImage(true);

    convertToWebP(cleanUrl)
      .then(({ dataUrl, file: webpFile }) => {
        setImage(dataUrl);
        if (webpFile) setImageFile(webpFile);
      })
      .catch((err) => {
        console.warn('CORS or fetch restriction on WebP conversion, using direct image URL:', err);
        setImage(cleanUrl);
      })
      .finally(() => {
        setLoadingImage(false);
      });
  }, []);

  const handleDataTransfer = useCallback((dataTransfer) => {
    if (!dataTransfer) return false;

    // 1. Local files array
    if (dataTransfer.files && dataTransfer.files.length > 0) {
      const file = dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        readFile(file);
        return true;
      }
    }

    // 2. Items array
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

    // 3. text/uri-list (Web image URL dragged from another tab/window)
    const uriList = dataTransfer.getData('text/uri-list');
    if (uriList) {
      const urls = uriList.split('\n').map(u => u.trim()).filter(u => u && !u.startsWith('#'));
      if (urls.length > 0 && isImageUrl(urls[0])) {
        processImageUrl(urls[0]);
        return true;
      }
    }

    // 4. text/html (HTML <img> element dragged from webpage)
    const html = dataTransfer.getData('text/html');
    if (html) {
      const imgUrl = extractImageUrlFromHtml(html);
      if (imgUrl) {
        processImageUrl(imgUrl);
        return true;
      }
    }

    // 5. text/plain or URL
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
    const pasteHandler = (e) => {
      if (!e.clipboardData) return;

      // 1. Direct image binary blob in clipboard
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

      // 2. HTML in clipboard (copied image from webpage)
      const html = e.clipboardData.getData('text/html');
      if (html) {
        const imgUrl = extractImageUrlFromHtml(html);
        if (imgUrl) {
          processImageUrl(imgUrl);
          e.preventDefault();
          return;
        }
      }

      // 3. text/uri-list
      const uriList = e.clipboardData.getData('text/uri-list');
      if (uriList) {
        const urls = uriList.split('\n').map(u => u.trim()).filter(u => u && !u.startsWith('#'));
        if (urls.length > 0 && isImageUrl(urls[0])) {
          processImageUrl(urls[0]);
          e.preventDefault();
          return;
        }
      }

      // 4. text/plain (Pasted image URL)
      const text = e.clipboardData.getData('text/plain')?.trim();
      if (text) {
        const targetTag = e.target?.tagName?.toLowerCase();
        const isTextInput = targetTag === 'textarea' || targetTag === 'input';

        // If not typing in a text field OR if text is an explicit image URL/data URI
        if (isImageUrl(text) && (!isTextInput || text.startsWith('data:image/') || /\.(jpeg|jpg|png|webp|gif|svg|avif)(\?.*)?$/i.test(text))) {
          processImageUrl(text);
          e.preventDefault();
        }
      }
    };

    document.addEventListener('paste', pasteHandler);
    return () => document.removeEventListener('paste', pasteHandler);
  }, [readFile, processImageUrl]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    handleDataTransfer(e.dataTransfer);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSave({
      prompt: prompt.trim(),
      imageFile: imageFile,
      image:  image || null,
      tags:   Array.isArray(tags) ? tags : [],
      model:  model || null,
      inputsNeeded: inputsNeeded.trim() || null,
    });
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="modal-box modal-sm">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">×</button>

        <div className="add-modal-inner">
          {/* Caldera display font title */}
          <h2 className="modal-title">NEW PROMPT</h2>

          <form className="modal-form" onSubmit={handleSubmit} noValidate>

            {/* Upload zone — dashed Obsidian border, 40px radius */}
            <label
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              htmlFor="imageInput"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {loadingImage ? (
                <div className="upload-placeholder">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  <span className="upload-label">Loading image...</span>
                </div>
              ) : image ? (
                <div className="upload-img-wrap">
                  <img src={image} alt="Preview" />
                  <div className="upload-change">Click, paste (Cmd+V), or drop image to change</div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span className="upload-label">Drop image or click to browse</span>
                  <span className="upload-sub">PNG · JPG · WebP · GIF · Drag from any webpage · Paste (Cmd+V)</span>
                </div>
              )}
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    readFile(e.target.files[0]);
                  }
                }}
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

            {/* What to provide to AI */}
            <div className="field">
              <label className="field-label" htmlFor="inputsNeededField">
                What to provide to AI <span className="field-hint">(e.g. your photo, object image, logo)</span>
              </label>
              <input
                className="field-input"
                id="inputsNeededField"
                type="text"
                placeholder="e.g. Your photo, product image, logo PNG, reference style…"
                value={inputsNeeded}
                onChange={(e) => setInputsNeeded(e.target.value)}
              />
            </div>

            {/* Tags — Interactive chip input */}
            <div className="field">
              <label className="field-label" htmlFor="tagsField">
                Tags <span className="field-hint">(type & press Enter or comma)</span>
              </label>
              <TagInput
                id="tagsField"
                tags={tags}
                onChange={setTags}
                placeholder="Type tag and press Enter…"
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
              <button type="submit" className="btn-primary" disabled={!prompt.trim() || loadingImage}>
                Save to Board
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


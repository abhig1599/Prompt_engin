// src/components/TagInput.jsx
import { useState, useRef } from 'react';

export default function TagInput({ tags = [], onChange, id = 'tagsField', placeholder = 'Type tag and press Enter…' }) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const addTag = (text) => {
    const clean = text.trim().replace(/^,+|,+$/g, '');
    if (!clean) return;
    if (!tags.some(t => t.toLowerCase() === clean.toLowerCase())) {
      onChange([...tags, clean]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.includes(',')) {
      const parts = val.split(',');
      const last = parts.pop();
      parts.forEach(p => addTag(p));
      setInputValue(last);
    } else {
      setInputValue(val);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
    inputRef.current?.focus();
  };

  return (
    <div className="tag-input-group">
      <input
        ref={inputRef}
        className="field-input"
        id={id}
        type="text"
        placeholder={tags.length > 0 ? 'Add another tag and press Enter…' : placeholder}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      {tags.length > 0 && (
        <div className="tag-chips-container">
          {tags.map((t, idx) => (
            <span key={`${t}-${idx}`} className="tag tag-chip">
              {t}
              <button
                type="button"
                className="tag-remove-btn"
                onClick={() => removeTag(idx)}
                aria-label={`Remove tag ${t}`}
                title={`Remove ${t}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

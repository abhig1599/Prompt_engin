// src/components/SearchBar.jsx
import { useEffect, useRef } from 'react';

export default function SearchBar({ value, onChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="search-wrap">
      <div className="search-box">
        <span className="search-icon">⌕</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search prompts, tags, models…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <kbd className="search-kbd">⌘ K</kbd>
      </div>
    </div>
  );
}

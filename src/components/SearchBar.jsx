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
        <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search prompts, tags, models…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <kbd className="search-kbd">Cmd K</kbd>
      </div>
    </div>
  );
}

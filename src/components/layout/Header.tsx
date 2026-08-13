'use client';
import Link from 'next/link';

interface Props {
  filter: 'all' | 'fav';
  onFilterChange: (f: 'all' | 'fav') => void;
  onAdd: () => void;
  onTrash: () => void;
  trashCount: number;
}

export default function Header({ filter, onFilterChange, onAdd, onTrash, trashCount }: Props) {
  return (
    <header
      style={{
        background: '#e9e9e9',
        borderBottom: '1px solid #dedede',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: '52px',
        }}
      >
        {/* ── Logo ── */}
        <Link
          href="/"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 600,
            fontSize: '16px',
            color: '#222222',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
            flexShrink: 0,
          }}
        >
          PromptBoard
        </Link>

        {/* ── Center nav tabs ── */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            background: '#222222',
            borderRadius: '14px',
            padding: '4px',
          }}
        >
          {(['all', 'fav'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onFilterChange(tab)}
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontWeight: 500,
                fontSize: '13px',
                padding: '5px 16px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
                background: filter === tab ? '#ffffff' : 'transparent',
                color: filter === tab ? '#222222' : 'rgba(255,255,255,0.6)',
              }}
            >
              {tab === 'all' ? 'All' : 'Favorites'}
            </button>
          ))}
        </nav>

        {/* ── Right actions ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Trash */}
          <button
            onClick={onTrash}
            aria-label="View trash"
            style={{
              position: 'relative',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #dedede',
              background: 'transparent',
              color: '#808080',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#222222';
              (e.currentTarget as HTMLButtonElement).style.color = '#222222';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#dedede';
              (e.currentTarget as HTMLButtonElement).style.color = '#808080';
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            {trashCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#222222',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 600,
                  fontFamily: "'Inter Tight', sans-serif",
                  padding: '1px 4px',
                  borderRadius: '4px',
                  lineHeight: 1.4,
                }}
              >
                {trashCount}
              </span>
            )}
          </button>

          {/* Add Prompt — filled Ink button */}
          <button
            onClick={onAdd}
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontWeight: 500,
              fontSize: '13px',
              padding: '7px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#222222',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#3a3a3a'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#222222'; }}
          >
            <span style={{ fontSize: '16px', lineHeight: 1, marginTop: '-1px' }}>+</span>
            Add Prompt
          </button>
        </div>
      </div>
    </header>
  );
}

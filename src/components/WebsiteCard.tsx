'use client';
import { useMemo, useState, useCallback } from 'react';
import type { Website } from '@/hooks/useWebsites';

const IT = "'Inter Tight', sans-serif";

interface Props {
  website: Website;
  onClick: (id: string) => void;
  onFav: (id: string) => void;
}

const GRADIENTS = [
  { main: '#1873d3', bg: 'linear-gradient(to right, #b4d8fb 0%, #ebf5ff 100%)' },
  { main: '#222222', bg: 'linear-gradient(to right, #fceeb5 0%, #fefcf3 100%)' },
  { main: '#e95d13', bg: 'linear-gradient(to right, #ffd2bc 0%, #fff4ef 100%)' },
  { main: '#10a37f', bg: 'linear-gradient(to right, #b6ebd9 0%, #f0fdf7 100%)' },
  { main: '#6d28d9', bg: 'linear-gradient(to right, #d8b4fe 0%, #faf5ff 100%)' },
];

export default function WebsiteCard({ website: w, onClick, onFav }: Props) {
  const [popFav, setPopFav] = useState(false);

  const color = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < w.id.length; i++) hash = w.id.charCodeAt(i) + ((hash << 5) - hash);
    return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
  }, [w.id]);

  const handleFav = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFav(w.id);
    setPopFav(true);
    setTimeout(() => setPopFav(false), 200);
  }, [w.id, onFav]);

  const dateStr = new Date(w.createdAt).toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });

  return (
    <article
      onClick={() => onClick(w.id)}
      style={{
        position: 'relative',
        display: 'flex',
        borderRadius: '16px',
        background: color.bg,
        minHeight: '120px',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        // The semi-circle ticket cutout mask on the left edge
        WebkitMaskImage: 'radial-gradient(circle at 0% 50%, transparent 10px, black 11px)',
        maskImage: 'radial-gradient(circle at 0% 50%, transparent 10px, black 11px)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
      }}
    >
      {/* ── Left colored area with favicon ── */}
      <div style={{
        flex: '0 0 100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: color.main, // using the solid color as fallback backing
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}>
          {w.faviconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={w.faviconUrl} alt={w.name} style={{ width: '60%', height: '60%', objectFit: 'contain' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
          ) : (
            <span style={{ fontFamily: IT, fontWeight: 700, fontSize: '18px', color: '#fff' }}>
              {w.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* ── Right white content area ── */}
      <div style={{
        flex: 1,
        background: '#ffffff',
        margin: '2px 2px 2px 0',
        borderRadius: '14px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative', // for the delete button absolute positioning if needed
      }}>
        <h3 style={{ fontFamily: IT, fontWeight: 600, fontSize: '15px', color: '#222222', margin: '0 0 4px', paddingRight: '24px', lineHeight: 1.3 }}>
          {w.name}
        </h3>
        {w.tags.length > 0 && (
          <p style={{ fontFamily: IT, fontWeight: 400, fontSize: '13px', color: '#4d4d4d', margin: '0 0 12px', lineHeight: 1.4 }}>
            {w.tags.join(', ')}
          </p>
        )}
        
        <p style={{ fontFamily: IT, fontWeight: 400, fontSize: '11px', color: '#808080', margin: '0 0 12px' }}>
          Added {dateStr}
        </p>

        <div>
          <button
            onClick={() => window.open(w.url, '_blank')}
            style={{
              background: '#111111',
              color: '#ffffff',
              border: 'none',
              borderRadius: '999px',
              padding: '6px 16px',
              fontFamily: IT,
              fontWeight: 500,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#333'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#111'; }}
          >
            Check
          </button>
        </div>

        {/* ── Fav button (top-right) ── */}
        <button
          onClick={handleFav}
          aria-label={w.isFav ? 'Remove from favorites' : 'Add to favorites'}
          style={{
            position: 'absolute',
            top: '12px', right: '12px',
            width: '28px', height: '28px',
            borderRadius: '50%',
            border: w.isFav ? 'none' : '1px solid #dedede',
            background: w.isFav ? '#222222' : '#f9f9f9',
            color: w.isFav ? '#fff' : '#b8b8b8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transform: popFav ? 'scale(1.25)' : 'scale(1)',
            transition: 'transform 0.15s, background 0.15s, color 0.15s, border-color 0.15s',
            zIndex: 10,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill={w.isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
    </article>
  );
}

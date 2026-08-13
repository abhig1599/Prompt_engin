'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { name: 'Prompts', path: '/' },
  { name: 'Websites', path: '/websites' },
  { name: 'Components', path: '/components' },
  { name: 'Resources', path: '/resources' }
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div style={{
      position: 'fixed',
      bottom: '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      background: '#454545', // Dark grey outer pill
      padding: '4px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'stretch',
      gap: '4px',
      height: '48px',
      boxShadow: '0 12px 32px rgba(0,0,0,0.2)', // Subtle lift from canvas
    }}>
      {/* Left Logo Block */}
      <div style={{
        background: '#1a1a1a',
        borderRadius: '8px',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: "'Inter Tight', sans-serif",
          fontWeight: 700,
          fontSize: '18px',
          color: '#ffffff',
          lineHeight: 1,
        }}>
          P.
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {TABS.map(t => {
          const isActive = pathname === t.path;
          return (
            <Link
              key={t.name}
              href={t.path}
              style={{
                background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                padding: '0 16px',
                fontFamily: "'Inter Tight', sans-serif",
                fontWeight: 400,
                fontSize: '13px',
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {t.name}
            </Link>
          );
        })}
      </div>

      {/* Right Action Block */}
      <button style={{
        background: '#ececec',
        border: 'none',
        borderRadius: '8px',
        padding: '0 20px',
        fontFamily: "'Inter Tight', sans-serif",
        fontWeight: 500,
        fontSize: '13px',
        color: '#111111',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ececec'; }}
      >
        Say Hello
      </button>
    </div>
  );
}

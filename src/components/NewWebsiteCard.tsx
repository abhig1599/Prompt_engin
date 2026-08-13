'use client';

const IT = "'Inter Tight', sans-serif";

interface Props { onClick: () => void; }

export default function NewWebsiteCard({ onClick }: Props) {
  return (
    <article
      onClick={onClick}
      style={{
        background: 'transparent',
        border: '1px dashed #b8b8b8',
        borderRadius: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        minHeight: '120px',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#222222';
        (e.currentTarget as HTMLElement).style.background = '#f0f0f0';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#b8b8b8';
        (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '24px', color: '#808080', lineHeight: 1 }}>+</span>
        <p style={{
          fontFamily: IT,
          fontWeight: 500,
          fontSize: '13px',
          color: '#222222',
          margin: 0
        }}>
          New Website
        </p>
      </div>
    </article>
  );
}

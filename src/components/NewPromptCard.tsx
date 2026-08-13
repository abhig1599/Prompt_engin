'use client';

interface Props { onClick: () => void; isSaving?: boolean; }

export default function NewPromptCard({ onClick, isSaving }: Props) {
  return (
    <article
      onClick={isSaving ? undefined : onClick}
      style={{
        background: 'transparent',
        border: '1px dashed #b8b8b8',
        borderRadius: '8px',
        cursor: isSaving ? 'default' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        aspectRatio: '4/3',
        opacity: isSaving ? 0.5 : 1,
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => {
        if (!isSaving) (e.currentTarget as HTMLElement).style.borderColor = '#222222';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#b8b8b8';
      }}
    >
      {isSaving ? (
        <svg style={{ animation: 'spin 1s linear infinite' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#808080" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      ) : (
        <span style={{ fontSize: '24px', color: '#808080', lineHeight: 1 }}>+</span>
      )}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: "'Inter Tight', sans-serif",
          fontWeight: 500,
          fontSize: '13px',
          color: '#222222',
          margin: 0,
        }}>
          New Prompt
        </p>
        <p style={{
          fontFamily: "'Inter Tight', sans-serif",
          fontWeight: 400,
          fontSize: '11px',
          color: '#808080',
          margin: '2px 0 0',
        }}>
          Click to add
        </p>
      </div>
    </article>
  );
}

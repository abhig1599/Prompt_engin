'use client';
interface Props { msg: string; show: boolean; }
export default function Toast({ msg, show }: Props) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: show ? 'translate(-50%, 0)' : 'translate(-50%, 8px)',
      opacity: show ? 1 : 0,
      pointerEvents: 'none',
      zIndex: 200,
      transition: 'opacity 0.2s, transform 0.2s',
    }}>
      <div style={{
        fontFamily: "'Inter Tight', sans-serif",
        fontWeight: 500,
        fontSize: '13px',
        color: '#ffffff',
        background: '#222222',
        borderRadius: '8px',
        padding: '8px 16px',
        whiteSpace: 'nowrap',
      }}>
        {msg}
      </div>
    </div>
  );
}

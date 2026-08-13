'use client';
import Image from 'next/image';
import Link from 'next/link';

const IT = "'Inter Tight', sans-serif";

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-canvas)',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <Image
          src="/404.png"
          alt="404 Page Not Found"
          width={800}
          height={400}
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          priority
        />
      </div>
      
      <p style={{
        fontFamily: IT,
        fontWeight: 500,
        fontSize: '18px',
        color: 'var(--color-graphite)',
        marginTop: '24px',
        marginBottom: '32px',
        maxWidth: '400px',
        lineHeight: 1.5,
      }}>
        Looks like you took a wrong turn. The page you're looking for doesn't exist or has been moved.
      </p>

      <Link href="/" style={{
        fontFamily: IT,
        fontWeight: 600,
        fontSize: '15px',
        background: '#222222',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '999px',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
      }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Gallery
      </Link>
    </div>
  );
}

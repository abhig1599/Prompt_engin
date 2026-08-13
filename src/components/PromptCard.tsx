'use client';
import { useState, useCallback } from 'react';
import type { Prompt } from '@/hooks/usePrompts';
import { DotmSquare1 } from '@/components/ui/dotm-square-1';
import '@/components/dotmatrix-loader.css';

const MODEL_URLS: Record<string, (p: string) => string> = {
  'ChatGPT':          p => `https://chat.openai.com/?q=${encodeURIComponent(p)}`,
  'Gemini':           p => `https://gemini.google.com/app?q=${encodeURIComponent(p)}`,
  'Claude':           p => `https://claude.ai/new?q=${encodeURIComponent(p)}`,
  'Midjourney':       p => `https://www.midjourney.com/imagine?q=${encodeURIComponent(p)}`,
  'DALL·E 3':         _  => `https://labs.openai.com/`,
  'Stable Diffusion': _  => `https://stablediffusionweb.com/`,
  'Adobe Firefly':    _  => `https://firefly.adobe.com/`,
  'Flux':             _  => `https://fal.ai/models/fal-ai/flux/dev`,
  'Other':            p => `https://chat.openai.com/?q=${encodeURIComponent(p)}`,
};
function getModelUrl(model: string | null, prompt: string) {
  if (!model) return `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`;
  return MODEL_URLS[model]?.(prompt) ?? `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`;
}

interface Props {
  prompt: Prompt;
  onFav: (id: string) => void;
  onCopy: (msg: string) => void;
  onClick: (id: string) => void;
}

const BLOB_LAYERS = [
  { scale: 1.00, opacity: 0.18, delay: '0s'   },
  { scale: 0.82, opacity: 0.28, delay: '0.3s' },
  { scale: 0.64, opacity: 0.40, delay: '0.6s' },
  { scale: 0.46, opacity: 0.60, delay: '0.9s' },
  { scale: 0.28, opacity: 0.90, delay: '1.2s' },
];

export default function PromptCard({ prompt: p, onFav, onCopy, onClick }: Props) {
  const [copied, setCopied] = useState(false);
  const [popFav, setPopFav] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(p.prompt).then(() => {
      setCopied(true); onCopy('Copied!');
      setTimeout(() => setCopied(false), 1800);
    });
  }, [p.prompt, onCopy]);

  const handleTry = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getModelUrl(p.model, p.prompt), '_blank', 'noopener,noreferrer');
  }, [p.model, p.prompt]);

  const handleFav = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFav(p.id);
    setPopFav(true);
    setTimeout(() => setPopFav(false), 400);
  }, [p.id, onFav]);

  const tags = Array.isArray(p.tags) ? p.tags :
    typeof p.tags === 'string' ? (p.tags as string).split(',').map(t => t.trim()).filter(Boolean) : [];

  const blobColor = p.model?.toLowerCase().includes('midjourney') || p.model?.toLowerCase().includes('dall')
    ? '180, 120, 150'
    : p.model?.toLowerCase().includes('claude')
    ? '130, 160, 200'
    : p.model?.toLowerCase().includes('gemini')
    ? '130, 180, 140'
    : '180, 130, 120';

  const hasImage = Boolean(p.image);

  return (
    <>
      <style>{`
        @keyframes blobPulse {
          0%,100%{ transform:scale(1) rotate(0deg); }
          33%    { transform:scale(1.06) rotate(8deg); }
          66%    { transform:scale(0.95) rotate(-6deg); }
        }
        @keyframes blobBreath {
          0%,100%{ opacity:var(--blob-op,1); }
          50%    { opacity:calc(var(--blob-op,1)*1.5); }
        }
      `}</style>

      <article
        onClick={() => onClick(p.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#111010',
          borderRadius: '28px',
          overflow: 'hidden',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '340px',
          position: 'relative',
        }}
      >
        {/* ════════════════════════════════════════
            IMAGE MODE — full-bleed, everything floats on top
        ════════════════════════════════════════ */}
        {hasImage && (
          <>
            {!imageLoaded && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#111010'
              }}>
                <DotmSquare1 size={40} className="text-white" />
              </div>
            )}
            {/* Full-bleed image behind everything */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image!}
              alt="Prompt visual"
              onLoad={() => setImageLoaded(true)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                zIndex: 0,
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s',
              }}
            />

            {/* Dark gradient scrim — top (for meta legibility) */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '50%',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)',
              zIndex: 1,
              pointerEvents: 'none',
            }} />

            {/* Dark gradient scrim — bottom (for action bar legibility) */}
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: '45%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.70) 0%, transparent 100%)',
              zIndex: 1,
              pointerEvents: 'none',
            }} />
          </>
        )}

        {/* ── Top meta (always visible, floats over image) ── */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '20px',
          paddingInline: '16px',
          gap: '2px',
        }}>
          <p style={{
            fontFamily: "'Inter Tight',sans-serif",
            fontWeight: 500,
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
            margin: 0,
          }}>
            {p.model || 'Prompt'}
          </p>
          {tags[0] && (
            <p style={{ fontFamily: "'Inter Tight',sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
              {tags[0]}
            </p>
          )}
          {/* Prompt snippet pill */}
          <div style={{
            marginTop: '8px',
            padding: '3px 12px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.15)',
            fontFamily: "'Inter Tight',sans-serif",
            fontSize: '11px',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '85%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {p.prompt.length > 36 ? p.prompt.slice(0, 36) + '…' : p.prompt}
          </div>
        </div>

        {/* ── CENTER (blob only — no blob when image present) ── */}
        {!hasImage && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative' }}>
            {/* Glow aura */}
            <div style={{
              position: 'absolute',
              width: '140px', height: '140px',
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${blobColor},0.25) 0%, transparent 70%)`,
              filter: 'blur(24px)',
              animation: 'blobBreath 4s ease-in-out infinite',
              ['--blob-op' as string]: '1',
            }} />
            {/* Squircle layers */}
            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
              {BLOB_LAYERS.map((layer, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  inset: 0,
                  transform: `scale(${layer.scale})`,
                  background: i < BLOB_LAYERS.length - 1
                    ? `rgba(${blobColor}, ${layer.opacity})`
                    : `radial-gradient(circle at 40% 35%, rgba(255,255,255,0.9) 0%, rgba(${blobColor},0.95) 60%, rgba(${blobColor},0.6) 100%)`,
                  borderRadius: '38% 62% 54% 46% / 46% 46% 54% 54%',
                  animation: `blobPulse ${4 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: layer.delay,
                  filter: i === BLOB_LAYERS.length - 1 ? 'blur(1px)' : `blur(${i * 3}px)`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Spacer so the card has height when there is an image */}
        {hasImage && <div style={{ flex: 1 }} />}

        {/* ── Action bar — always rendered, only visible on hover ── */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          padding: '0 12px 12px',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          pointerEvents: hovered ? 'auto' : 'none',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.93)',
            borderRadius: '999px',
            padding: '6px 6px 6px 18px',
          }}>
            <button
              onClick={handleCopy}
              style={{
                flex: 1,
                textAlign: 'left',
                fontFamily: "'Inter Tight',sans-serif",
                fontWeight: 500,
                fontSize: '13px',
                color: copied ? '#222222' : '#111',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {copied ? 'Copied!' : 'Copy Prompt'}
            </button>
            <button
              onClick={handleTry}
              title={`Try in ${p.model || 'ChatGPT'}`}
              style={{
                width: '36px', height: '36px',
                borderRadius: '50%',
                border: 'none',
                background: '#111',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"/>
                <polyline points="7 7 17 7 17 17"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Fav button (top-right, always visible) ── */}
        <button
          onClick={handleFav}
          aria-label={p.fav ? 'Remove from favorites' : 'Add to favorites'}
          style={{
            position: 'absolute',
            top: '12px', right: '12px',
            width: '30px', height: '30px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.15)',
            background: p.fav ? 'rgba(34,34,34,0.9)' : 'rgba(0,0,0,0.35)',
            color: p.fav ? '#fff' : 'rgba(255,255,255,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transform: popFav ? 'scale(1.25)' : 'scale(1)',
            transition: 'transform 0.15s, background 0.15s',
            zIndex: 10,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill={p.fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </article>
    </>
  );
}

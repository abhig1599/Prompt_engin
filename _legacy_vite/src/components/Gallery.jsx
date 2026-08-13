// src/components/Gallery.jsx — Caldera style
import Card from './Card';
import WebsiteCard from './WebsiteCard';
import CardSkeleton from './CardSkeleton';

function AddCard({ onAdd, galleryType }) {
  const isWebsite = galleryType === 'website';
  return (
    <article className="card card-add" onClick={onAdd} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onAdd(); }}
      aria-label={isWebsite ? "Bookmark new website" : "Add new prompt"}
    >
      <div className="card-add-inner">
        <div className="card-add-icon">+</div>
        <div className="card-add-label">{isWebsite ? "NEW WEBSITE" : "NEW PROMPT"}</div>
        <div className="card-add-sub">{isWebsite ? "Click to bookmark website" : "Click to add to your board"}</div>
      </div>
    </article>
  );
}

export default function Gallery({ prompts, onFav, onCopy, onCardClick, onAdd, isSaving, galleryType }) {
  if (prompts.length === 0 && !isSaving) {
    const isWebsite = galleryType === 'website';
    return (
      <div className="empty">
        <div className="empty-spark">CALDERA</div>
        <h2>{isWebsite ? 'NO WEBSITES BOOKMARKED YET' : 'YOUR BOARD IS EMPTY'}</h2>
        <p>{isWebsite ? 'Start building your website library — add your first bookmark below.' : 'Start building your prompt library — add your first AI prompt below.'}</p>
        <button className="btn-primary" onClick={onAdd}>
          {isWebsite ? '+ Bookmark First Website' : '+ Add First Prompt'}
        </button>
      </div>
    );
  }

  return (
    <div className="gallery">
      <AddCard onAdd={onAdd} galleryType={galleryType} />
      {isSaving && <CardSkeleton key="saving-skeleton" />}
      {[...prompts].reverse().map((p, idx) => (
        galleryType === 'website' ? (
          <WebsiteCard
            key={p.id || `web-card-${idx}`}
            prompt={p}
            onFav={onFav}
            onCopy={onCopy}
            onClick={onCardClick}
          />
        ) : (
          <Card
            key={p.id || `card-${idx}`}
            prompt={p}
            onFav={onFav}
            onCopy={onCopy}
            onClick={onCardClick}
          />
        )
      ))}
    </div>
  );
}

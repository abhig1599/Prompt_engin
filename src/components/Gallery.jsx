// src/components/Gallery.jsx — Caldera style
import Card from './Card';

function AddCard({ onAdd }) {
  return (
    <article className="card card-add" onClick={onAdd} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onAdd(); }}
      aria-label="Add new prompt"
    >
      <div className="card-add-inner">
        <div className="card-add-icon">+</div>
        <div className="card-add-label">NEW PROMPT</div>
        <div className="card-add-sub">Click to add to your board</div>
      </div>
    </article>
  );
}

export default function Gallery({ prompts, onFav, onCopy, onCardClick, onAdd }) {
  if (prompts.length === 0) {
    return (
      <div className="empty">
        <div className="empty-spark">CALDERA</div>
        <h2>YOUR BOARD IS EMPTY</h2>
        <p>Start building your prompt library — add your first AI prompt below.</p>
        <button className="btn-primary" onClick={onAdd}>+ Add First Prompt</button>
      </div>
    );
  }

  return (
    <div className="gallery">
      <AddCard onAdd={onAdd} />
      {[...prompts].reverse().map(p => (
        <Card
          key={p.id}
          prompt={p}
          onFav={onFav}
          onCopy={onCopy}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}

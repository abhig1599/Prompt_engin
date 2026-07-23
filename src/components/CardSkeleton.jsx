// src/components/CardSkeleton.jsx — Caldera style skeleton placeholder
export default function CardSkeleton() {
  return (
    <article className="card card-skeleton" aria-busy="true" aria-label="Saving prompt...">
      <div className="skeleton-img-wrap">
        <div className="skeleton-pulse skeleton-img" />
        <div className="skeleton-badge">
          <span className="skeleton-spinner" /> Saving...
        </div>
      </div>
      <div className="card-body">
        <div className="skeleton-tags">
          <div className="skeleton-pulse skeleton-tag" />
          <div className="skeleton-pulse skeleton-tag skeleton-tag-sm" />
        </div>
        <div className="skeleton-prompt">
          <div className="skeleton-pulse skeleton-line" style={{ width: '92%' }} />
          <div className="skeleton-pulse skeleton-line" style={{ width: '84%' }} />
          <div className="skeleton-pulse skeleton-line" style={{ width: '55%' }} />
        </div>
      </div>
    </article>
  );
}

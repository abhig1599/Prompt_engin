// src/components/Header.jsx — Caldera style
export default function Header({ filter, setFilter, onAdd, onTrash, trashCount }) {
  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <div className="logo">
          <img src="/Logo.svg" alt="PromptBoard Logo" className="logo-img" />
        </div>

        {/* Nav pill container — Limestone, 800px radius */}
        <nav className="nav-pill">
          <button
            className={`btn-ghost ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`btn-ghost ${filter === 'fav' ? 'active' : ''}`}
            onClick={() => setFilter('fav')}
          >
            ❤ Favorites
          </button>
        </nav>

        {/* Trash icon button with count badge */}
        <button
          className="nav-trash-btn"
          onClick={onTrash}
          aria-label={`Trash${trashCount > 0 ? ` (${trashCount} item${trashCount !== 1 ? 's' : ''})` : ''}`}
          title="View Trash"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
          {trashCount > 0 && (
            <span className="trash-badge">{trashCount}</span>
          )}
        </button>

        {/* Primary CTA — Ember pill */}
        <button className="btn-primary" onClick={onAdd}>
          + Add Prompt
        </button>
      </div>
    </header>
  );
}

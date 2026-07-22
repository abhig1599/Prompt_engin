// src/components/Header.jsx — Caldera style
export default function Header({ filter, setFilter, onAdd }) {
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

        {/* Primary CTA — Ember pill */}
        <button className="btn-primary" onClick={onAdd}>
          + Add Prompt
        </button>
      </div>
    </header>
  );
}

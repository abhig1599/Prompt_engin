// src/App.jsx
import { useState, useMemo, useCallback } from 'react';
import Header     from './components/Header';
import SearchBar  from './components/SearchBar';
import Gallery    from './components/Gallery';
import AddModal   from './components/AddModal';
import DetailModal from './components/DetailModal';
import Toast      from './components/Toast';
import { usePrompts } from './hooks/usePrompts';
import { useToast }   from './hooks/useToast';

export default function App() {
  const { prompts, addPrompt, toggleFav, deletePrompt } = usePrompts();
  const { toast, showToast } = useToast();

  const [filter,    setFilter]    = useState('all');   // 'all' | 'fav'
  const [search,    setSearch]    = useState('');
  const [showAdd,   setShowAdd]   = useState(false);
  const [detailId,  setDetailId]  = useState(null);

  // Filtered + searched prompts
  const visible = useMemo(() => {
    let list = filter === 'fav' ? prompts.filter(p => p.fav) : prompts;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.prompt.toLowerCase().includes(q) ||
        (p.model  || '').toLowerCase().includes(q) ||
        (p.tags   || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [prompts, filter, search]);

  const detailPrompt = useMemo(
    () => prompts.find(p => p.id === detailId) ?? null,
    [prompts, detailId]
  );

  const handleSave = useCallback((data) => {
    addPrompt(data);
    showToast('✦ Prompt saved to your board!');
  }, [addPrompt, showToast]);

  const handleFav = useCallback((id) => {
    const p = prompts.find(x => x.id === id);
    toggleFav(id);
    showToast(p?.fav ? '♡ Removed from favorites' : '❤ Added to favorites');
  }, [prompts, toggleFav, showToast]);

  return (
    <>
      <Header filter={filter} setFilter={setFilter} onAdd={() => setShowAdd(true)} />

      <SearchBar value={search} onChange={setSearch} />

      {/* Stats strip */}
      <div className="stats-strip">
        <p className="stats-count">
          <strong>{visible.length}</strong> prompt{visible.length !== 1 ? 's' : ''}
          {filter === 'fav' && ' · favorites'}
          {search && ` matching "${search}"`}
        </p>
      </div>

      <div className="gallery-wrap">
        <Gallery
          prompts={visible}
          onFav={handleFav}
          onCopy={showToast}
          onCardClick={setDetailId}
          onAdd={() => setShowAdd(true)}
        />
      </div>

      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onSave={handleSave}
        />
      )}

      {detailPrompt && (
        <DetailModal
          prompt={detailPrompt}
          onClose={() => setDetailId(null)}
          onFav={handleFav}
          onCopy={showToast}
        />
      )}

      <Toast msg={toast.msg} show={toast.show} />

      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={() => setShowAdd(true)}
        aria-label="Add new prompt"
        title="Add new prompt"
      >
        +
      </button>
    </>
  );
}

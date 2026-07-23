// src/App.jsx
import { useState, useMemo, useCallback } from 'react';
import Header      from './components/Header';
import SearchBar   from './components/SearchBar';
import Gallery     from './components/Gallery';
import AddModal    from './components/AddModal';
import DetailModal from './components/DetailModal';
import TrashModal  from './components/TrashModal';
import Toast       from './components/Toast';
import Loader      from './components/Loader';
import { usePrompts } from './hooks/usePrompts';
import { useToast }   from './hooks/useToast';

export default function App() {
  const [loading, setLoading] = useState(true);

  const { prompts, trash, addPrompt, updatePrompt, toggleFav, softDelete, recoverPrompt, purgeFromTrash } = usePrompts();
  const { toast, showToast } = useToast();

  const [filter,    setFilter]    = useState('all');
  const [search,    setSearch]    = useState('');
  const [showAdd,   setShowAdd]   = useState(false);
  const [detailId,  setDetailId]  = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);

  const visible = useMemo(() => {
    let list = filter === 'fav' ? prompts.filter(p => p.fav) : prompts;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.prompt.toLowerCase().includes(q) ||
        (p.model || '').toLowerCase().includes(q) ||
        (p.tags  || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [prompts, filter, search]);

  const detailPrompt = useMemo(
    () => prompts.find(p => p.id === detailId) ?? null,
    [prompts, detailId]
  );

  const handleSave = useCallback(async (data) => {
    setIsSaving(true);
    try {
      await addPrompt(data);
      showToast('Prompt saved to your board!');
    } catch (err) {
      console.error('Error saving prompt:', err);
    } finally {
      setIsSaving(false);
    }
  }, [addPrompt, showToast]);

  const handleUpdate = useCallback(async (id, data) => {
    await updatePrompt(id, data);
    showToast('Prompt updated successfully!');
  }, [updatePrompt, showToast]);

  const handleFav = useCallback((id) => {
    const p = prompts.find(x => x.id === id);
    toggleFav(id);
    showToast(p?.fav ? 'Removed from favorites' : 'Added to favorites');
  }, [prompts, toggleFav, showToast]);

  const handleDelete = useCallback(async (id) => {
    const success = await softDelete(id);
    if (success !== false) {
      setDetailId(null);
      showToast('Moved to Trash · Recoverable for 30 days');
    } else {
      showToast('Only the creator of this prompt can delete it.');
    }
  }, [softDelete, showToast]);

  const handleRecover = useCallback((id) => {
    recoverPrompt(id);
    showToast('Prompt recovered to your board!');
  }, [recoverPrompt, showToast]);

  const handlePurge = useCallback((id) => {
    purgeFromTrash(id);
    showToast('Permanently deleted.');
  }, [purgeFromTrash, showToast]);

  if (loading) return <Loader onDone={() => setLoading(false)} />;

  return (
    <>
      <Header
        filter={filter}
        setFilter={setFilter}
        onTrash={() => setShowTrash(true)}
        trashCount={trash.length}
      />

      <SearchBar value={search} onChange={setSearch} />

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
          isSaving={isSaving}
        />
      </div>

      {showAdd && (
        <AddModal onClose={() => setShowAdd(false)} onSave={handleSave} />
      )}

      {detailPrompt && (
        <DetailModal
          prompt={detailPrompt}
          onClose={() => setDetailId(null)}
          onFav={handleFav}
          onCopy={showToast}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}

      {showTrash && (
        <TrashModal
          trash={trash}
          onClose={() => setShowTrash(false)}
          onRecover={handleRecover}
          onPurge={handlePurge}
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

      {/* Bottom-left cat Lottie — web component, no npm crash risk */}
      <div className="brand-badge">
        <lottie-player
          src="/cat.json"
          background="transparent"
          speed="1"
          style={{ width: '100%', height: '100%' }}
          loop
          autoplay
        />
      </div>
    </>
  );
}

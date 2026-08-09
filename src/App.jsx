// src/App.jsx
import { useState, useMemo, useCallback } from 'react';
import Header      from './components/Header';
import SearchBar   from './components/SearchBar';
import Gallery     from './components/Gallery';
import AddModal           from './components/AddModal';
import DetailModal        from './components/DetailModal';
import WebsiteDetailModal from './components/WebsiteDetailModal';
import TrashModal         from './components/TrashModal';
import Toast             from './components/Toast';
import Loader            from './components/Loader';
import BottomNav         from './components/BottomNav';
import { usePrompts }    from './hooks/usePrompts';
import { useToast }      from './hooks/useToast';

function isWebsitePrompt(p) {
  const text = (p.prompt || '').toLowerCase();
  const tags = (p.tags || []).map(t => (t || '').toLowerCase());
  const webKeywords = ['website', 'web', 'html', 'css', 'react', 'ui', 'ux', 'code', 'frontend', 'app', 'site', 'landing page', 'portfolio', 'dashboard', 'component'];
  const hasWebTag = tags.some(t => webKeywords.some(k => t.includes(k)));
  const hasWebText = webKeywords.some(k => text.includes(k));
  return hasWebTag || hasWebText;
}

function matchesGalleryType(p, type) {
  if (type === 'website') {
    return isWebsitePrompt(p);
  }
  if (type === 'image') {
    const isImageModel = ['midjourney', 'dall·e', 'dall-e', 'stable diffusion', 'adobe firefly', 'google imagen', 'flux', 'imagen'].some(m => (p.model || '').toLowerCase().includes(m));
    return !!p.image || isImageModel || !isWebsitePrompt(p);
  }
  return true;
}

export default function App() {
  const [loading, setLoading] = useState(true);

  const { prompts, trash, addPrompt, updatePrompt, toggleFav, softDelete, recoverPrompt, purgeFromTrash } = usePrompts();
  const { toast, showToast } = useToast();

  const [filter,      setFilter]      = useState('all');
  const [galleryType, setGalleryType] = useState('image');
  const [search,      setSearch]      = useState('');
  const [showAdd,     setShowAdd]     = useState(false);
  const [detailId,    setDetailId]    = useState(null);
  const [showTrash,   setShowTrash]   = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);

  const visible = useMemo(() => {
    let list = filter === 'fav' ? prompts.filter(p => p.fav) : prompts;
    list = list.filter(p => matchesGalleryType(p, galleryType));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.prompt.toLowerCase().includes(q) ||
        (p.model || '').toLowerCase().includes(q) ||
        (p.tags  || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [prompts, filter, galleryType, search]);

  const detailPrompt = useMemo(
    () => prompts.find(p => p.id === detailId) ?? null,
    [prompts, detailId]
  );

  const handleSave = useCallback(async (data) => {
    setIsSaving(true);
    try {
      await addPrompt(data);
      showToast(galleryType === 'website' ? 'Website saved to bookmarks!' : 'Prompt saved to your board!');
    } catch (err) {
      console.error('Error saving prompt:', err);
    } finally {
      setIsSaving(false);
    }
  }, [addPrompt, showToast, galleryType]);

  const handleUpdate = useCallback(async (id, data) => {
    await updatePrompt(id, data);
    showToast('Updated successfully!');
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
      showToast('Only the creator can delete this item.');
    }
  }, [softDelete, showToast]);

  const handleRecover = useCallback((id) => {
    recoverPrompt(id);
    showToast('Recovered to your board!');
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
        onAdd={() => setShowAdd(true)}
        onTrash={() => setShowTrash(true)}
        trashCount={trash.length}
      />

      <SearchBar value={search} onChange={setSearch} />

      <div className="stats-strip" style={{ display: 'flex', alignItems: 'center' }}>
        <p className="stats-count">
          <strong>{visible.length}</strong> {galleryType === 'website' ? 'website' : 'prompt'}{visible.length !== 1 ? 's' : ''}
          {galleryType === 'image' ? ' · Image Gallery' : ' · Website Gallery'}
          {filter === 'fav' && ' · favorites'}
          {search && ` matching "${search}"`}
        </p>
        {galleryType === 'website' && visible.length > 0 && (
        )}
      </div>

      <div className="gallery-wrap">
        <Gallery
          prompts={visible}
          onFav={handleFav}
          onCopy={showToast}
          onCardClick={setDetailId}
          onAdd={() => setShowAdd(true)}
          isSaving={isSaving}
          galleryType={galleryType}
        />
      </div>

      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onSave={handleSave}
          galleryType={galleryType}
        />
      )}

      {detailPrompt && (
        galleryType === 'website' ? (
          <WebsiteDetailModal
            prompt={detailPrompt}
            onClose={() => setDetailId(null)}
            onFav={handleFav}
            onCopy={showToast}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ) : (
          <DetailModal
            prompt={detailPrompt}
            onClose={() => setDetailId(null)}
            onFav={handleFav}
            onCopy={showToast}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        )
      )}

      {showTrash && (
        <TrashModal
          trash={trash}
          onClose={() => setShowTrash(false)}
          onRecover={handleRecover}
          onPurge={handlePurge}
        />
      )}

      <BottomNav activeType={galleryType} onSelectType={setGalleryType} />

      <Toast msg={toast.msg} show={toast.show} />

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

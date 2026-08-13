'use client';
import { useState, useMemo, useCallback, Suspense } from 'react';
import { usePrompts } from '@/hooks/usePrompts';
import { useToast } from '@/hooks/useToast';
import Header from '@/components/layout/Header';
import PromptCard from '@/components/PromptCard';
import NewPromptCard from '@/components/NewPromptCard';
import AddModal from '@/components/AddModal';
import TrashModal from '@/components/TrashModal';
import DetailModal from '@/components/DetailModal';
import EditPromptModal from '@/components/EditPromptModal';
import Toast from '@/components/Toast';
import BottomNav from '@/components/layout/BottomNav';

const IT = "'Inter Tight', sans-serif";

function HomeContent() {
  const { prompts, loading, trash, addPrompt, editPrompt, toggleFav, softDelete, recoverPrompt, purgeFromTrash } = usePrompts();
  const { toast, showToast } = useToast();

  const [filter, setFilter]     = useState<'all' | 'fav'>('all');
  const [search, setSearch]     = useState('');
  const [showAdd, setShowAdd]   = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [_detail, setDetail]    = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState<string | null>(null);

  const visible = useMemo(() => {
    let list = filter === 'fav' ? prompts.filter(p => p.fav) : prompts;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.prompt.toLowerCase().includes(q) ||
        (p.model || '').toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [prompts, filter, search]);

  const selectedDetailPrompt = useMemo(() => prompts.find(p => p.id === _detail), [prompts, _detail]);
  const selectedEditPrompt = useMemo(() => prompts.find(p => p.id === showEdit), [prompts, showEdit]);

  const handleSave = useCallback(async (data: Parameters<typeof addPrompt>[0]) => {
    setIsSaving(true);
    try { await addPrompt(data); showToast('Saved.'); }
    catch { showToast('Failed — check connection.'); }
    finally { setIsSaving(false); }
  }, [addPrompt, showToast]);

  const handleEdit = useCallback(async (id: string, data: Parameters<typeof editPrompt>[1]) => {
    setIsSaving(true);
    try { await editPrompt(id, data); showToast('Updated.'); }
    catch { showToast('Failed — check connection.'); }
    finally { setIsSaving(false); }
  }, [editPrompt, showToast]);

  const handleFav = useCallback((id: string) => {
    const p = prompts.find(x => x.id === id);
    toggleFav(id);
    showToast(p?.fav ? 'Removed from favorites' : 'Added to favorites');
  }, [prompts, toggleFav, showToast]);

  const handleDelete = useCallback(async (id: string) => {
    const ok = await softDelete(id);
    if (ok !== false) { setDetail(null); showToast('Moved to trash.'); }
    else showToast('Only creators can delete.');
  }, [softDelete, showToast]);

  return (
    <div style={{ minHeight: '100vh', background: '#e9e9e9' }}>
      <Header
        filter={filter}
        onFilterChange={setFilter}
        onAdd={() => setShowAdd(true)}
        onTrash={() => setShowTrash(true)}
        trashCount={trash.length}
      />

      {/* ── Section header — editorial kicker + count ── */}
      <div style={{ padding: '48px 24px 0', maxWidth: '1400px', margin: '0 auto' }}>
        <p style={{ fontFamily: IT, fontWeight: 400, fontSize: '11px', color: '#808080', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>
          {filter === 'fav' ? 'Favorites' : 'Latest'}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: IT, fontWeight: 300, fontSize: 'clamp(42px, 6vw, 72px)', lineHeight: 0.93, color: '#222222', margin: 0 }}>
            {loading ? 'Loading…' : `${visible.length} Prompt${visible.length !== 1 ? 's' : ''}`}
          </h1>
          {/* Inline search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #dedede', borderRadius: '8px', padding: '6px 12px', minWidth: '260px', flex: '0 1 320px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#808080" strokeWidth="1.75" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search prompts, tags, models…"
              style={{ fontFamily: IT, fontWeight: 400, fontSize: '13px', color: '#222222', background: 'none', border: 'none', outline: 'none', width: '100%' }}
            />
          </div>
        </div>

        {/* Hairline divider */}
        <div style={{ height: '1px', background: '#dedede', margin: '20px 0 0' }} />
      </div>

      {/* ── Card grid ── */}
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background: '#f0f0f0', borderRadius: '8px', aspectRatio: '3/4', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            <NewPromptCard onClick={() => setShowAdd(true)} isSaving={isSaving} />
            {visible.map(p => (
              <PromptCard
                key={p.id}
                prompt={p}
                onFav={handleFav}
                onCopy={showToast}
                onClick={setDetail}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && visible.length === 0 && (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <p style={{ fontFamily: IT, fontWeight: 300, fontSize: '42px', color: '#b8b8b8', lineHeight: 0.93, margin: '0 0 16px' }}>Empty</p>
            <p style={{ fontFamily: IT, fontWeight: 400, fontSize: '14px', color: '#808080', margin: 0 }}>
              {filter === 'fav' ? 'No favorites yet.' : search ? `No results for "${search}"` : 'Add your first prompt to get started.'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSave={handleSave} />}
      {showTrash && (
        <TrashModal
          trash={trash}
          onClose={() => setShowTrash(false)}
          onRecover={id => { recoverPrompt(id); showToast('Recovered.'); }}
          onPurge={id => { purgeFromTrash(id); showToast('Deleted permanently.'); }}
        />
      )}
      {selectedDetailPrompt && (
        <DetailModal
          prompt={selectedDetailPrompt}
          onClose={() => setDetail(null)}
          onEdit={() => { setShowEdit(selectedDetailPrompt.id); setDetail(null); }}
          onDelete={handleDelete}
          onCopy={showToast}
        />
      )}
      {selectedEditPrompt && (
        <EditPromptModal
          prompt={selectedEditPrompt}
          onClose={() => setShowEdit(null)}
          onSave={handleEdit}
        />
      )}

      <BottomNav />
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}

export default function Home() {
  return <Suspense><HomeContent /></Suspense>;
}

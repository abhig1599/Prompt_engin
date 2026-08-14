'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useWebsites } from '@/hooks/useWebsites';
import { useToast } from '@/hooks/useToast';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import WebsiteCard from '@/components/WebsiteCard';
import NewWebsiteCard from '@/components/NewWebsiteCard';
import AddWebsiteModal from '@/components/AddWebsiteModal';
import WebsiteDetailModal from '@/components/WebsiteDetailModal';
import WebsiteTrashModal from '@/components/WebsiteTrashModal';
import EditWebsiteModal from '@/components/EditWebsiteModal';
import Toast from '@/components/Toast';

const IT = "'Inter Tight', sans-serif";

export default function WebsitesPage() {
  const { websites, trash, loading, addWebsite, editWebsite, toggleFav, softDelete, recoverWebsite, purgeFromTrash } = useWebsites();
  const { toast, showToast } = useToast();

  const [filter, setFilter] = useState<'all' | 'fav'>('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [_detail, setDetail] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(24);

  const visible = useMemo(() => {
    let list = filter === 'fav' ? websites.filter(w => w.isFav) : websites;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.url.toLowerCase().includes(q) ||
        (w.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [websites, search, filter]);

  // Reset limit when filter or search changes
  useEffect(() => {
    setDisplayLimit(24);
  }, [filter, search]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        setDisplayLimit(prev => Math.min(prev + 12, visible.length));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visible.length]);

  const selectedDetailWebsite = useMemo(() => websites.find(w => w.id === _detail), [websites, _detail]);
  const selectedEditWebsite = useMemo(() => websites.find(w => w.id === showEdit), [websites, showEdit]);

  const handleSave = useCallback(async (data: Parameters<typeof addWebsite>[0]) => {
    try { 
      await addWebsite(data); 
      showToast('Website added.'); 
    } catch { 
      showToast('Failed to add website.'); 
    }
  }, [addWebsite, showToast]);

  const handleEditSave = useCallback(async (id: string, data: Parameters<typeof editWebsite>[1]) => {
    try { 
      await editWebsite(id, data); 
      showToast('Website updated.'); 
    } catch { 
      showToast('Failed to update website.'); 
    }
  }, [editWebsite, showToast]);

  const handleDelete = useCallback((id: string) => {
    softDelete(id);
    setDetail(null);
    showToast('Moved to trash.');
  }, [softDelete, showToast]);

  return (
    <div style={{ minHeight: '100vh', background: '#e9e9e9' }}>
      <Header
        filter={filter}
        onFilterChange={setFilter as any}
        onAdd={() => setShowAdd(true)}
        onTrash={() => setShowTrash(true)}
        trashCount={trash.length}
      />

      {/* ── Section header ── */}
      <div style={{ padding: '48px 24px 0', maxWidth: '1400px', margin: '0 auto' }}>
        <p style={{ fontFamily: IT, fontWeight: 400, fontSize: '11px', color: '#808080', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>
          Bookmarks
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: IT, fontWeight: 300, fontSize: 'clamp(42px, 6vw, 72px)', lineHeight: 0.93, color: '#222222', margin: 0 }}>
            {loading ? 'Loading…' : `${visible.length} Website${visible.length !== 1 ? 's' : ''}`}
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
              placeholder="Search websites, tags…"
              style={{ fontFamily: IT, fontWeight: 400, fontSize: '13px', color: '#222222', background: 'none', border: 'none', outline: 'none', width: '100%' }}
            />
          </div>
        </div>

        <div style={{ height: '1px', background: '#dedede', margin: '20px 0 0' }} />
      </div>

      {/* ── Card grid ── */}
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', paddingBottom: '120px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: '#f0f0f0', borderRadius: '16px', minHeight: '120px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            <NewWebsiteCard onClick={() => setShowAdd(true)} />
            {visible.slice(0, displayLimit).map(w => (
              <WebsiteCard
                key={w.id}
                website={w}
                onClick={setDetail}
                onFav={toggleFav}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && visible.length === 0 && (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <p style={{ fontFamily: IT, fontWeight: 300, fontSize: '42px', color: '#b8b8b8', lineHeight: 0.93, margin: '0 0 16px' }}>No Websites</p>
            <p style={{ fontFamily: IT, fontWeight: 400, fontSize: '14px', color: '#808080', margin: 0 }}>
              {search ? `No results for "${search}"` : 'Click + in the top nav to add your first website.'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd && <AddWebsiteModal onClose={() => setShowAdd(false)} onSave={handleSave} />}
      {showTrash && (
        <WebsiteTrashModal
          trash={trash}
          onClose={() => setShowTrash(false)}
          onRecover={id => { recoverWebsite(id); showToast('Recovered.'); }}
          onPurge={id => { purgeFromTrash(id); showToast('Deleted permanently.'); }}
        />
      )}
      {selectedDetailWebsite && (
        <WebsiteDetailModal
          website={selectedDetailWebsite}
          onClose={() => setDetail(null)}
          onEdit={() => { setShowEdit(selectedDetailWebsite.id); setDetail(null); }}
          onDelete={handleDelete}
        />
      )}
      {selectedEditWebsite && (
        <EditWebsiteModal
          website={selectedEditWebsite}
          onClose={() => setShowEdit(null)}
          onSave={handleEditSave}
        />
      )}

      <BottomNav />
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}

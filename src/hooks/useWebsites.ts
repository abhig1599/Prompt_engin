'use client';
import { useState, useCallback, useEffect } from 'react';
import { databases, ID, config } from '@/lib/appwrite';

const WEBSITES_TRASH_KEY = 'promptboard_websites_trash_v1';
const WEBSITES_FAV_KEY   = 'promptboard_fav_websites_v1';
const WEBSITES_MY_KEY    = 'promptboard_my_websites_v1';
const TRASH_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface Website {
  id: string;
  name: string;
  url: string;
  tags: string[];
  faviconUrl: string | null;
  createdAt: string;
  isOwner?: boolean;
  isFav?: boolean;
}

export interface TrashedWebsite extends Website {
  deletedAt: string;
}

function load<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
  catch { return null; }
}

function save(key: string, val: unknown) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* noop */ }
}

function parseTags(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return (raw as string[]).filter(Boolean);
  if (typeof raw === 'string') return raw.split(',').map(t => t.trim()).filter(Boolean);
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDoc(doc: any, favsMap: Record<string, boolean>, myIds: string[]): Website {
  const docTags = parseTags(doc.tags);
  return {
    id: doc.$id,
    name: doc.name || '',
    url: doc.url || '',
    tags: docTags,
    faviconUrl: doc.faviconUrl || null,
    createdAt: doc.$createdAt,
    isOwner: myIds.includes(doc.$id),
    isFav: !!favsMap[doc.$id],
  };
}

export function useWebsites() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [trash, setTrash] = useState<TrashedWebsite[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWebsites = useCallback(async () => {
    setLoading(true);
    try {
      if (!config.websitesCollectionId) {
        console.warn('No websitesCollectionId configured in .env.local');
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await databases.listDocuments<any>(config.databaseId, config.websitesCollectionId);
      const myIds = load<string[]>(WEBSITES_MY_KEY) ?? [];
      const favsMap = load<Record<string, boolean>>(WEBSITES_FAV_KEY) ?? {};
      
      const mapped = res.documents.map(d => mapDoc(d, favsMap, myIds));
      // Sort by newest first
      mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setWebsites(mapped);
    } catch (err) {
      console.error('Failed to load websites:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWebsites();
    const savedTrash = load<TrashedWebsite[]>(WEBSITES_TRASH_KEY) ?? [];
    setTrash(savedTrash.filter(w => Date.now() - new Date(w.deletedAt).getTime() < TRASH_TTL));
  }, [loadWebsites]);

  useEffect(() => { save(WEBSITES_TRASH_KEY, trash); }, [trash]);

  const addWebsite = useCallback(async (data: Omit<Website, 'id' | 'createdAt' | 'isOwner' | 'isFav'>) => {
    if (!config.websitesCollectionId) throw new Error('websitesCollectionId is missing');
    
    const payload = {
      name: data.name,
      url: data.url,
      tags: data.tags || [],
      faviconUrl: data.faviconUrl || null,
    };
    
    const res = await databases.createDocument(config.databaseId, config.websitesCollectionId, ID.unique(), payload);
    const myIds = load<string[]>(WEBSITES_MY_KEY) ?? [];
    if (!myIds.includes(res.$id)) { myIds.push(res.$id); save(WEBSITES_MY_KEY, myIds); }

    const favsMap = load<Record<string, boolean>>(WEBSITES_FAV_KEY) ?? {};
    const mapped = mapDoc(res, favsMap, myIds);
    setWebsites(prev => [mapped, ...prev]);
    return mapped;
  }, []);

  const editWebsite = useCallback(async (id: string, data: Partial<Omit<Website, 'id' | 'createdAt' | 'isOwner' | 'isFav'>>) => {
    if (!config.websitesCollectionId) throw new Error('websitesCollectionId is missing');
    
    const target = websites.find(w => w.id === id);
    if (!target || target.isOwner === false) throw new Error('Not authorized to edit');
    
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.url !== undefined) payload.url = data.url;
    if (data.tags !== undefined) payload.tags = data.tags;
    if (data.faviconUrl !== undefined) payload.faviconUrl = data.faviconUrl;

    const res = await databases.updateDocument(config.databaseId, config.websitesCollectionId, id, payload);
    
    const myIds = load<string[]>(WEBSITES_MY_KEY) ?? [];
    const favsMap = load<Record<string, boolean>>(WEBSITES_FAV_KEY) ?? {};
    const mapped = mapDoc(res, favsMap, myIds);
    
    setWebsites(prev => prev.map(w => w.id === id ? mapped : w));
    return mapped;
  }, [websites]);

  const toggleFav = useCallback((id: string) => {
    const favsMap = load<Record<string, boolean>>(WEBSITES_FAV_KEY) ?? {};
    favsMap[id] = !favsMap[id];
    save(WEBSITES_FAV_KEY, favsMap);
    setWebsites(prev => prev.map(w => w.id === id ? { ...w, isFav: favsMap[id] } : w));
  }, []);

  const softDelete = useCallback(async (id: string) => {
    if (!config.websitesCollectionId) throw new Error('websitesCollectionId is missing');
    const target = websites.find(w => w.id === id);
    if (!target || target.isOwner === false) return false;
    
    try { await databases.deleteDocument(config.databaseId, config.websitesCollectionId, id); }
    catch (err) { console.error('Delete error:', err); }
    
    setTrash(t => [{ ...target, deletedAt: new Date().toISOString() }, ...t]);
    setWebsites(prev => prev.filter(w => w.id !== id));
    return true;
  }, [websites]);

  const recoverWebsite = useCallback(async (id: string) => {
    if (!config.websitesCollectionId) return;
    const target = trash.find(w => w.id === id);
    if (!target) return;
    
    const { deletedAt: _d, ...restored } = target;
    const payload = {
      name: restored.name,
      url: restored.url,
      tags: restored.tags || [],
      faviconUrl: restored.faviconUrl || null,
    };
    
    try {
      const res = await databases.createDocument(config.databaseId, config.websitesCollectionId, ID.unique(), payload);
      const myIds = load<string[]>(WEBSITES_MY_KEY) ?? [];
      const favsMap = load<Record<string, boolean>>(WEBSITES_FAV_KEY) ?? {};
      setWebsites(prev => [mapDoc(res, favsMap, myIds), ...prev]);
    } catch (err) { console.error('Recover error:', err); }
    
    setTrash(prev => prev.filter(w => w.id !== id));
  }, [trash]);

  const purgeFromTrash = useCallback((id: string) => {
    setTrash(prev => prev.filter(w => w.id !== id));
  }, []);

  return { websites, trash, loading, addWebsite, editWebsite, toggleFav, softDelete, recoverWebsite, purgeFromTrash };
}

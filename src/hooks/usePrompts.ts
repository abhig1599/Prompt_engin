'use client';
import { useState, useCallback, useEffect } from 'react';
import { databases, storage, ID, config } from '@/lib/appwrite';

const TRASH_KEY = 'promptboard_trash_v1';
const FAV_KEY   = 'promptboard_favs_v1';
const TAGS_KEY  = 'promptboard_tags_v1';
const INPUTS_KEY = 'promptboard_inputs_v1';
const MY_KEY    = 'promptboard_my_prompts_v1';
const TRASH_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface Prompt {
  id: string;
  prompt: string;
  image: string | null;
  model: string | null;
  tags: string[];
  inputsNeeded: string | null;
  fav: boolean;
  isOwner: boolean;
  createdAt: string;
}

export interface TrashedPrompt extends Prompt {
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
function mapDoc(doc: any, favsMap: Record<string, boolean>, tagsMap: Record<string, string[]>, inputsMap: Record<string, string>, myIds: string[]): Prompt {
  const localTags = tagsMap[doc.$id];
  const docTags = parseTags(doc.tags);
  return {
    id: doc.$id,
    prompt: doc.content || '',
    image: doc.imageUrl || null,
    model: doc.model || null,
    tags: (localTags && localTags.length > 0) ? localTags : docTags,
    inputsNeeded: inputsMap[doc.$id] || doc.inputsNeeded || null,
    fav: !!favsMap[doc.$id],
    isOwner: myIds.includes(doc.$id),
    createdAt: doc.$createdAt,
  };
}

function getFileViewUrl(fileId: string): string | null {
  if (!fileId || !config.bucketId) return null;
  try {
    // Construct view URL manually for appwrite
    const ep = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
    const proj = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
    return `${ep}/storage/buckets/${config.bucketId}/files/${fileId}/view?project=${proj}`;
  } catch { return null; }
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [trash, setTrash] = useState<TrashedPrompt[]>(() => {
    const saved = load<TrashedPrompt[]>(TRASH_KEY) ?? [];
    return saved.filter(p => Date.now() - new Date(p.deletedAt).getTime() < TRASH_TTL);
  });

  useEffect(() => { save(TRASH_KEY, trash); }, [trash]);

  const loadPrompts = useCallback(async () => {
    if (!config.databaseId || !config.collectionId) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await databases.listDocuments(config.databaseId, config.collectionId);
      const favsMap = load<Record<string, boolean>>(FAV_KEY) ?? {};
      const tagsMap = load<Record<string, string[]>>(TAGS_KEY) ?? {};
      const inputsMap = load<Record<string, string>>(INPUTS_KEY) ?? {};
      let myIds = load<string[]>(MY_KEY);
      if (!myIds) {
        myIds = res.documents.map(d => d.$id);
        save(MY_KEY, myIds);
      }
      setPrompts(res.documents.map(doc => mapDoc(doc, favsMap, tagsMap, inputsMap, myIds!)));
    } catch (e) {
      console.error('Error loading prompts:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPrompts(); }, [loadPrompts]);

  const addPrompt = useCallback(async (data: {
    prompt: string;
    imageFile?: File | null;
    image?: string | null;
    tags?: string[];
    model?: string | null;
    inputsNeeded?: string | null;
  }) => {
    let imageUrl = data.image || null;
    if (data.imageFile && config.bucketId) {
      try {
        const fileRes = await storage.createFile(config.bucketId, ID.unique(), data.imageFile);
        imageUrl = getFileViewUrl(fileRes.$id);
      } catch (err) { console.error('Image upload error:', err); }
    }
    const payload = {
      title: (data.prompt || '').slice(0, 30) + '...',
      content: data.prompt,
      model: data.model || 'ChatGPT',
      imageUrl: imageUrl,
    };
    const res = await databases.createDocument(config.databaseId, config.collectionId, ID.unique(), payload);
    const myIds = load<string[]>(MY_KEY) ?? [];
    if (!myIds.includes(res.$id)) { myIds.push(res.$id); save(MY_KEY, myIds); }

    const tagsMap = load<Record<string, string[]>>(TAGS_KEY) ?? {};
    if (data.tags?.length) { tagsMap[res.$id] = data.tags; save(TAGS_KEY, tagsMap); }
    const inputsMap = load<Record<string, string>>(INPUTS_KEY) ?? {};
    if (data.inputsNeeded) { inputsMap[res.$id] = data.inputsNeeded; save(INPUTS_KEY, inputsMap); }

    const favsMap = load<Record<string, boolean>>(FAV_KEY) ?? {};
    const mapped = mapDoc(res, favsMap, tagsMap, inputsMap, myIds);
    setPrompts(prev => [mapped, ...prev]);
    return mapped;
  }, []);
  const editPrompt = useCallback(async (id: string, data: {
    prompt?: string;
    imageFile?: File | null;
    image?: string | null;
    tags?: string[];
    model?: string | null;
    inputsNeeded?: string | null;
  }) => {
    let imageUrl = data.image;
    if (data.imageFile && config.bucketId) {
      try {
        const fileRes = await storage.createFile(config.bucketId, ID.unique(), data.imageFile);
        imageUrl = getFileViewUrl(fileRes.$id) || undefined;
      } catch (err) { console.error('Image upload error:', err); }
    }
    const payload: any = {};
    if (data.prompt !== undefined) {
      payload.content = data.prompt;
      payload.title = data.prompt.slice(0, 30) + '...';
    }
    if (data.model !== undefined) payload.model = data.model;
    if (imageUrl !== undefined) payload.imageUrl = imageUrl;
    
    // Update appwrite document
    const res = await databases.updateDocument(config.databaseId, config.collectionId, id, payload);
    
    // Update local maps
    const myIds = load<string[]>(MY_KEY) ?? [];
    const tagsMap = load<Record<string, string[]>>(TAGS_KEY) ?? {};
    if (data.tags !== undefined) { tagsMap[id] = data.tags; save(TAGS_KEY, tagsMap); }
    const inputsMap = load<Record<string, string>>(INPUTS_KEY) ?? {};
    if (data.inputsNeeded !== undefined) { 
      if (data.inputsNeeded) inputsMap[id] = data.inputsNeeded; 
      else delete inputsMap[id];
      save(INPUTS_KEY, inputsMap); 
    }
    
    const favsMap = load<Record<string, boolean>>(FAV_KEY) ?? {};
    const mapped = mapDoc(res, favsMap, tagsMap, inputsMap, myIds);
    
    setPrompts(prev => prev.map(p => p.id === id ? mapped : p));
    return mapped;
  }, []);
  const toggleFav = useCallback((id: string) => {
    const favsMap = load<Record<string, boolean>>(FAV_KEY) ?? {};
    favsMap[id] = !favsMap[id];
    save(FAV_KEY, favsMap);
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, fav: favsMap[id] } : p));
  }, []);

  const softDelete = useCallback(async (id: string) => {
    const target = prompts.find(p => p.id === id);
    if (!target || target.isOwner === false) return false;
    try { await databases.deleteDocument(config.databaseId, config.collectionId, id); }
    catch (err) { console.error('Delete error:', err); }
    setTrash(t => [...t, { ...target, deletedAt: new Date().toISOString() }]);
    setPrompts(prev => prev.filter(p => p.id !== id));
    return true;
  }, [prompts]);

  const recoverPrompt = useCallback(async (id: string) => {
    const target = trash.find(p => p.id === id);
    if (!target) return;
    const { deletedAt: _d, ...restored } = target;
    const payload = { title: restored.prompt.slice(0, 30) + '...', content: restored.prompt, model: restored.model || 'ChatGPT', imageUrl: restored.image || null };
    try {
      const res = await databases.createDocument(config.databaseId, config.collectionId, ID.unique(), payload);
      const favsMap = load<Record<string, boolean>>(FAV_KEY) ?? {};
      const tagsMap = load<Record<string, string[]>>(TAGS_KEY) ?? {};
      const inputsMap = load<Record<string, string>>(INPUTS_KEY) ?? {};
      setPrompts(prev => [...prev, mapDoc(res, favsMap, tagsMap, inputsMap, [])]);
    } catch (err) { console.error('Recover error:', err); }
    setTrash(prev => prev.filter(p => p.id !== id));
  }, [trash]);

  const purgeFromTrash = useCallback((id: string) => {
    setTrash(prev => prev.filter(p => p.id !== id));
  }, []);

  return { prompts, loading, trash, addPrompt, editPrompt, toggleFav, softDelete, recoverPrompt, purgeFromTrash, reload: loadPrompts };
}

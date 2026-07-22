import { useState, useCallback, useEffect } from 'react';
import { databases, storage, ID } from '../api/appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COL_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

const TRASH_STORAGE_KEY = 'promptboard_trash_v1';
const TRASH_TTL_DAYS    = 30;

function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function purgeExpiredTrash(trashList) {
  const cutoff = Date.now() - TRASH_TTL_DAYS * 24 * 60 * 60 * 1000;
  return trashList.filter(p => new Date(p.deletedAt).getTime() > cutoff);
}

const mapDoc = (doc) => ({
  id: doc.$id,
  prompt: doc.content,
  image: doc.imageUrl,
  model: doc.model,
  tags: [], 
  fav: false 
});

export function usePrompts() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trash, setTrash] = useState(() => {
    const saved = load(TRASH_STORAGE_KEY) ?? [];
    return purgeExpiredTrash(saved);
  });

  useEffect(() => {
    localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trash));
  }, [trash]);

  const loadPrompts = async () => {
    if (!DB_ID || !COL_ID) return setLoading(false);
    try {
      setLoading(true);
      const res = await databases.listDocuments(DB_ID, COL_ID);
      setPrompts(res.documents.map(mapDoc));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPrompts(); }, []);

  const addPrompt = async (data) => {
    let imageUrl = null;
    if (data.imageFile && BUCKET_ID) {
      try {
        const fileRes = await storage.createFile(BUCKET_ID, ID.unique(), data.imageFile);
        imageUrl = storage.getFileView(BUCKET_ID, fileRes.$id).href;
      } catch (err) { console.error(err); }
    }
    const payload = {
      title: data.prompt.slice(0, 30) + '...',
      content: data.prompt,
      model: data.model || null,
      imageUrl: imageUrl
    };
    const res = await databases.createDocument(DB_ID, COL_ID, ID.unique(), payload);
    setPrompts(prev => [mapDoc(res), ...prev]);
    return res;
  };

  const softDelete = async (id) => {
    const target = prompts.find(p => p.id === id);
    if (!target) return;
    
    await databases.deleteDocument(DB_ID, COL_ID, id);
    
    const trashed = { ...target, deletedAt: new Date().toISOString() };
    setTrash(t => [...t, trashed]);
    setPrompts(prev => prev.filter(p => p.id !== id));
  };

  const recoverPrompt = async (id) => {
    const target = trash.find(p => p.id === id);
    if (!target) return;
    
    const { deletedAt, ...restored } = target;
    
    const payload = {
      title: restored.prompt.slice(0, 30) + '...',
      content: restored.prompt,
      model: restored.model || null,
      imageUrl: restored.image || null
    };

    const res = await databases.createDocument(DB_ID, COL_ID, id, payload);
    setPrompts(prev => [...prev, mapDoc(res)]);
    setTrash(prev => prev.filter(p => p.id !== id));
  };

  const purgeFromTrash = useCallback((id) => {
    setTrash(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleFav = (id) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, fav: !p.fav } : p));
  };

  return { 
    prompts, 
    trash, 
    loading, 
    addPrompt, 
    softDelete, 
    recoverPrompt, 
    purgeFromTrash, 
    toggleFav, 
    loadPrompts 
  };
}

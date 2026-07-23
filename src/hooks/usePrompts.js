import { useState, useCallback, useEffect } from 'react';
import { databases, storage, ID } from '../api/appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COL_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

const TRASH_STORAGE_KEY = 'promptboard_trash_v1';
const FAV_STORAGE_KEY   = 'promptboard_favs_v1';
const TAGS_STORAGE_KEY  = 'promptboard_tags_v1';
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

function getFileUrl(fileId) {
  if (!fileId || !BUCKET_ID) return null;
  try {
    const viewRes = storage.getFileView(BUCKET_ID, fileId);
    return typeof viewRes === 'string' ? viewRes : (viewRes?.href ?? null);
  } catch (e) {
    console.error('Error fetching file view URL:', e);
    return null;
  }
}

const mapDoc = (doc, favsMap = {}, tagsMap = {}) => ({
  id: doc.$id,
  prompt: doc.content,
  image: doc.imageUrl,
  model: doc.model,
  tags: tagsMap[doc.$id] || [],
  fav: !!favsMap[doc.$id],
  createdAt: doc.$createdAt
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
      const favsMap = load(FAV_STORAGE_KEY) ?? {};
      const tagsMap = load(TAGS_STORAGE_KEY) ?? {};
      setPrompts(res.documents.map(doc => mapDoc(doc, favsMap, tagsMap)));
    } catch (e) {
      console.error('Error loading prompts from Appwrite:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPrompts(); }, []);

  const addPrompt = async (data) => {
    let imageUrl = data.image || null;
    if (data.imageFile && BUCKET_ID) {
      try {
        const fileRes = await storage.createFile(BUCKET_ID, ID.unique(), data.imageFile);
        imageUrl = getFileUrl(fileRes.$id);
      } catch (err) {
        console.error('Error uploading image to Appwrite storage:', err);
      }
    }
    const payload = {
      title: (data.prompt || '').slice(0, 30) + '...',
      content: data.prompt,
      model: data.model || 'ChatGPT',
      imageUrl: imageUrl
    };

    const res = await databases.createDocument(DB_ID, COL_ID, ID.unique(), payload);

    const tagsMap = load(TAGS_STORAGE_KEY) ?? {};
    if (data.tags && data.tags.length > 0) {
      tagsMap[res.$id] = data.tags;
      localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tagsMap));
    }

    const favsMap = load(FAV_STORAGE_KEY) ?? {};
    const mapped = mapDoc(res, favsMap, tagsMap);

    setPrompts(prev => [mapped, ...prev]);
    return mapped;
  };

  const updatePrompt = async (id, data) => {
    const currentPrompt = prompts.find(p => p.id === id);
    let imageUrl = currentPrompt ? currentPrompt.image : null;

    if (data.removeImage) {
      imageUrl = null;
    } else if (data.imageFile && BUCKET_ID) {
      try {
        const fileRes = await storage.createFile(BUCKET_ID, ID.unique(), data.imageFile);
        imageUrl = getFileUrl(fileRes.$id);
      } catch (err) {
        console.error('Error uploading replacement image to Appwrite:', err);
      }
    } else if (data.image !== undefined) {
      imageUrl = data.image;
    }

    const payload = {
      title: (data.prompt || '').slice(0, 30) + '...',
      content: data.prompt,
      model: data.model || 'ChatGPT',
      imageUrl: imageUrl
    };

    const res = await databases.updateDocument(DB_ID, COL_ID, id, payload);

    const tagsMap = load(TAGS_STORAGE_KEY) ?? {};
    if (data.tags) {
      tagsMap[id] = data.tags;
      localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tagsMap));
    }

    const favsMap = load(FAV_STORAGE_KEY) ?? {};
    const updated = mapDoc(res, favsMap, tagsMap);

    setPrompts(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const softDelete = async (id) => {
    const target = prompts.find(p => p.id === id);
    if (!target) return;

    try {
      await databases.deleteDocument(DB_ID, COL_ID, id);
    } catch (err) {
      console.error('Error deleting document from Appwrite:', err);
    }

    const trashed = { ...target, deletedAt: new Date().toISOString() };
    setTrash(t => [...t, trashed]);
    setPrompts(prev => prev.filter(p => p.id !== id));
  };

  const recoverPrompt = async (id) => {
    const target = trash.find(p => p.id === id);
    if (!target) return;

    const { deletedAt, ...restored } = target;

    const payload = {
      title: (restored.prompt || '').slice(0, 30) + '...',
      content: restored.prompt,
      model: restored.model || 'ChatGPT',
      imageUrl: restored.image || null
    };

    try {
      const res = await databases.createDocument(DB_ID, COL_ID, id, payload);
      const favsMap = load(FAV_STORAGE_KEY) ?? {};
      const tagsMap = load(TAGS_STORAGE_KEY) ?? {};
      setPrompts(prev => [...prev, mapDoc(res, favsMap, tagsMap)]);
    } catch (err) {
      console.error('Error recovering prompt to Appwrite:', err);
      const res = await databases.createDocument(DB_ID, COL_ID, ID.unique(), payload);
      const favsMap = load(FAV_STORAGE_KEY) ?? {};
      const tagsMap = load(TAGS_STORAGE_KEY) ?? {};
      setPrompts(prev => [...prev, mapDoc(res, favsMap, tagsMap)]);
    }

    setTrash(prev => prev.filter(p => p.id !== id));
  };

  const purgeFromTrash = useCallback((id) => {
    setTrash(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleFav = (id) => {
    const favsMap = load(FAV_STORAGE_KEY) ?? {};
    favsMap[id] = !favsMap[id];
    localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favsMap));
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, fav: favsMap[id] } : p));
  };

  return {
    prompts,
    trash,
    loading,
    addPrompt,
    updatePrompt,
    softDelete,
    recoverPrompt,
    purgeFromTrash,
    toggleFav,
    loadPrompts
  };
}

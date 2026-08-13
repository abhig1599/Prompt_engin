'use client';
import { useState, useCallback, useEffect } from 'react';

const WEBSITES_KEY = 'promptboard_websites_v1';
const WEBSITES_TRASH_KEY = 'promptboard_websites_trash_v1';
const TRASH_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface Website {
  id: string;
  name: string;
  url: string;
  tags: string[];
  faviconUrl: string | null;
  createdAt: string;
  isOwner?: boolean; // added for permissions
  isFav?: boolean;
}

export interface TrashedWebsite extends Website {
  deletedAt: string;
}

function load<T>(key: string): T {
  if (typeof window === 'undefined') return [] as unknown as T;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : ([] as unknown as T);
  } catch {
    return [] as unknown as T;
  }
}

function save(key: string, data: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function useWebsites() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [trash, setTrash] = useState<TrashedWebsite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loaded = load<Website[]>(WEBSITES_KEY).map(w => ({ ...w, isOwner: w.isOwner ?? true, isFav: w.isFav ?? false }));
    setWebsites(loaded);
    const savedTrash = load<TrashedWebsite[]>(WEBSITES_TRASH_KEY) ?? [];
    setTrash(savedTrash.filter(w => Date.now() - new Date(w.deletedAt).getTime() < TRASH_TTL));
    setLoading(false);
  }, []);

  useEffect(() => { save(WEBSITES_TRASH_KEY, trash); }, [trash]);

  const addWebsite = useCallback(async (data: Omit<Website, 'id' | 'createdAt' | 'isOwner' | 'isFav'>) => {
    const newWeb: Website = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isOwner: true,
      isFav: false,
    };
    setWebsites(prev => {
      const next = [newWeb, ...prev];
      save(WEBSITES_KEY, next);
      return next;
    });
  }, []);

  const editWebsite = useCallback(async (id: string, data: Partial<Omit<Website, 'id' | 'createdAt' | 'isOwner'>>) => {
    setWebsites(prev => {
      const target = prev.find(w => w.id === id);
      if (!target) return prev;
      
      const updated = { ...target, ...data };
      const next = prev.map(w => w.id === id ? updated : w);
      save(WEBSITES_KEY, next);
      return next;
    });
  }, []);

  const toggleFav = useCallback((id: string) => {
    setWebsites(prev => {
      const next = prev.map(w => w.id === id ? { ...w, isFav: !w.isFav } : w);
      save(WEBSITES_KEY, next);
      return next;
    });
  }, []);

  const softDelete = useCallback((id: string) => {
    setWebsites(prev => {
      const target = prev.find(w => w.id === id);
      if (target) {
        setTrash(t => {
          const nextTrash = [{ ...target, deletedAt: new Date().toISOString() }, ...t];
          save(WEBSITES_TRASH_KEY, nextTrash);
          return nextTrash;
        });
      }
      const next = prev.filter(w => w.id !== id);
      save(WEBSITES_KEY, next);
      return next;
    });
  }, []);

  const recoverWebsite = useCallback((id: string) => {
    setTrash(prev => {
      const target = prev.find(w => w.id === id);
      if (target) {
        const { deletedAt, ...rest } = target;
        setWebsites(ws => {
          const next = [rest, ...ws];
          save(WEBSITES_KEY, next);
          return next;
        });
      }
      const nextTrash = prev.filter(w => w.id !== id);
      save(WEBSITES_TRASH_KEY, nextTrash);
      return nextTrash;
    });
  }, []);

  const purgeFromTrash = useCallback((id: string) => {
    setTrash(prev => prev.filter(w => w.id !== id));
  }, []);

  return { websites, trash, loading, addWebsite, editWebsite, toggleFav, softDelete, recoverWebsite, purgeFromTrash };
}

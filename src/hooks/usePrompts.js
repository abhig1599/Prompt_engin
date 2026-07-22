// src/hooks/usePrompts.js
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'promptboard_react_v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const DEMO = [
  {
    id: crypto.randomUUID(),
    prompt: "A cinematic photo of a neon-lit Tokyo alley at night, rain reflections on wet cobblestones, bokeh lights, dramatic fog, Blade Runner aesthetic, 8K ultra-detailed",
    image: null, tags: ['cinematic','night','sci-fi'], model: 'Midjourney', fav: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    prompt: "Portrait of a mysterious woman with glowing blue eyes, flowing silver hair, wearing iridescent armor, painted in the style of Alphonse Mucha, art nouveau, vibrant jewel-tone colors",
    image: null, tags: ['portrait','fantasy','art nouveau'], model: 'DALL·E 3', fav: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    prompt: "An ancient library floating in space, bookshelves spiraling into infinity, golden dust particles, warm candlelight, cosmic nebula visible through huge arched windows, hyperdetailed",
    image: null, tags: ['fantasy','space','surreal'], model: 'Stable Diffusion', fav: false,
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    prompt: "A hyperrealistic macro photograph of a dewdrop on a spider's web at sunrise, rainbow reflections, golden hour, ethereal depth of field, National Geographic quality",
    image: null, tags: ['macro','nature','photography'], model: 'Google Imagen', fav: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    prompt: "Cyberpunk street market in a megacity, holographic ads, diverse crowd, street food stalls with neon signs, flying vehicles overhead, gritty realistic style, ultra wide angle lens",
    image: null, tags: ['cyberpunk','street','wide-angle'], model: 'Flux', fav: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    prompt: "Minimalist product photo of a translucent glass perfume bottle, soft diffused studio lighting, white marble background, luxury aesthetic, high-end commercial photography, 4K",
    image: null, tags: ['product','minimalist','luxury'], model: 'Adobe Firefly', fav: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export function usePrompts() {
  const [prompts, setPrompts] = useState(() => load() ?? DEMO);

  const persist = useCallback((next) => {
    setPrompts(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addPrompt = useCallback((data) => {
    const entry = { id: crypto.randomUUID(), fav: false, createdAt: new Date().toISOString(), ...data };
    persist((prev) => [...prev, entry]);
    return entry;
  }, [persist]);

  const toggleFav = useCallback((id) => {
    persist((prev) => prev.map(p => p.id === id ? { ...p, fav: !p.fav } : p));
  }, [persist]);

  const deletePrompt = useCallback((id) => {
    persist((prev) => prev.filter(p => p.id !== id));
  }, [persist]);

  return { prompts, addPrompt, toggleFav, deletePrompt };
}

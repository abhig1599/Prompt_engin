'use client';
import { useState, useCallback } from 'react';

interface Toast { msg: string; show: boolean; }

export function useToast() {
  const [toast, setToast] = useState<Toast>({ msg: '', show: false });
  const showToast = useCallback((msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast({ msg: '', show: false }), 2500);
  }, []);
  return { toast, showToast };
}

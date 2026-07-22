// src/hooks/useToast.js
import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [toast, setToast] = useState({ msg: '', show: false });
  const timerRef = useRef(null);

  const showToast = useCallback((msg, duration = 2200) => {
    setToast({ msg, show: true });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), duration);
  }, []);

  return { toast, showToast };
}

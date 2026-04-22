import { useState, useCallback, useRef } from 'react';

let _id = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const timerMap = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timerMap.current[id]);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++_id;
    setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]); // max 5 toasts
    timerMap.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  return { toasts, addToast, dismiss };
};

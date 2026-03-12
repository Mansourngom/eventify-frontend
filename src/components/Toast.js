import { useState, useEffect } from 'react';

let toastFn = null;

export function showToast(message, type = 'success') {
  if (toastFn) toastFn(message, type);
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastFn = (message, type) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3800);
    };
    return () => { toastFn = null; };
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <div className="toast-icon">
            {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}
          </div>
          <span style={{ flex: 1 }}>{t.message}</span>
          <div className="toast-progress"/>
        </div>
      ))}
    </div>
  );
}
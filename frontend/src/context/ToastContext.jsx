import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Icon } from '../components/Icons.jsx';

const ToastContext = createContext(null);

let toastId = 0;

const ICONS = { success: 'check', error: 'alert', info: 'activity' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = 'success') => {
      const id = ++toastId;
      setToasts((current) => [...current.slice(-2), { id, message, type }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((item) => (
          <div key={item.id} className={`toast toast--${item.type}`} role="status">
            <span className="toast__icon">
              <Icon name={ICONS[item.type] || 'activity'} size={16} />
            </span>
            <span className="toast__message">{item.message}</span>
            <button
              type="button"
              className="toast__close"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss notification"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider.');
  return context;
}

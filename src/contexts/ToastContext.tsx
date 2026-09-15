import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

/** Callers pass either casing; `addToast` sites use the uppercase form. */
export type ToastTypeInput = ToastType | 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  /** (title, description?, type?) */
  toast: (title: string, description?: string, type?: ToastTypeInput) => void;
  /** (title, type?, description?) — the shape the execution paths call. */
  addToast: (title: string, type?: ToastTypeInput, description?: string) => void;
}

const normalizeType = (type?: ToastTypeInput): ToastType => {
  switch (String(type ?? 'info').toLowerCase()) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
    case 'critical':
      return 'error';
    default:
      return 'info';
  }
};

const TYPE_ICON: Record<ToastType, { Icon: typeof Info; className: string }> = {
  success: { Icon: CheckCircle2, className: 'text-violet-400' },
  info: { Icon: Info, className: 'text-[#D946EF]' },
  warning: { Icon: AlertTriangle, className: 'text-amber-400' },
  error: { Icon: XCircle, className: 'text-rose-400' },
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((title: string, description?: string, type?: ToastTypeInput) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type: normalizeType(type) }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Same queue, argument order flipped for the (title, TYPE) call sites.
  const addToast = useCallback(
    (title: string, type?: ToastTypeInput, description?: string) => toast(title, description, type),
    [toast]
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, addToast }}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const { Icon, className } = TYPE_ICON[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="relative pointer-events-auto flex items-start gap-3 p-4 glass-1 border border-white/10 rounded-2xl shadow-2xl min-w-[300px] max-w-sm bg-black/60 backdrop-blur-2xl"
              >
                <Icon size={16} className={`${className} shrink-0 mt-0.5`} />
                <div className="flex flex-col gap-1 pr-4">
                  <span className="text-sm font-bold text-white">{t.title}</span>
                  {t.description && <span className="text-xs text-smash-text-secondary">{t.description}</span>}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

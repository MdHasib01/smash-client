import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react';
import { Toaster } from '../components/ui/sonner';
import { toast as sonnerToast } from 'sonner';

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
  const toast = useCallback((title: string, description?: string, type?: ToastTypeInput) => {
    const { Icon, className } = TYPE_ICON[normalizeType(type)];
    sonnerToast(title, {
      description,
      duration: 4000,
      icon: <Icon size={16} className={className} />,
    });
  }, []);

  // Same queue, argument order flipped for the (title, TYPE) call sites.
  const addToast = useCallback(
    (title: string, type?: ToastTypeInput, description?: string) => toast(title, description, type),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, addToast }}>
      {children}
      <Toaster />
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

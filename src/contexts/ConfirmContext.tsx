import React, { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export interface ConfirmOptions {
  title?: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
}

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

/** Promise-based replacement for window.confirm, rendered as a shadcn AlertDialog. */
export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(typeof opts === 'string' ? { description: opts } : opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOptions(null);
  };

  const destructive = options?.destructive ?? true;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={!!options} onOpenChange={(open) => { if (!open) settle(false); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options?.title ?? 'Are you sure?'}</AlertDialogTitle>
            <AlertDialogDescription>{options?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="tertiary">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={destructive ? 'danger' : 'primary'}
              onClick={() => settle(true)}
            >
              {options?.confirmLabel ?? (destructive ? 'Delete' : 'Confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

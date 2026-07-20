'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      {mounted && (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className={`
                  pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-xs md:max-w-md
                  ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : ''}
                  ${toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : ''}
                  ${toast.type === 'info' ? 'bg-sky-50 border-sky-200 text-sky-800' : ''}
                `}
              >
                <div className="shrink-0">
                  {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
                  {toast.type === 'info' && <Info className="w-5 h-5 text-sky-500" />}
                </div>
                <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
                <button 
                  onClick={() => removeToast(toast.id)}
                  className={`ml-auto shrink-0 p-1 rounded-md transition-colors
                    ${toast.type === 'success' ? 'hover:bg-emerald-100 text-emerald-400' : ''}
                    ${toast.type === 'error' ? 'hover:bg-rose-100 text-rose-400' : ''}
                    ${toast.type === 'info' ? 'hover:bg-sky-100 text-sky-400' : ''}
                  `}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

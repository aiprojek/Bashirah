
import React, { useState, useEffect, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastEvent extends CustomEvent {
    detail: {
        message: string;
        type: ToastType;
        duration?: number;
    };
}

const Toast: React.FC = () => {
    const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastType }>>([]);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    useEffect(() => {
        const handleToast = (event: Event) => {
            const { message, type, duration = 4000 } = (event as ToastEvent).detail;
            const id = Date.now();

            setToasts((prev) => [...prev, { id, message, type }]);

            setTimeout(() => {
                removeToast(id);
            }, duration);
        };

        window.addEventListener('app:toast' as any, handleToast);
        return () => window.removeEventListener('app:toast' as any, handleToast);
    }, [removeToast]);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-xs pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
            pointer-events-auto flex items-center p-4 rounded-xl shadow-2xl border animate-in slide-in-from-right-full duration-300
            ${toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200' : ''}
            ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-200' : ''}
            ${toast.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200' : ''}
            ${toast.type === 'info' ? 'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200' : ''}
          `}
                >
                    <div className="flex-shrink-0">
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                        {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                        {toast.type === 'info' && <Info className="w-5 h-5" />}
                    </div>
                    <div className="ml-3 text-sm font-medium leading-tight">
                        {toast.message}
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="ml-auto -mx-1.5 -my-1.5 p-1.5 inline-flex h-8 w-8 rounded-lg focus:ring-2 focus:ring-gray-300 p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Toast;

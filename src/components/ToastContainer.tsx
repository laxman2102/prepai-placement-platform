import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div id="toast-notifications-container" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          className="flex items-start justify-between p-4 rounded-2xl bg-[#1A1A1A] text-[#F9F7F2] border border-[#1A1A1A] text-xs font-medium shadow-2xl transition-all"
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-amber-300 shrink-0" />}
            <span className="leading-snug">{toast.text}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#F9F7F2]/60 hover:text-white p-0.5 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

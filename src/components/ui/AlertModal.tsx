import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from './Button.js';

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  buttonText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'Entendido',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    error: {
      defaultTitle: 'Ha ocurrido un error',
      icon: <AlertCircle className="w-7 h-7 text-ted-red" />,
      bg: 'bg-red-950/40 border-red-800/60 shadow-red-950/30',
      btn: 'bg-ted-red hover:bg-red-700 text-white shadow-lg shadow-ted-red/20',
    },
    success: {
      defaultTitle: 'Operación Exitosa',
      icon: <CheckCircle2 className="w-7 h-7 text-emerald-400" />,
      bg: 'bg-emerald-950/40 border-emerald-800/60 shadow-emerald-950/30',
      btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20',
    },
    warning: {
      defaultTitle: 'Atención Requerida',
      icon: <AlertTriangle className="w-7 h-7 text-amber-400" />,
      bg: 'bg-amber-950/40 border-amber-800/60 shadow-amber-950/30',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20',
    },
    info: {
      defaultTitle: 'Información del Sistema',
      icon: <Info className="w-7 h-7 text-blue-400" />,
      bg: 'bg-blue-950/40 border-blue-800/60 shadow-blue-950/30',
      btn: 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700',
    },
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-7 z-10 space-y-6 animate-in zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-xl ${typeConfig.bg}`}
          >
            {typeConfig.icon}
          </div>

          <div className="space-y-1.5 pr-4">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {title || typeConfig.defaultTitle}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-zinc-800/80">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onClose}
            className={`font-bold text-xs sm:text-sm px-6 ${typeConfig.btn}`}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};


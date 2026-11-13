import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, HelpCircle, X } from 'lucide-react';
import { Button } from './Button.js';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      icon: <Trash2 className="w-7 h-7 text-ted-red animate-pulse" />,
      bg: 'bg-red-950/40 border-red-800/60 shadow-red-950/30',
      confirmBtn: 'bg-ted-red hover:bg-red-700 text-white shadow-lg shadow-ted-red/20',
    },
    warning: {
      icon: <AlertTriangle className="w-7 h-7 text-amber-400" />,
      bg: 'bg-amber-950/40 border-amber-800/60 shadow-amber-950/30',
      confirmBtn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20',
    },
    info: {
      icon: <HelpCircle className="w-7 h-7 text-blue-400" />,
      bg: 'bg-blue-950/40 border-blue-800/60 shadow-blue-950/30',
      confirmBtn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20',
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isLoading) onClose();
        }}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-7 z-10 space-y-6 animate-in zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-40"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-xl ${iconConfig.bg}`}
          >
            {iconConfig.icon}
          </div>

          <div className="space-y-1.5 pr-4">
            <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="border-zinc-700 text-zinc-300 hover:text-white"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            onClick={onConfirm}
            className={`font-bold text-xs sm:text-sm ${iconConfig.confirmBtn}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};


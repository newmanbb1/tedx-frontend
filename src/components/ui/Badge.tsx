import React from 'react';
import { OrderStatus } from '../../types/index.js';

interface BadgeProps {
  status?: OrderStatus;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, children, className = '' }) => {
  let resolvedVariant = variant || 'neutral';
  let label = children;

  if (status) {
    switch (status) {
      case 'APPROVED':
        resolvedVariant = 'success';
        label = label || 'Aprobada';
        break;
      case 'PAYMENT_SUBMITTED':
        resolvedVariant = 'info';
        label = label || 'Comprobante en Revisión';
        break;
      case 'PENDING_PAYMENT':
        resolvedVariant = 'warning';
        label = label || 'Pendiente de Pago';
        break;
      case 'REJECTED':
        resolvedVariant = 'danger';
        label = label || 'Rechazada';
        break;
      case 'CANCELLED':
        resolvedVariant = 'neutral';
        label = label || 'Cancelada / Expirada';
        break;
    }
  }

  const styles = {
    success: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80',
    warning: 'bg-amber-950/80 text-amber-300 border border-amber-800/80',
    info: 'bg-blue-950/80 text-blue-300 border border-blue-800/80',
    danger: 'bg-rose-950/80 text-rose-300 border border-rose-800/80',
    neutral: 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/80',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${styles[resolvedVariant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
};

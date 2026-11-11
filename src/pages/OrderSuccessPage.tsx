import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  ExternalLink,
  Search,
  RefreshCw,
  Printer,
} from 'lucide-react';
import { OrderData } from '../types/index.js';
import { api } from '../services/api.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';

interface OrderSuccessPageProps {
  initialOrderNumber?: string;
  onViewTicket: (ticketCode: string) => void;
  onGoHome: () => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  initialOrderNumber,
  onViewTicket,
  onGoHome,
}) => {
  const [searchCode, setSearchCode] = useState(initialOrderNumber || '');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrder = async (orderNum: string) => {
    if (!orderNum.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getOrderStatus(orderNum.trim());
      setOrder(data.order);
      if (data.order.status === 'APPROVED') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'No se encontró la orden especificada.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrder(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchCode);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Ingresa tu Número de Orden (ej. TEDX-ABCDE) o ID..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-ted-red"
            />
          </div>
          <Button type="submit" isLoading={loading} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Consultar Orden
          </Button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-200 text-sm text-center">
          {errorMsg}
        </div>
      )}

      {order && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 text-center space-y-4">
            <div className="flex justify-center">
              {order.status === 'APPROVED' ? (
                <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
              ) : order.status === 'PAYMENT_SUBMITTED' ? (
                <div className="w-16 h-16 rounded-full bg-blue-950 border border-blue-600 flex items-center justify-center text-blue-400">
                  <Clock className="w-9 h-9" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-950 border border-amber-600 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="w-9 h-9" />
                </div>
              )}
            </div>

            <div>
              <div className="inline-block mb-3">
                <Badge status={order.status} className="text-sm px-4 py-1" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {order.status === 'APPROVED'
                  ? '¡Tus Entradas están Listas!'
                  : order.status === 'PAYMENT_SUBMITTED'
                  ? 'Comprobante en Revisión'
                  : 'Orden Registrada'}
              </h2>
              <p className="text-zinc-400 text-sm max-w-lg mx-auto mt-2">
                {order.status === 'APPROVED'
                  ? 'Tu pago ha sido validado exitosamente. A continuación tienes tus boletos digitales con código QR para el día del evento.'
                  : order.status === 'PAYMENT_SUBMITTED'
                  ? 'Hemos recibido tu comprobante bancario. El equipo administrativo está validando la transferencia. Te llegará una notificación por correo al aprobarse.'
                  : 'Por favor realiza la transferencia y sube tu comprobante para emitir las entradas.'}
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 border-t border-zinc-800/80">
              <div>
                <span className="block text-zinc-400">Orden:</span>
                <span className="font-mono font-bold text-white text-sm">{order.orderNumber}</span>
              </div>
              <div>
                <span className="block text-zinc-400">Comprador:</span>
                <span className="font-bold text-white text-sm">{order.buyerName}</span>
              </div>
              <div>
                <span className="block text-zinc-400">Total:</span>
                <span className="font-bold text-white text-sm">${order.totalAmount.toFixed(2)}</span>
              </div>
              {order.proofReferenceNumber && (
                <div>
                  <span className="block text-zinc-400">Referencia:</span>
                  <span className="font-mono text-zinc-300 text-sm">{order.proofReferenceNumber}</span>
                </div>
              )}
            </div>
          </div>

          {order.status === 'APPROVED' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-ted-red" />
                  Boletos Digitales ({order.tickets.length})
                </h3>
                <span className="text-xs text-zinc-400">Muestra cada código QR en puerta</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {order.tickets.map((t, idx) => (
                  <div
                    key={t.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-ted-red/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                        <span className="text-xs font-bold text-ted-red tracking-wider uppercase">
                          Boleto #{idx + 1} &bull; {t.ticketType.name}
                        </span>
                        <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                          {t.ticketCode}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="space-y-1 text-sm">
                          <p className="font-bold text-white text-base">{t.attendeeName}</p>
                          <p className="text-xs text-zinc-400">Doc: {t.attendeeDocumentId}</p>
                          <p className="text-xs text-zinc-400">{t.attendeeEmail}</p>
                          <p className="text-xs text-ted-red font-medium pt-2">
                            {order.event.title}
                          </p>
                        </div>

                        {t.qrDataUrl && (
                          <div className="bg-white p-2 rounded-xl shadow-lg shrink-0">
                            <img
                              src={t.qrDataUrl}
                              alt="Código QR"
                              className="w-28 h-28 object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800 flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 text-xs"
                        leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                        onClick={() => onViewTicket(t.ticketCode)}
                      >
                        Ver Credencial
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        leftIcon={<Printer className="w-3.5 h-3.5" />}
                        onClick={() => window.print()}
                      >
                        Imprimir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center pt-6">
            <Button variant="ghost" onClick={onGoHome}>
              Volver a la Página Principal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

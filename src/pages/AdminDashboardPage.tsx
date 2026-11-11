import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Ticket,
  Clock,
  CheckCircle2,
  Eye,
  Search,
  RefreshCw,
  ExternalLink,
  Users,
  AlertCircle,
} from 'lucide-react';
import { DashboardStats, OrderData } from '../types/index.js';
import { api } from '../services/api.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('PAYMENT_SUBMITTED');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData] = await Promise.all([
        api.getDashboardStats(),
        api.getOrders(statusFilter, searchTerm),
      ]);
      setStats(statsData);
      setOrders(ordersData.orders);
    } catch (err) {
      console.error('Error cargando datos del admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleApprove = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await api.approveOrder(selectedOrder.id, adminNotes);
      setActionMessage('¡Orden aprobada exitosamente! Se emitieron los boletos con QR.');
      setTimeout(() => {
        setSelectedOrder(null);
        setActionMessage(null);
        loadData();
      }, 1500);
    } catch (err: any) {
      setActionMessage(`Error: ${err.message || 'No se pudo aprobar la orden'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;
    if (!rejectReason.trim()) {
      setActionMessage('Debes ingresar un motivo de rechazo.');
      return;
    }
    setActionLoading(true);
    setActionMessage(null);
    try {
      await api.rejectOrder(selectedOrder.id, rejectReason);
      setActionMessage('Orden rechazada. Cupos liberados en el sistema.');
      setTimeout(() => {
        setSelectedOrder(null);
        setActionMessage(null);
        loadData();
      }, 1500);
    } catch (err: any) {
      setActionMessage(`Error: ${err.message || 'No se pudo rechazar la orden'}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Panel de Control y Validación
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Gestión y aprobación de transferencias bancarias, estadísticas y cupos de boletos.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={loadData}
          isLoading={loading}
        >
          Actualizar Datos
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Recaudación</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              ${stats.totalRevenue.toFixed(2)}
            </p>
            <p className="text-[11px] text-zinc-400">
              {stats.approvedOrdersCount} órdenes aprobadas
            </p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Por Validar</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-300">
              {stats.pendingApprovals}
            </p>
            <p className="text-[11px] text-zinc-400">Comprobantes en espera</p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Boletos Emitidos</span>
              <Ticket className="w-4 h-4 text-ted-red" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {stats.totalTickets}
            </p>
            <p className="text-[11px] text-zinc-400">Entradas aprobadas con QR</p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Asistencia Puerta</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {stats.checkedInTickets}{' '}
              <span className="text-sm font-normal text-zinc-400">
                ({stats.checkInPercentage}%)
              </span>
            </p>
            <p className="text-[11px] text-zinc-400">Acreditados el día del evento</p>
          </div>
        </div>
      )}

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: 'PAYMENT_SUBMITTED', label: 'Por Revisar', count: stats?.pendingApprovals },
            { id: 'APPROVED', label: 'Aprobadas' },
            { id: 'PENDING_PAYMENT', label: 'Sin Comprobante' },
            { id: 'REJECTED', label: 'Rechazadas' },
            { id: 'ALL', label: 'Todas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-ted-red text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="w-full md:w-72">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por orden, nombre, ref..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-ted-red"
            />
          </div>
        </form>
      </div>

      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/80 text-[11px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Orden / Fecha</th>
                <th className="px-6 py-4">Comprador</th>
                <th className="px-6 py-4">Boletos</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Comprobante</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-400 text-sm">
                    No se encontraron órdenes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-white block">{o.orderNumber}</span>
                      <span className="text-[11px] text-zinc-400">
                        {new Date(o.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{o.buyerName}</p>
                      <p className="text-xs text-zinc-400">{o.buyerEmail}</p>
                      <p className="text-xs text-zinc-400">ID: {o.buyerDocumentId}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-white">{o.tickets?.length || 0} boletos</span>
                      <div className="text-[11px] text-zinc-400">
                        {o.orderItems?.map((i) => i.ticketType.name).join(', ')}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-white">
                      ${o.totalAmount.toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <Badge status={o.status} />
                    </td>

                    <td className="px-6 py-4">
                      {o.proofReceiptUrl ? (
                        <div className="space-y-1">
                          <a
                            href={o.proofReceiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Ver Archivo
                          </a>
                          {o.proofReferenceNumber && (
                            <p className="text-[11px] font-mono text-zinc-400">
                              Ref: {o.proofReferenceNumber}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">Sin subir</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant={o.status === 'PAYMENT_SUBMITTED' ? 'primary' : 'secondary'}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setSelectedOrder(o);
                          setAdminNotes('');
                          setRejectReason('');
                          setActionMessage(null);
                        }}
                      >
                        Revisar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Revisión de Orden: ${selectedOrder?.orderNumber}`}
        maxWidth="2xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {actionMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  actionMessage.startsWith('Error')
                    ? 'bg-red-950/80 text-red-200 border border-red-800'
                    : 'bg-emerald-950/80 text-emerald-200 border border-emerald-800'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
              <div>
                <span className="text-zinc-400 block">Comprador:</span>
                <span className="font-bold text-white">{selectedOrder.buyerName}</span>
              </div>
              <div>
                <span className="text-zinc-400 block">Total a Pagar:</span>
                <span className="font-bold font-mono text-white text-sm">
                  ${selectedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block">Referencia Bancaria:</span>
                <span className="font-mono text-zinc-300">
                  {selectedOrder.proofReferenceNumber || 'No reportada'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block">Estado Actual:</span>
                <Badge status={selectedOrder.status} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Comprobante de Pago Adjuntado
              </label>
              {selectedOrder.proofReceiptUrl ? (
                selectedOrder.proofReceiptUrl.endsWith('.pdf') ? (
                  <div className="p-6 text-center border border-zinc-800 rounded-xl bg-zinc-950 space-y-3">
                    <p className="text-sm text-zinc-300">Archivo PDF subido por el comprador</p>
                    <a
                      href={selectedOrder.proofReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <Button size="sm" variant="outline" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        Abrir Documento PDF en Nueva Pestaña
                      </Button>
                    </a>
                  </div>
                ) : (
                  <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 flex justify-center p-2">
                    <img
                      src={selectedOrder.proofReceiptUrl}
                      alt="Comprobante"
                      className="max-h-96 object-contain rounded-lg"
                    />
                  </div>
                )
              ) : (
                <div className="p-6 text-center text-xs text-zinc-400 border border-zinc-800 rounded-xl bg-zinc-950">
                  El comprador aún no ha subido su comprobante.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Asistentes a Emitir ({selectedOrder.tickets?.length || 0})
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedOrder.tickets?.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{t.attendeeName}</span>
                      <span className="text-zinc-400 ml-2">ID: {t.attendeeDocumentId}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                      {t.ticketType.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 space-y-4">
              {selectedOrder.status !== 'APPROVED' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Nota o comentario para el comprador (Opcional):
                    </label>
                    <input
                      type="text"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Ej. Transferencia confirmada en cuenta."
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-ted-red"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex-1 flex gap-2 w-full">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Motivo si vas a rechazar (ej. Comprobante ilegible)..."
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={actionLoading}
                        onClick={handleReject}
                      >
                        Rechazar
                      </Button>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      isLoading={actionLoading}
                      onClick={handleApprove}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      className="w-full sm:w-auto"
                    >
                      Aprobar y Emitir Boletos
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs">
                  Esta orden ya fue aprobada y los boletos con código QR fueron enviados al comprador.
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};


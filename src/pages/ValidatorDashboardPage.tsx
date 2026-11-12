import { useEffect, useState, useCallback } from 'react';
import { OrderData, ValidatorStats } from '../types/index.js';
import { api } from '../services/api.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Unlock,
  Eye,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';

export function ValidatorDashboardPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [stats, setStats] = useState<ValidatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para modal de rechazo / aprobación
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const [queueRes, statsRes] = await Promise.all([
        api.getValidatorQueue(),
        api.getValidatorStats().catch(() => null),
      ]);
      setOrders(queueRes.orders);
      if (statsRes) setStats(statsRes);
      setErrorMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al cargar la cola de validación');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresco cada 12 segundos
    const timer = setInterval(() => {
      loadData(true);
    }, 12000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleClaim = async (orderId: string) => {
    setActionLoading(true);
    setErrorMessage('');
    try {
      const res = await api.claimValidatorOrder(orderId);
      setSuccessMessage(res.message);
      await loadData(true);
      // Abrir modal con la orden recién tomada
      const updated = orders.find((o) => o.id === orderId);
      if (updated) {
        setSelectedOrder({ ...updated, isLocked: true, isLockedByMe: true });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al tomar la orden');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRelease = async (orderId: string) => {
    setActionLoading(true);
    try {
      await api.releaseValidatorOrder(orderId);
      setSuccessMessage('Orden liberada para el resto del equipo');
      setSelectedOrder(null);
      await loadData(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al liberar la orden');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    setErrorMessage('');
    try {
      const res = await api.approveValidatorOrder(selectedOrder.id, adminNotes);
      setSuccessMessage(res.message);
      setSelectedOrder(null);
      setAdminNotes('');
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al aprobar la orden');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder || !rejectReason.trim()) return;
    setActionLoading(true);
    setErrorMessage('');
    try {
      const res = await api.rejectValidatorOrder(selectedOrder.id, rejectReason.trim());
      setSuccessMessage(res.message);
      setShowRejectModal(false);
      setSelectedOrder(null);
      setRejectReason('');
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al rechazar la orden');
    } finally {
      setActionLoading(false);
    }
  };

  const formatLockRemaining = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '0m';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-8 h-8 text-ted-red" />
            <h1 className="text-3xl font-black text-white tracking-tight">
              Control de Depósitos y Validaciones
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Cola de revisión para el equipo de 5 validadores. Las órdenes tomadas se bloquean por 10 minutos para evitar revisiones duplicadas.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData()}
            disabled={refreshing}
            className="flex items-center space-x-2 text-zinc-300 border-zinc-700"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar cola</span>
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {errorMessage && (
        <div className="p-4 bg-red-950/60 border border-red-800 text-red-200 rounded-lg flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-xs underline text-red-300">Cerrar</button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-200 rounded-lg flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-xs underline text-emerald-300">Cerrar</button>
        </div>
      )}

      {/* Tarjetas de Estadísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Pendientes en Cola</p>
            <p className="text-3xl font-black text-amber-400 mt-1">{stats.pendingQueueCount}</p>
            <p className="text-xs text-zinc-500 mt-1">Por revisar por el equipo</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Aprobadas por mí (Hoy)</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">{stats.myApprovedToday}</p>
            <p className="text-xs text-zinc-500 mt-1">Depósitos validados</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Rechazadas por mí (Hoy)</p>
            <p className="text-3xl font-black text-rose-400 mt-1">{stats.myRejectedToday}</p>
            <p className="text-xs text-zinc-500 mt-1">Comprobantes inválidos</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Total Equipo (Hoy)</p>
            <p className="text-3xl font-black text-white mt-1">{stats.teamTotalApprovedToday}</p>
            <p className="text-xs text-zinc-500 mt-1">Aprobaciones combinadas</p>
          </div>
        </div>
      )}

      {/* Cola de Validación */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-zinc-950/70 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-ted-red" />
            <span>Órdenes pendientes de validación ({orders.length})</span>
          </h2>
          <span className="text-xs text-zinc-500">Orden de llegada (FIFO)</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-sm">Cargando cola de transferencias...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/80 mx-auto" />
            <h3 className="text-lg font-bold text-white">¡Cola al día!</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              No hay transferencias bancarias pendientes de validación en este momento.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {orders.map((order) => {
              const isLockedByOther = order.isLocked && !order.isLockedByMe;

              return (
                <div
                  key={order.id}
                  className={`p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                    order.isLockedByMe
                      ? 'bg-ted-red/10 border-l-4 border-ted-red'
                      : isLockedByOther
                      ? 'bg-zinc-950/40 opacity-75'
                      : 'hover:bg-zinc-800/40'
                  }`}
                >
                  {/* Info Comprador y Orden */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-white text-base">
                        {order.orderNumber}
                      </span>

                      {order.isLockedByMe ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950 text-ted-red border border-red-800 animate-pulse">
                          <Lock className="w-3 h-3 mr-1" />
                          En tu revisión ({formatLockRemaining(order.lockRemainingSeconds)})
                        </span>
                      ) : isLockedByOther ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800">
                          <Lock className="w-3 h-3 mr-1" />
                          Revisado por {order.lockedBy?.name || 'otro validador'} ({formatLockRemaining(order.lockRemainingSeconds)})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          <Unlock className="w-3 h-3 mr-1" />
                          Libre para revisión
                        </span>
                      )}

                      <span className="text-xs text-zinc-400">
                        {new Date(order.createdAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-zinc-300">
                      <div>
                        <span className="text-zinc-500 block">Comprador:</span>
                        <span className="font-medium text-white">{order.buyerName}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Carnet (CI):</span>
                        <span className="font-mono text-zinc-200">{order.buyerDocumentId}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Teléfono / WhatsApp:</span>
                        <span className="font-mono text-zinc-200">{order.buyerPhone}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                        {order.tickets.length} {order.tickets.length === 1 ? 'entrada' : 'entradas'}:
                      </span>
                      {order.tickets.map((t, idx) => (
                        <span key={idx} className="text-zinc-300">
                          {t.attendeeName} ({t.ticketType.name})
                          {idx < order.tickets.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>

                    {order.proofReferenceNumber && (
                      <div className="text-xs text-amber-300/90 font-mono">
                        Ref. bancaria: <span className="font-bold">{order.proofReferenceNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Monto y Botones */}
                  <div className="flex flex-row lg:flex-col items-end justify-between lg:justify-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs text-zinc-500 block">Total a validar:</span>
                      <span className="text-xl font-black text-white font-mono">
                        Bs {order.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {order.isLockedByMe ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="bg-ted-red hover:bg-red-700 text-white flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            <span>Inspeccionar y Decidir</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRelease(order.id)}
                            disabled={actionLoading}
                            className="text-xs border-zinc-700 text-zinc-400 hover:text-white"
                          >
                            Liberar
                          </Button>
                        </>
                      ) : isLockedByOther ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="opacity-50 cursor-not-allowed text-xs border-zinc-800 text-zinc-500"
                        >
                          En revisión...
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleClaim(order.id)}
                          disabled={actionLoading}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white flex items-center space-x-1"
                        >
                          <Lock className="w-4 h-4 mr-1" />
                          <span>Tomar para revisar</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Inspección Completa del Comprobante */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Inspección de Comprobante: ${selectedOrder.orderNumber}`}
        >
          <div className="space-y-6">
            {/* Detalle Comprador */}
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-zinc-500 block">Comprador:</span>
                <span className="font-bold text-white text-sm">{selectedOrder.buyerName}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Carnet (CI):</span>
                <span className="font-mono text-zinc-200">{selectedOrder.buyerDocumentId}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">WhatsApp:</span>
                <span className="font-mono text-zinc-200">{selectedOrder.buyerPhone}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Monto esperado:</span>
                <span className="font-black text-emerald-400 text-sm">
                  Bs {selectedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Referencia Bancaria */}
            {selectedOrder.proofReferenceNumber && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-zinc-300">Número de referencia / transferencia indicado por el usuario:</span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {selectedOrder.proofReferenceNumber}
                </span>
              </div>
            )}

            {/* Imagen del Comprobante */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center space-x-1">
                  <CreditCard className="w-4 h-4 text-ted-red mr-1" />
                  Comprobante bancario subido
                </label>
                {selectedOrder.proofReceiptUrl && (
                  <a
                    href={selectedOrder.proofReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-ted-red hover:underline flex items-center space-x-1"
                  >
                    <span>Abrir tamaño original</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 max-h-96 overflow-auto flex items-center justify-center">
                {selectedOrder.proofReceiptUrl ? (
                  <img
                    src={selectedOrder.proofReceiptUrl}
                    alt="Comprobante de depósito"
                    className="max-h-80 object-contain rounded"
                  />
                ) : (
                  <div className="p-8 text-center text-zinc-500 text-xs">
                    No se adjuntó archivo de comprobante en esta orden.
                  </div>
                )}
              </div>
            </div>

            {/* Lista de Boletos a Generar */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Boletos a habilitar ({selectedOrder.tickets.length})
              </label>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {selectedOrder.tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white mr-2">{t.attendeeName}</span>
                      <span className="text-zinc-500 font-mono">CI: {t.attendeeDocumentId}</span>
                    </div>
                    <Badge variant="neutral">
                      {t.ticketType.name}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Notas opcionales de aprobación */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">
                Notas del Validador (Opcional):
              </label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ej. Transferencia verificada en extracto Banco Metropolitano a las 11:20"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ted-red"
              />
            </div>

            {/* Botones de Decisión */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRelease(selectedOrder.id)}
                disabled={actionLoading}
                className="w-full sm:w-auto text-xs text-zinc-400 border-zinc-700"
              >
                Liberar orden
              </Button>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="w-full sm:w-auto border-red-900 text-red-400 hover:bg-red-950 text-xs"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Rechazar Depósito
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Aprobar y Generar QRs
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Confirmación de Rechazo */}
      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Rechazar Comprobante de Depósito"
        >
          <div className="space-y-4">
            <p className="text-xs text-zinc-400">
              Al rechazar el comprobante, el cupo de los boletos será liberado nuevamente para la venta general y se notificará el motivo.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">
                Selecciona un motivo común o escribe uno:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  'Comprobante ilegible o borroso',
                  'Monto transferido no coincide con la orden',
                  'Número de referencia no encontrado en cuenta bancaria',
                  'Comprobante duplicado o ya utilizado',
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectReason(reason)}
                    className="p-2 text-left bg-zinc-950 border border-zinc-800 rounded hover:border-ted-red text-zinc-300 hover:text-white transition-colors text-xs"
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Escribe el motivo detallado de rechazo..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-ted-red"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectModal(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading}
                className="bg-ted-red hover:bg-red-700 text-white text-xs"
              >
                Confirmar Rechazo
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
export default ValidatorDashboardPage;

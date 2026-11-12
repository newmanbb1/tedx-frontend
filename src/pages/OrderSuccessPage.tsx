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
  Calendar,
  Share2,
  UserCheck,
  Edit3,
  Save,
  X,
  MapPin,
  Sparkles,
  Download,
} from 'lucide-react';
import { OrderData, TicketData } from '../types/index.js';
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

  // Companion editing state
  const [isEditingAttendees, setIsEditingAttendees] = useState(false);
  const [editedAttendees, setEditedAttendees] = useState<
    { id: string; ticketCode: string; attendeeName: string; attendeeDocumentId: string; attendeeEmail?: string }[]
  >([]);
  const [savingAttendees, setSavingAttendees] = useState(false);
  const [attendeeSuccessMsg, setAttendeeSuccessMsg] = useState<string | null>(null);

  const fetchOrder = async (orderNum: string) => {
    if (!orderNum.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getOrderStatus(orderNum.trim());
      setOrder(data.order);
      if (data.order.tickets) {
        setEditedAttendees(
          data.order.tickets.map((t: TicketData) => ({
            id: t.id,
            ticketCode: t.ticketCode,
            attendeeName: t.attendeeName,
            attendeeDocumentId: t.attendeeDocumentId,
            attendeeEmail: t.attendeeEmail,
          }))
        );
      }
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

  // Google Calendar URL Generator
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    'TEDx USFX 2026'
  )}&dates=20261121T133000Z/20261121T220000Z&details=${encodeURIComponent(
    'Evento oficial TEDx USFX 2026 en el Teatro Gran Mariscal, Sucre. Presenta tu código QR en puerta para ingresar.'
  )}&location=${encodeURIComponent('Teatro Gran Mariscal, Sucre, Bolivia')}`;

  // ICS File Generator for Apple Calendar / Outlook
  const handleDownloadIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TEDx USFX//Event 2026//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:tedx-usfx-2026-ticket@tedxusfx.com',
      'DTSTAMP:20261112T000000Z',
      'DTSTART:20261121T133000Z',
      'DTEND:20261121T220000Z',
      'SUMMARY:TEDx USFX 2026',
      'DESCRIPTION:Evento oficial TEDx USFX 2026 en el Teatro Gran Mariscal, Sucre. Presenta tu código QR en el acceso.',
      'LOCATION:Teatro Gran Mariscal, Sucre, Bolivia',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'TEDx_USFX_2026.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp share link for the order
  const getWhatsAppShareLink = () => {
    if (!order) return '#';
    const message = `Mis entradas para *TEDx USFX 2026* están reservadas.\nOrden: *#${order.orderNumber}*\nSábado 21 de Noviembre, 9:30 AM en el Teatro Gran Mariscal.\nAcceso a boletos: ${window.location.origin}/`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const handleSaveAttendees = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setErrorMsg(null);
    setAttendeeSuccessMsg(null);

    // Validación de obligatoriedad y antiduplicados
    const seenDocs = new Set<string>();
    const seenNames = new Set<string>();

    for (let i = 0; i < editedAttendees.length; i++) {
      const att = editedAttendees[i];
      if (!att.attendeeName || att.attendeeName.trim().length < 2) {
        setErrorMsg(`Por favor completa el nombre del Boleto #${i + 1}.`);
        return;
      }
      if (!att.attendeeDocumentId || att.attendeeDocumentId.trim().length < 3) {
        setErrorMsg(`Por favor completa la cédula de identidad / CI del Boleto #${i + 1}.`);
        return;
      }

      const normDoc = att.attendeeDocumentId.trim().toLowerCase().replace(/\s+/g, '');
      const normName = att.attendeeName.trim().toLowerCase().replace(/\s+/g, ' ');

      if (seenDocs.has(normDoc)) {
        setErrorMsg(
          `El documento de identidad "${att.attendeeDocumentId}" está repetido. Cada entrada debe pertenecer a una persona distinta.`
        );
        return;
      }
      seenDocs.add(normDoc);

      if (seenNames.has(normName)) {
        setErrorMsg(
          `El nombre "${att.attendeeName}" está repetido. Cada entrada debe pertenecer a una persona distinta.`
        );
        return;
      }
      seenNames.add(normName);
    }

    setSavingAttendees(true);
    try {
      await api.updateOrderAttendees(order.orderNumber, editedAttendees);
      setAttendeeSuccessMsg('Datos de los asistentes actualizados exitosamente.');
      setIsEditingAttendees(false);
      // Refresh order data
      await fetchOrder(order.orderNumber);
      setTimeout(() => setAttendeeSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al actualizar los asistentes');
    } finally {
      setSavingAttendees(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Buscador de Orden */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 shadow-lg">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Ingresa tu Número de Orden (ej. TEDX-2026-...) para ver tus boletos..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-ted-red transition-all"
            />
          </div>
          <Button type="submit" isLoading={loading} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Consultar Orden
          </Button>
        </form>
      </div>

      {attendeeSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-700 text-emerald-200 text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{attendeeSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-200 text-sm text-center">
          {errorMsg}
        </div>
      )}

      {order && (
        <div className="space-y-8 animate-fade-in">
          {/* Card Principal del Estado de la Orden */}
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex justify-center">
              {order.status === 'APPROVED' ? (
                <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/40">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
              ) : order.status === 'PAYMENT_SUBMITTED' ? (
                <div className="w-16 h-16 rounded-full bg-blue-950/80 border-2 border-blue-500 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-950/40">
                  <Clock className="w-9 h-9" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-950/80 border-2 border-amber-500 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/40">
                  <AlertTriangle className="w-9 h-9" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="inline-block">
                <Badge status={order.status} className="text-sm px-4 py-1" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {order.status === 'APPROVED'
                  ? '¡Tus Entradas Oficiales Están Listas!'
                  : order.status === 'PAYMENT_SUBMITTED'
                  ? 'Comprobante en Revisión por el Equipo'
                  : 'Orden Reservada - Esperando Comprobante'}
              </h2>
              <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
                {order.status === 'APPROVED'
                  ? 'Tu pago QR ha sido verificado con éxito. Presenta tu código QR en puerta el día del evento en el Teatro Gran Mariscal.'
                  : order.status === 'PAYMENT_SUBMITTED'
                  ? 'Hemos registrado tu reporte de pago. El equipo organizador está validando la transferencia. Te notificaremos al aprobarse.'
                  : 'Realiza la transferencia por Simple QR y envía tu comprobante por WhatsApp o en la plataforma para emitir tus credenciales.'}
              </p>
            </div>

            {/* Metadatos de la Orden */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 border-t border-zinc-800/80">
              <div>
                <span className="block text-zinc-500">Orden</span>
                <span className="font-mono font-bold text-white text-sm">{order.orderNumber}</span>
              </div>
              <div>
                <span className="block text-zinc-500">Titular</span>
                <span className="font-bold text-white text-sm">{order.buyerName}</span>
              </div>
              <div>
                <span className="block text-zinc-500">Total</span>
                <span className="font-bold text-white text-sm font-mono">Bs {order.totalAmount.toFixed(2)}</span>
              </div>
              {order.proofReferenceNumber && (
                <div>
                  <span className="block text-zinc-500">Referencia</span>
                  <span className="font-mono text-zinc-300 text-sm">{order.proofReferenceNumber}</span>
                </div>
              )}
            </div>

            {/* Acciones Rápidas del Hub: Calendario y Compartir */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-zinc-700 transition-colors"
              >
                <Calendar className="w-4 h-4 text-ted-red" />
                <span>Añadir a Google Calendar</span>
              </a>

              <button
                type="button"
                onClick={handleDownloadIcs}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-zinc-700 transition-colors"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Descargar iCal (.ics)</span>
              </button>

              <a
                href={getWhatsAppShareLink()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-xs font-bold text-emerald-300 border border-emerald-700 transition-colors"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Compartir por WhatsApp</span>
              </a>

              {order.tickets && order.tickets.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsEditingAttendees(!isEditingAttendees)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>Personalizar Acompañantes</span>
                </button>
              )}
            </div>
          </div>

          {/* Formulario / Acordeón para Personalizar Acompañantes */}
          {isEditingAttendees && (
            <form
              onSubmit={handleSaveAttendees}
              className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-ted-red" />
                    <span>Personalizar Nombres y Documentos de Boletos</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Actualiza la acreditación de cada boleto emitido para esta orden.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingAttendees(false)}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {editedAttendees.map((att, idx) => {
                  const originalTicket = order.tickets?.find((t) => t.id === att.id);
                  const isCheckedIn = originalTicket?.isCheckedIn;

                  return (
                    <div key={att.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-ted-red">Boleto #{idx + 1} ({att.ticketCode})</span>
                        {isCheckedIn && (
                          <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800 font-semibold text-[10px]">
                            Acreditado en puerta (bloqueado)
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Nombre Completo</label>
                          <input
                            type="text"
                            required
                            disabled={isCheckedIn}
                            value={att.attendeeName}
                            onChange={(e) => {
                              const copy = [...editedAttendees];
                              copy[idx].attendeeName = e.target.value;
                              setEditedAttendees(copy);
                            }}
                            className={`w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-ted-red ${
                              isCheckedIn ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Cédula de Identidad / CI</label>
                          <input
                            type="text"
                            required
                            disabled={isCheckedIn}
                            value={att.attendeeDocumentId}
                            onChange={(e) => {
                              const copy = [...editedAttendees];
                              copy[idx].attendeeDocumentId = e.target.value;
                              setEditedAttendees(copy);
                            }}
                            className={`w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-ted-red ${
                              isCheckedIn ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingAttendees(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={savingAttendees}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          )}

          {/* Listado de Boletos y Credenciales Digitales */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-ted-red" />
                <span>Credenciales Digitales TEDx USFX ({order.tickets?.length || 0})</span>
              </h3>
              <span className="text-xs text-zinc-400">Presenta el QR en el Teatro Gran Mariscal</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {order.tickets?.map((t, idx) => (
                <div
                  key={t.id}
                  className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:border-ted-red/40 transition-colors shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <span className="text-xs font-bold text-ted-red tracking-wider uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Boleto #{idx + 1} &bull; {t.ticketType?.name || 'Acceso Oficial'}</span>
                      </span>
                      <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                        {t.ticketCode}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="space-y-1 text-sm">
                        <p className="font-bold text-white text-base">{t.attendeeName}</p>
                        <p className="text-xs text-zinc-400">CI: {t.attendeeDocumentId}</p>
                        <div className="pt-2 flex items-center gap-1 text-[11px] text-zinc-400">
                          <MapPin className="w-3 h-3 text-ted-red" />
                          <span>Teatro Gran Mariscal, Sucre</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                          <Calendar className="w-3 h-3 text-ted-red" />
                          <span>Sábado 21 Nov 2026, 9:30 AM</span>
                        </div>
                      </div>

                      {t.qrDataUrl ? (
                        <div className="bg-white p-2.5 rounded-2xl shadow-xl shrink-0 border-2 border-zinc-200">
                          <img
                            src={t.qrDataUrl}
                            alt="Código QR Boleto"
                            className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-zinc-950 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center p-2">
                          <QrCode className="w-6 h-6 text-zinc-600 mb-1" />
                          <span className="text-[10px] text-zinc-500">QR activo al aprobarse</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800/80 flex items-center gap-3">
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

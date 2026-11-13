import { useState, useEffect } from 'react';
import { EventData, OrderData, VolunteerCashSummary, PaymentSettingData } from '../types/index.js';
import { api } from '../services/api.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Modal } from '../components/ui/Modal.js';
import confetti from 'canvas-confetti';
import {
  Search,
  Send,
  MessageSquare,
  UserPlus,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Phone,
  Banknote,
  RefreshCw,
  QrCode,
  Eye,
} from 'lucide-react';

interface VolunteerDeskPageProps {
  event: EventData | null;
  paymentSettings?: PaymentSettingData[];
}

export function VolunteerDeskPage({ event, paymentSettings }: VolunteerDeskPageProps) {
  const [activeTab, setActiveTab] = useState<'lookup' | 'register' | 'cash'>('lookup');
  const [showQrModal, setShowQrModal] = useState(false);

  // Pestaña Búsqueda
  const [searchCarnet, setSearchCarnet] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundOrders, setFoundOrders] = useState<OrderData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [dispatchLoading, setDispatchLoading] = useState<string | null>(null);
  const [phoneOverrides, setPhoneOverrides] = useState<Record<string, string>>({});
  const [lookupFeedback, setLookupFeedback] = useState<{ type: 'success' | 'error'; message: string; waMeUrl?: string } | null>(null);

  // Pestaña Inscripción
  const [selectedTicketCounts, setSelectedTicketCounts] = useState<Record<string, number>>({});
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerDocumentId, setBuyerDocumentId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [attendeesData, setAttendeesData] = useState<
    Array<{ ticketTypeId: string; attendeeName: string; attendeeEmail: string; attendeeDocumentId: string }>
  >([]);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // Pestaña Resumen de Caja
  const [cashSummary, setCashSummary] = useState<VolunteerCashSummary | null>(null);
  const [cashLoading, setCashLoading] = useState(false);

  // Sincronizar asistentes según conteo de boletos seleccionados
  useEffect(() => {
    const list: typeof attendeesData = [];
    if (!event) return;

    event.ticketTypes.forEach((tt) => {
      const qty = selectedTicketCounts[tt.id] || 0;
      for (let i = 0; i < qty; i++) {
        list.push({
          ticketTypeId: tt.id,
          attendeeName: '',
          attendeeEmail: '',
          attendeeDocumentId: '',
        });
      }
    });
    setAttendeesData(list);
  }, [selectedTicketCounts, event]);

  const handleLookup = async (carnetToSearch?: string) => {
    const ci = carnetToSearch !== undefined ? carnetToSearch : searchCarnet;
    if (!ci.trim()) return;

    setIsSearching(true);
    setLookupFeedback(null);
    try {
      const res = await api.lookupCarnet(ci.trim());
      setFoundOrders(res.orders);
      setHasSearched(true);
      if (res.orders.length === 0) {
        setLookupFeedback({
          type: 'error',
          message: `No se encontraron órdenes registradas con el Carnet ${ci.trim()}. Puedes inscribirlo en la pestaña "Inscribir Asistentes".`,
        });
      }
    } catch (err: any) {
      setLookupFeedback({
        type: 'error',
        message: err.message || 'Error al buscar el carnet',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleDispatchTicket = async (ticketId: string, defaultPhone: string) => {
    setDispatchLoading(ticketId);
    setLookupFeedback(null);
    try {
      const targetPhone = phoneOverrides[ticketId] || defaultPhone;
      const res = await api.dispatchWhatsApp({
        ticketId,
        targetPhone,
      });

      setLookupFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message,
        waMeUrl: res.waMeUrl,
      });

      // Refrescar datos de la orden
      await handleLookup();
    } catch (err: any) {
      setLookupFeedback({
        type: 'error',
        message: err.message || 'Error al despachar por WhatsApp',
      });
    } finally {
      setDispatchLoading(null);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    if (attendeesData.length === 0) {
      setRegisterError('Debes seleccionar al menos 1 entrada para registrar');
      return;
    }

    // Validar asistentes
    for (let i = 0; i < attendeesData.length; i++) {
      const att = attendeesData[i];
      if (!att.attendeeName.trim() || !att.attendeeDocumentId.trim()) {
        setRegisterError(`Completa el nombre y carnet del asistente #${i + 1}`);
        return;
      }
    }

    if (paymentMethod === 'TRANSFER' && !receiptFile) {
      setRegisterError('Debes adjuntar la foto o captura del comprobante de pago por QR');
      return;
    }

    setRegisterLoading(true);
    setRegisterError('');

    try {
      const formData = new FormData();
      formData.append('eventId', event.id);
      formData.append('buyerName', buyerName.trim());
      formData.append('buyerEmail', buyerEmail.trim() || `${buyerDocumentId.trim()}@tedx.local`);
      formData.append('buyerPhone', buyerPhone.trim());
      formData.append('buyerDocumentId', buyerDocumentId.trim());
      formData.append('paymentMethod', paymentMethod);
      formData.append('attendees', JSON.stringify(attendeesData));

      if (paymentMethod === 'TRANSFER') {
        if (receiptFile) formData.append('receipt', receiptFile);
        if (referenceNumber) formData.append('referenceNumber', referenceNumber.trim());
      }

      await api.volunteerRegister(formData);

      // Lanzar confeti si fue en efectivo y aprobada
      if (paymentMethod === 'CASH') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }

      // Limpiar formulario
      setSelectedTicketCounts({});
      setBuyerName('');
      setBuyerEmail('');
      setBuyerPhone('');
      const registeredCI = buyerDocumentId.trim();
      setBuyerDocumentId('');
      setReceiptFile(null);
      setReferenceNumber('');

      // Cambiar a pestaña de búsqueda con el CI listo para despachar
      setActiveTab('lookup');
      setSearchCarnet(registeredCI);
      await handleLookup(registeredCI);
    } catch (err: any) {
      setRegisterError(err.message || 'Error al procesar el registro');
    } finally {
      setRegisterLoading(false);
    }
  };

  const loadCashSummary = async () => {
    setCashLoading(true);
    try {
      const data = await api.getVolunteerCashSummary();
      setCashSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCashLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'cash') {
      loadCashSummary();
    }
  }, [activeTab]);

  const totalRegisterAmount = attendeesData.reduce((acc, att) => {
    const tt = event?.ticketTypes.find((t) => t.id === att.ticketTypeId);
    return acc + (tt?.price || 0);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Cinta Lanyard Superior */}
      <div className="w-full h-3 pattern-lanyard-ribbon rounded-full border border-ted-red/30 shadow-sm" />

      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-ted-red">TEDx</span>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Mesa de Voluntarios y Despacho WhatsApp
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Punto de atención presencial: busca por Carnet (CI) para enviar entradas digitales por WhatsApp o inscribe nuevos asistentes en mano.
          </p>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('lookup')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'lookup'
                ? 'bg-ted-red text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Despacho por Carnet</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'register'
                ? 'bg-ted-red text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Inscribir Asistentes</span>
          </button>

          <button
            onClick={() => setActiveTab('cash')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'cash'
                ? 'bg-ted-red text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Mi Caja (Efectivo)</span>
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: BÚSQUEDA Y DESPACHO POR CARNET */}
      {activeTab === 'lookup' && (
        <div className="space-y-6">
          {/* Barra de búsqueda prominente */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Phone className="w-5 h-5 text-ted-red" />
              <span>Consulta rápida de Carnet de Identidad (CI)</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Pídele al comprador o asistente que dicte su número de carnet para validar su comprobante y despacharle su entrada al WhatsApp.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={searchCarnet}
                  onChange={(e) => setSearchCarnet(e.target.value)}
                  placeholder="Ej. 8492019 (Número de Carnet / CI dictado)..."
                  className="w-full bg-zinc-950 border-2 border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-ted-red font-mono font-medium"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={isSearching || !searchCarnet.trim()}
                className="bg-ted-red hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-sm shrink-0 flex items-center justify-center space-x-2"
              >
                {isSearching ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Buscar Carnet</span>
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Feedback de Envío o Alerta */}
          {lookupFeedback && (
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                lookupFeedback.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
                  : 'bg-amber-950/60 border-amber-800 text-amber-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                {lookupFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <span>{lookupFeedback.message}</span>
              </div>

              {lookupFeedback.waMeUrl && (
                <a
                  href={lookupFeedback.waMeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shrink-0 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Abrir en WhatsApp Web (Respaldo)</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              )}
            </div>
          )}

          {/* Resultados de Órdenes */}
          {hasSearched && foundOrders.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No se encontró ningún registro</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                No hay compras o inscripciones asociadas al carnet <span className="font-mono text-white font-bold">{searchCarnet}</span>.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBuyerDocumentId(searchCarnet);
                  setActiveTab('register');
                }}
                className="border-ted-red text-ted-red hover:bg-ted-red hover:text-white text-xs"
              >
                Inscribir ahora con este carnet
              </Button>
            </div>
          )}

          {foundOrders.map((order) => {
            const isApproved = order.status === 'APPROVED';
            const isSubmitted = order.status === 'PAYMENT_SUBMITTED';
            const isRejected = order.status === 'REJECTED';

            return (
              <div
                key={order.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl space-y-4"
              >
                {/* Header de la orden */}
                <div className="p-5 bg-zinc-950/80 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-lg font-black text-white">
                      {order.orderNumber}
                    </span>

                    {isApproved && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        DEPÓSITO APROBADO (Listo para Despacho)
                      </span>
                    )}

                    {isSubmitted && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        EN COLA DE VALIDACIÓN (Siendo revisado por los 5 validadores)
                      </span>
                    )}

                    {isRejected && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        COMPROBANTE RECHAZADO
                      </span>
                    )}

                    <span className="text-xs text-zinc-500 font-mono">
                      Registrada: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-zinc-500 block">Total pagado:</span>
                    <span className="text-lg font-black font-mono text-emerald-400">
                      Bs {order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Datos del comprador */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-zinc-950/40 p-3.5 mx-3 sm:mx-5 rounded-xl border border-zinc-800/60">
                  <div>
                    <span className="text-zinc-500 block">Titular de la compra:</span>
                    <span className="font-bold text-white text-sm">{order.buyerName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Carnet Comprador:</span>
                    <span className="font-mono text-zinc-200">{order.buyerDocumentId}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Teléfono Comprador:</span>
                    <span className="font-mono text-zinc-200">{order.buyerPhone}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Método de Pago:</span>
                    <span className="font-semibold text-zinc-300">
                      {order.paymentMethod === 'CASH' ? 'Efectivo presencial' : 'Pago con QR'}
                    </span>
                  </div>
                </div>

                {/* Mensaje de estado no aprobado */}
                {!isApproved && (
                  <div className="mx-3 sm:mx-5 p-3.5 sm:p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 text-xs">
                    {isSubmitted && (
                      <p className="text-amber-300">
                        <strong>Aviso al comprador:</strong> El comprobante de pago con QR fue recibido y está en la cola de validación. En cuanto sea aprobado en el sistema, podrás presionar el botón de envío por WhatsApp.
                      </p>
                    )}
                    {isRejected && (
                      <p className="text-rose-300">
                        <strong>Motivo de rechazo:</strong> {order.adminNotes || 'El comprobante no pudo ser validado.'}
                      </p>
                    )}
                  </div>
                )}

                {/* Boletos de la orden */}
                <div className="px-5 pb-5 space-y-3">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1">
                    <QrCode className="w-4 h-4 text-ted-red" />
                    <span>Boletos asociados a esta orden ({order.tickets.length})</span>
                  </h4>

                  <div className="grid grid-cols-1 gap-3">
                    {order.tickets.map((ticket) => {
                      const currentPhoneInput =
                        phoneOverrides[ticket.id] !== undefined
                          ? phoneOverrides[ticket.id]
                          : order.buyerPhone;

                      const isDispatching = dispatchLoading === ticket.id;

                      return (
                        <div
                          key={ticket.id}
                          className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          {/* Datos del boleto y asistente */}
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white text-base">
                                {ticket.attendeeName}
                              </span>
                              <Badge variant="neutral">
                                {ticket.ticketType.name}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                              <span>
                                CI: <strong className="text-zinc-200 font-mono">{ticket.attendeeDocumentId}</strong>
                              </span>
                              <span>
                                Código: <span className="font-mono text-ted-red">{ticket.ticketCode}</span>
                              </span>
                              {ticket.whatsappSentCount ? (
                                <span className="inline-flex items-center text-emerald-400 font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                  Enviado por WhatsApp ({ticket.whatsappSentCount} {ticket.whatsappSentCount === 1 ? 'vez' : 'veces'})
                                </span>
                              ) : (
                                <span className="text-zinc-500">Sin enviar por WhatsApp</span>
                              )}
                            </div>
                          </div>

                          {/* Control de Despacho WhatsApp */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            {/* Input para confirmar/modificar número de WhatsApp */}
                            <div className="relative">
                              <Phone className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                              <input
                                type="text"
                                value={currentPhoneInput}
                                onChange={(e) =>
                                  setPhoneOverrides({ ...phoneOverrides, [ticket.id]: e.target.value })
                                }
                                placeholder="WhatsApp (ej. 71234567)"
                                className="bg-zinc-900 border border-zinc-700 rounded-lg pl-8 pr-2 py-1.5 text-xs text-white font-mono w-40 focus:outline-none focus:border-ted-red"
                                title="Número de WhatsApp al cual enviar la credencial"
                              />
                            </div>

                            {/* Botón Principal: Evolution API */}
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={!isApproved || isDispatching}
                              onClick={() =>
                                handleDispatchTicket(ticket.id, currentPhoneInput)
                              }
                              className={`flex items-center justify-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg font-bold ${
                                isApproved
                                  ? 'bg-ted-red hover:bg-red-700 text-white'
                                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                              }`}
                            >
                              {isDispatching ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                              ) : (
                                <Send className="w-3.5 h-3.5 mr-1" />
                              )}
                              <span>Enviar por WhatsApp</span>
                            </Button>

                            {/* Botón Respaldo: WhatsApp Web manual */}
                            {isApproved && (
                              <a
                                href={`https://wa.me/${
                                  currentPhoneInput.length === 8 ? `591${currentPhoneInput}` : currentPhoneInput
                                }?text=${encodeURIComponent(
                                  `¡Hola ${ticket.attendeeName}! Tu entrada para ${order.event.title} está confirmada. Ver credencial y código QR: ${window.location.origin}/?ticket=${ticket.ticketCode}`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs transition-colors"
                                title="Abrir directamente en WhatsApp Web como respaldo"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PESTAÑA 2: INSCRIBIR ASISTENTES (EFECTIVO O PAGO CON QR) */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-ted-red" />
                <span>Inscripción Presencial de Asistentes</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Registra a uno o más asistentes en el stand. Puedes cobrar en efectivo (se aprueba de inmediato) o registrar pago por QR adjuntando el comprobante.
              </p>
            </div>

            {registerError && (
              <div className="p-4 bg-red-950/70 border border-red-800 text-red-200 rounded-lg text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{registerError}</span>
              </div>
            )}

            {/* 1. Selección de Entradas */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                1. Selecciona las entradas
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {event?.ticketTypes.map((tt) => {
                  const qty = selectedTicketCounts[tt.id] || 0;
                  return (
                    <div
                      key={tt.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        qty > 0
                          ? 'bg-ted-red/10 border-ted-red'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{tt.name}</span>
                          <span className="font-mono font-bold text-ted-red text-sm">
                            Bs {tt.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{tt.description}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-800/80">
                        <span className="text-xs text-zinc-500">Cantidad:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTicketCounts({
                                ...selectedTicketCounts,
                                [tt.id]: Math.max(0, qty - 1),
                              })
                            }
                            className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold text-sm text-white font-mono">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTicketCounts({
                                ...selectedTicketCounts,
                                [tt.id]: qty + 1,
                              })
                            }
                            className="w-7 h-7 rounded bg-ted-red hover:bg-red-700 text-white font-bold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Datos del Comprador / Titular */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                2. Datos del Comprador (Titular de contacto)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Ej. Carlos Ramirez"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-ted-red"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Carnet de Identidad (CI) *</label>
                  <input
                    type="text"
                    required
                    value={buyerDocumentId}
                    onChange={(e) => setBuyerDocumentId(e.target.value)}
                    placeholder="Ej. 8492019"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-ted-red"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">WhatsApp (Celular Bolivia) *</label>
                  <input
                    type="text"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="Ej. 71234567"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-ted-red"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Correo Electrónico (Opcional)</label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-ted-red"
                  />
                </div>
              </div>
            </div>

            {/* 3. Datos de cada Asistente */}
            {attendeesData.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  3. Datos de cada Asistente ({attendeesData.length})
                </label>

                <div className="space-y-3">
                  {attendeesData.map((att, idx) => {
                    const tt = event?.ticketTypes.find((t) => t.id === att.ticketTypeId);
                    return (
                      <div
                        key={idx}
                        className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3 text-xs"
                      >
                        <div className="md:col-span-1 flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-full bg-ted-red text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-semibold text-white block">
                              Asistente #{idx + 1}
                            </span>
                            <span className="text-zinc-500">{tt?.name}</span>
                          </div>
                        </div>

                        <div>
                          <input
                            type="text"
                            required
                            placeholder="Nombre del Asistente *"
                            value={att.attendeeName}
                            onChange={(e) => {
                              const updated = [...attendeesData];
                              updated[idx].attendeeName = e.target.value;
                              setAttendeesData(updated);
                            }}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white focus:outline-none focus:border-ted-red"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            required
                            placeholder="Carnet (CI) del Asistente *"
                            value={att.attendeeDocumentId}
                            onChange={(e) => {
                              const updated = [...attendeesData];
                              updated[idx].attendeeDocumentId = e.target.value;
                              setAttendeesData(updated);
                            }}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-ted-red"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Método de Pago */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                4. Método de Cobro y Validación
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opción Efectivo */}
                <div
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Banknote className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-white text-sm">Pago en Efectivo (En Mano)</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    Cobras el dinero en el stand. La orden se <strong>aprueba de inmediato</strong> y queda registrada a tu nombre como recaudador. Los boletos quedan listos para enviar al instante.
                  </p>
                </div>

                {/* Opción Pago con QR */}
                <div
                  onClick={() => setPaymentMethod('TRANSFER')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'TRANSFER'
                      ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <QrCode className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-white text-sm">Pago con QR</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    El comprador realizó el pago escaneando el código QR oficial. Subes la foto o captura del comprobante para su validación.
                  </p>
                </div>
              </div>

              {/* Si es QR: botón de ver QR, subida de comprobante y referencia */}
              {paymentMethod === 'TRANSFER' && (
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4 text-xs">
                  {paymentSettings && paymentSettings.length > 0 && paymentSettings[0]?.qrImageUrl && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg gap-2">
                      <div className="flex items-center space-x-2 text-zinc-300">
                        <QrCode className="w-4 h-4 text-ted-red shrink-0" />
                        <span>¿El asistente necesita escanear el QR oficial en el stand?</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowQrModal(true)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium text-xs transition-colors self-start sm:self-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver QR Oficial de Cobro</span>
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-300 font-medium block mb-1">
                        Subir Comprobante de Pago QR (Foto o Captura) *
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                        className="w-full text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                      />
                      {receiptFile && (
                        <p className="text-emerald-400 text-[11px] mt-1 font-mono">
                          Comprobante listo: {receiptFile.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-zinc-300 font-medium block mb-1">
                        Número de Referencia o Transacción QR (Opcional)
                      </label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder="Ej. REF-984210"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-ted-red"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Total y Confirmación */}
            <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-zinc-500 block">Total a recaudar:</span>
                <span className="text-2xl font-black text-white font-mono">
                  Bs {totalRegisterAmount.toFixed(2)}
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={registerLoading || attendeesData.length === 0}
                className="w-full sm:w-auto bg-ted-red hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2"
              >
                {registerLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {paymentMethod === 'CASH'
                        ? 'Confirmar Cobro en Efectivo y Aprobar'
                        : 'Registrar Orden con Pago QR'}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* PESTAÑA 3: RESUMEN DE CAJA (CIERRE DE CAJA DEL VOLUNTARIO) */}
      {activeTab === 'cash' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Banknote className="w-5 h-5 text-emerald-400" />
                  <span>Cierre de Caja y Recaudación de Hoy (Efectivo)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Muestra todo el dinero en efectivo que has cobrado durante tu turno para el arqueo y entrega de cuentas.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={loadCashSummary}
                disabled={cashLoading}
                className="text-xs border-zinc-700 text-zinc-300"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${cashLoading ? 'animate-spin' : ''}`} />
                Actualizar caja
              </Button>
            </div>

            {cashSummary && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block font-semibold">
                    Total Efectivo en Mano
                  </span>
                  <span className="text-3xl font-black text-emerald-400 font-mono mt-1 block">
                    Bs {cashSummary.todayCashTotalAmount.toFixed(2)}
                  </span>
                  <span className="text-xs text-zinc-500 mt-1 block">Recaudación acumulada hoy</span>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block font-semibold">
                    Órdenes en Efectivo
                  </span>
                  <span className="text-3xl font-black text-white font-mono mt-1 block">
                    {cashSummary.todayCashOrdersCount}
                  </span>
                  <span className="text-xs text-zinc-500 mt-1 block">Transacciones procesadas</span>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block font-semibold">
                    Boletos Vendidos
                  </span>
                  <span className="text-3xl font-black text-ted-red font-mono mt-1 block">
                    {cashSummary.todayCashTicketsCount}
                  </span>
                  <span className="text-xs text-zinc-500 mt-1 block">Entradas entregadas</span>
                </div>
              </div>
            )}

            {/* Listado de transacciones en efectivo */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Detalle de transacciones cobradas hoy
              </h3>

              {cashSummary?.orders.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-950 rounded-xl border border-zinc-800">
                  Aún no has registrado órdenes en efectivo el día de hoy.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
                  {cashSummary?.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-white">{ord.orderNumber}</span>
                          <span className="text-zinc-300 font-medium">{ord.buyerName}</span>
                          <span className="text-zinc-500 font-mono">CI: {ord.buyerDocumentId}</span>
                        </div>
                        <span className="text-zinc-500 mt-1 block">
                          Hora: {new Date(ord.createdAt).toLocaleTimeString()} · {ord.tickets.length} entradas
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          Bs {ord.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Oficial de Cobro */}
      <Modal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title="Código QR Oficial de Cobro"
      >
        <div className="space-y-4 text-center">
          {paymentSettings && paymentSettings[0]?.qrImageUrl ? (
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white rounded-2xl inline-block shadow-xl border border-zinc-200">
                <img
                  src={paymentSettings[0].qrImageUrl}
                  alt="QR Oficial TEDx"
                  className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-xl"
                />
              </div>
              <div className="mt-4 text-xs text-zinc-300 space-y-1.5 bg-zinc-950 p-4 rounded-xl border border-zinc-800 w-full text-left">
                {paymentSettings[0].accountHolder && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Titular de Cuenta:</span>
                    <strong className="text-white font-mono">{paymentSettings[0].accountHolder}</strong>
                  </div>
                )}
                {paymentSettings[0].bankName && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Entidad / Banco:</span>
                    <strong className="text-white">{paymentSettings[0].bankName}</strong>
                  </div>
                )}
                {paymentSettings[0].accountNumber && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Nº de Cuenta:</span>
                    <strong className="text-white font-mono">{paymentSettings[0].accountNumber}</strong>
                  </div>
                )}
                {paymentSettings[0].instructions && (
                  <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800 mt-2">
                    {paymentSettings[0].instructions}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-400 text-xs bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
              <QrCode className="w-8 h-8 text-zinc-600 mx-auto" />
              <p>No se ha cargado un código QR en el panel de administración aún.</p>
            </div>
          )}
          <div className="pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowQrModal(false)}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default VolunteerDeskPage;

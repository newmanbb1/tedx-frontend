import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  Upload,
  AlertCircle,
  FileText,
  User,
  ShieldCheck,
  QrCode,
  ExternalLink,
  Download,
  MessageCircle,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';
import { EventData, PaymentSettingData, AttendeeInput, OrderData } from '../types/index.js';
import { api } from '../services/api.js';
import { Button } from '../components/ui/Button.js';

interface CheckoutPageProps {
  event: EventData;
  paymentSettings: PaymentSettingData[];
  selectedQuantities: Record<string, number>;
  onBack: () => void;
  onOrderCompleted: (orderNumber: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  event,
  paymentSettings,
  selectedQuantities,
  onBack,
  onOrderCompleted,
}) => {
  // Step navigation: 1 = Datos de Contacto y Reserva, 2 = Pago QR y Confirmación
  const [step, setStep] = useState<1 | 2>(1);

  // Buyer information (Sin correo electrónico: 100% WhatsApp y CI)
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerDocumentId, setBuyerDocumentId] = useState('');

  // Initial attendees list based on selected tickets
  const initialAttendees: AttendeeInput[] = [];
  event.ticketTypes.forEach((t) => {
    const qty = selectedQuantities[t.id] || 0;
    for (let i = 0; i < qty; i++) {
      initialAttendees.push({
        ticketTypeId: t.id,
        attendeeName: '',
        attendeeDocumentId: '',
      });
    }
  });

  const [attendees, setAttendees] = useState<AttendeeInput[]>(initialAttendees);

  // Created order state once step 1 is validated
  const [createdOrder, setCreatedOrder] = useState<OrderData | null>(null);

  // Payment upload state (Step 2)
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');

  const [copiedBankInfo, setCopiedBankInfo] = useState(false);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [whatsAppNotified, setWhatsAppNotified] = useState(false);

  const bankInfo = paymentSettings[0] || {
    instructions:
      'Escanea el código QR oficial desde tu app bancaria móvil, transfiere el monto exacto y confirma tu comprobante.',
  };

  const totalAmount = attendees.reduce((sum, a) => {
    const ticket = event.ticketTypes.find((t) => t.id === a.ticketTypeId);
    return sum + (ticket?.price || 0);
  }, 0);

  // Helper to format WhatsApp contact link
  const getWhatsAppLink = (orderNum: string) => {
    let phone = bankInfo.whatsappContactNumber?.replace(/\D/g, '') || '59178687799';
    if (phone.length === 8) {
      phone = `591${phone}`;
    }
    const message = `Hola equipo de TEDx USFX 2026:\nAcabo de realizar el pago por QR Simple.\n\n*Detalles de mi Orden:*\n- Orden: *#${orderNum}*\n- Titular: *${buyerName}*\n- CI: *${buyerDocumentId}*\n- Monto: *Bs ${totalAmount.toFixed(2)}*\n\nAdjunto en este chat mi comprobante de pago oficial para su verificación. Muchas gracias.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const handleCopyBank = () => {
    const textToCopy = `PAGO QR TEDx USFX 2026\nTitular: ${bankInfo.accountHolder || 'TEDx USFX'}\nBanco/Plataforma: ${bankInfo.bankName || 'Cobro QR Simple'}\nMonto Exacto: Bs ${totalAmount.toFixed(2)}${createdOrder ? `\nOrden: #${createdOrder.orderNumber}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedBankInfo(true);
    setTimeout(() => setCopiedBankInfo(false), 3000);
  };

  const handleCopyOrderNumber = () => {
    if (createdOrder) {
      navigator.clipboard.writeText(createdOrder.orderNumber);
      setCopiedOrderNumber(true);
      setTimeout(() => setCopiedOrderNumber(false), 2500);
    }
  };

  const handleAttendeeChange = (
    index: number,
    field: keyof AttendeeInput,
    value: string
  ) => {
    const updated = [...attendees];
    updated[index] = { ...updated[index], [field]: value };
    setAttendees(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setReceiptPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview(null);
      }
    }
  };

  // STEP 1 SUBMISSION: Generates order and moves to Step 2
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!buyerName.trim() || !buyerPhone.trim() || !buyerDocumentId.trim()) {
      setErrorMsg('Por favor completa todos tus datos personales como comprador titular.');
      return;
    }

    // Si hay más de 1 entrada, validar que cada acompañante tenga Nombre y CI
    if (attendees.length > 1) {
      for (let i = 1; i < attendees.length; i++) {
        const att = attendees[i];
        if (!att.attendeeName || att.attendeeName.trim().length < 2) {
          setErrorMsg(`Por favor ingresa el nombre completo del Acompañante #${i + 1}.`);
          return;
        }
        if (!att.attendeeDocumentId || att.attendeeDocumentId.trim().length < 3) {
          setErrorMsg(`Por favor ingresa la cédula de identidad / CI del Acompañante #${i + 1}.`);
          return;
        }
      }
    }

    const finalAttendees: AttendeeInput[] = attendees.map((att, idx) => {
      if (idx === 0) {
        return {
          ticketTypeId: att.ticketTypeId,
          attendeeName: buyerName.trim(),
          attendeeDocumentId: buyerDocumentId.trim(),
        };
      }
      return {
        ticketTypeId: att.ticketTypeId,
        attendeeName: att.attendeeName!.trim(),
        attendeeDocumentId: att.attendeeDocumentId!.trim(),
      };
    });

    // Validación estricta antiduplicados: No se permiten carnets ni nombres repetidos en la orden
    const seenDocs = new Set<string>();
    const seenNames = new Set<string>();

    for (let i = 0; i < finalAttendees.length; i++) {
      const a = finalAttendees[i];
      const normDoc = a.attendeeDocumentId!.trim().toLowerCase().replace(/\s+/g, '');
      const normName = a.attendeeName!.trim().toLowerCase().replace(/\s+/g, ' ');

      if (seenDocs.has(normDoc)) {
        setErrorMsg(
          `El documento de identidad "${a.attendeeDocumentId}" está repetido en esta orden. Cada entrada debe pertenecer a una persona distinta con código QR individual.`
        );
        return;
      }
      seenDocs.add(normDoc);

      if (seenNames.has(normName)) {
        setErrorMsg(
          `El nombre "${a.attendeeName}" está repetido en esta orden. Cada entrada debe pertenecer a una persona distinta con código QR individual.`
        );
        return;
      }
      seenNames.add(normName);
    }

    setLoading(true);

    try {
      const res = await api.createOrder({
        eventId: event.id,
        buyerName: buyerName.trim(),
        buyerPhone: buyerPhone.trim(),
        buyerDocumentId: buyerDocumentId.trim(),
        attendees: finalAttendees,
      });

      setCreatedOrder(res.order);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al crear la orden de reserva');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 SUBMISSION: Upload receipt through web platform
  const handleUploadWebReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrder) return;

    if (!receiptFile) {
      setErrorMsg('Por favor selecciona el archivo o captura de tu comprobante de pago.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await api.uploadReceipt(createdOrder.orderNumber, receiptFile, referenceNumber.trim());
      onOrderCompleted(createdOrder.orderNumber);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al subir el comprobante a la plataforma');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 SUBMISSION: Confirm WhatsApp delivery
  const handleConfirmWhatsApp = async () => {
    if (!createdOrder) return;
    setLoading(true);
    try {
      await api.reportWhatsAppReceipt(createdOrder.orderNumber, referenceNumber.trim() || undefined);
      setWhatsAppNotified(true);
      setTimeout(() => {
        onOrderCompleted(createdOrder.orderNumber);
      }, 1200);
    } catch (err: any) {
      console.error(err);
      // Still proceed if backend notification had minor hiccup
      onOrderCompleted(createdOrder.orderNumber);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Back Navigation (Responsive Mobile-First) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <button
          onClick={() => {
            if (step === 2) {
              setStep(1);
            } else {
              onBack();
            }
          }}
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 2 ? 'Regresar a datos del comprador' : 'Volver a entradas'}</span>
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold self-start sm:self-auto">
          <span
            className={`px-3 py-1 rounded-full ${
              step === 1 ? 'bg-ted-red text-white shadow-md shadow-ted-red/20' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            1. Tus Datos
          </span>
          <span className="text-zinc-600">→</span>
          <span
            className={`px-3 py-1 rounded-full ${
              step === 2 ? 'bg-ted-red text-white shadow-md shadow-ted-red/20' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            2. Pago QR Oficial
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-8 p-4 rounded-2xl bg-red-950/70 border border-red-800/80 text-red-200 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
          <div className="text-sm font-medium">{errorMsg}</div>
        </div>
      )}

      {/* =========================================================================
          PASO 1: DATOS DEL COMPRADOR Y ASIGNACIÓN INTELIGENTE
         ========================================================================= */}
      {step === 1 && (
        <form onSubmit={handleProceedToPayment} className="space-y-8 animate-fade-in">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-ted-red/10 border border-ted-red/30 px-3 py-1 rounded-full text-ted-red text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reserva Inmediata en 2 Pasos</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Tus Datos de Contacto
            </h1>
            <p className="text-zinc-400 text-sm">
              Ingresa tus datos principales. Todos los boletos se reservarán inicialmente a tu nombre y podrás personalizarlos cuando desees.
            </p>
          </div>

          {/* Formulario de Contacto */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-ted-red" />
                Datos del Comprador
              </h2>
              <span className="text-xs text-zinc-400">Tus credenciales oficiales se vincularán a tu WhatsApp y CI</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Ej. Roberto Sánchez Gómez"
                  className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-ted-red transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  WhatsApp / Celular *
                </label>
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="Ej. 78687799"
                  className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-ted-red transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Cédula de Identidad / CI / DNI *
                </label>
                <input
                  type="text"
                  required
                  value={buyerDocumentId}
                  onChange={(e) => setBuyerDocumentId(e.target.value)}
                  placeholder="Ej. 10482910 CH"
                  className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-ted-red transition-all"
                />
              </div>
            </div>

            {/* Resumen para 1 sola entrada */}
            {attendees.length === 1 && (
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs text-zinc-300">
                  <p className="font-semibold text-white">1 Entrada Oficial reservada a tu nombre</p>
                  <p className="text-zinc-400 mt-0.5">
                    Tu código QR único de acceso estará vinculado a tu cédula de identidad ({buyerDocumentId || 'por indicar'}).
                  </p>
                </div>
              </div>
            )}

            {/* Bloque Obligatorio de Acompañantes para 2 o más entradas */}
            {attendees.length > 1 && (
              <div className="space-y-5 pt-4 border-t border-zinc-800/80 animate-fade-in">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-ted-red" />
                      <span>2. Datos de tus Acompañantes ({attendees.length - 1} {attendees.length - 1 === 1 ? 'persona' : 'personas'})</span>
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-ted-red/20 text-ted-red border border-ted-red/30 font-semibold">
                      Obligatorio
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Cada boleto cuenta con un <strong>código QR único e intransferible</strong> para ingreso y emisión de certificado. Cada asistente debe tener su propio nombre y carnet (no se permiten datos repetidos).
                  </p>
                </div>

                <div className="space-y-4">
                  {attendees.map((attendee, idx) => {
                    if (idx === 0) return null; // El titular es el comprador
                    const ticketInfo = event.ticketTypes.find((t) => t.id === attendee.ticketTypeId);

                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/90 space-y-3.5 shadow-md"
                      >
                        <div className="flex items-center justify-between text-xs border-b border-zinc-800/80 pb-2.5">
                          <span className="font-bold text-ted-red flex items-center gap-1.5">
                            <span>Acompañante #{idx + 1}</span>
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium">
                            {ticketInfo?.name || 'Entrada'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                              Nombre Completo *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej. Mariana López Suárez"
                              value={attendee.attendeeName || ''}
                              onChange={(e) => handleAttendeeChange(idx, 'attendeeName', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-ted-red transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                              Cédula de Identidad / CI / DNI *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej. 9876543 LP"
                              value={attendee.attendeeDocumentId || ''}
                              onChange={(e) =>
                                handleAttendeeChange(idx, 'attendeeDocumentId', e.target.value)
                              }
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-ted-red transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Resumen de Compra y Botón de Continuar */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold block">
                Total a Transferir
              </span>
              <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                  Bs {totalAmount.toFixed(2)}
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  ({attendees.length} {attendees.length === 1 ? 'boleto' : 'boletos'})
                </span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={loading}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold bg-ted-red hover:bg-red-700 text-white shadow-xl shadow-ted-red/20 transition-all rounded-2xl"
            >
              Continuar al Pago QR Oficial →
            </Button>
          </div>
        </form>
      )}

      {/* =========================================================================
          PASO 2: PAGO QR DUAL INTELIGENTE (WEB + WHATSAPP)
         ========================================================================= */}
      {step === 2 && createdOrder && (
        <div className="space-y-8 animate-fade-in">
          {/* Banner de Reserva Exitosa */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-900 border border-emerald-500/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle className="w-4 h-4" />
                <span>Cupos Reservados Temporalmente</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Orden #{createdOrder.orderNumber}
              </h2>
              <p className="text-xs text-zinc-400">
                Titular: <strong className="text-zinc-200">{buyerName}</strong> • CI: {buyerDocumentId}
              </p>
            </div>

            <button
              onClick={handleCopyOrderNumber}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium border border-zinc-700 transition-colors shrink-0"
            >
              {copiedOrderNumber ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¡Código Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>

          {/* Tarjeta Central del Código QR Oficial */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Contenedor del QR de Alto Contraste */}
              <div className="shrink-0 flex flex-col items-center">
                {bankInfo.qrImageUrl ? (
                  <div className="space-y-3 text-center">
                    <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-white inline-block">
                      <img
                        src={bankInfo.qrImageUrl}
                        alt="Código QR Oficial TEDx USFX"
                        className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <a
                        href={bankInfo.qrImageUrl}
                        download={`qr-pago-tedx-${createdOrder.orderNumber}.png`}
                        className="text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700 inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-ted-red" />
                        <span>Guardar QR en Galería</span>
                      </a>
                      <a
                        href={bankInfo.qrImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1 underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ampliar</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-56 h-56 sm:w-64 sm:h-64 bg-zinc-950 border-2 border-dashed border-zinc-700 rounded-3xl flex flex-col items-center justify-center p-4 text-center">
                    <QrCode className="w-12 h-12 text-zinc-600 mb-2" />
                    <span className="text-xs font-semibold text-zinc-300">QR Oficial en Actualización</span>
                    <span className="text-[11px] text-zinc-500 mt-1 max-w-[180px]">
                      Comunícate con el equipo por WhatsApp para el pago directo.
                    </span>
                  </div>
                )}
              </div>

              {/* Instrucciones y Datos de Transferencia */}
              <div className="flex-1 space-y-5 text-center md:text-left w-full">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-ted-red text-xs font-bold uppercase tracking-wider">
                    <QrCode className="w-4 h-4" />
                    <span>Pago Simple QR Móvil</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Transfiere el Monto Exacto
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {bankInfo.instructions ||
                      'Abre tu aplicación bancaria móvil (BNB, BCP, Banco Sol, Mercantil, Bisa, etc.), selecciona la opción de Cobro Simple QR y escanea el código.'}
                  </p>
                </div>

                {/* Monto y Datos en Bolivianos */}
                <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-semibold uppercase">Monto a Transferir:</span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                      Bs {totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
                    <div>
                      <strong className="text-zinc-200">Titular:</strong> {bankInfo.accountHolder || 'TEDx USFX 2026'}
                    </div>
                    <div>
                      <strong className="text-zinc-200">Banco:</strong> {bankInfo.bankName || 'Cobro QR Simple'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Tienes 2 horas para enviar tu comprobante</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyBank}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-800 px-3.5 py-2 rounded-xl border border-zinc-700 transition-colors shrink-0"
                  >
                    {copiedBankInfo ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>¡Datos Copiados!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Datos Bancarios</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================================
              SECCIÓN DUAL DE CONFIRMACIÓN: WHATSAPP VS. SUBIDA WEB
             ===================================================================== */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-ted-red" />
              <span>Elige cómo deseas confirmar tu comprobante de pago:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* OPCIÓN 1: WHATSAPP DIRECTO (RECOMENDADO) */}
              <div className="bg-gradient-to-b from-emerald-950/40 to-zinc-900 border-2 border-emerald-500/50 hover:border-emerald-500 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xl transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                      Canal Inmediato
                    </span>
                    <MessageCircle className="w-6 h-6 text-emerald-400" />
                  </div>

                  <h4 className="text-lg font-bold text-white">
                    Enviar Comprobante por WhatsApp
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Abre el chat con el equipo de validación de TEDx USFX con tu mensaje y orden pre-llenados. Adjunta tu captura en el chat y te acreditamos de inmediato.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <a
                    href={getWhatsAppLink(createdOrder.orderNumber)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/50 transition-all text-center"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Abrir WhatsApp con mi Comprobante</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleConfirmWhatsApp}
                    disabled={loading || whatsAppNotified}
                    className="w-full text-xs text-zinc-300 hover:text-white py-2 text-center underline font-medium transition-colors"
                  >
                    {whatsAppNotified
                      ? 'Notificación enviada. Redirigiendo a tus boletos...'
                      : 'Ya envié el mensaje por WhatsApp → Ver mis boletos'}
                  </button>
                </div>
              </div>

              {/* OPCIÓN 2: SUBIDA DIRECTA EN PLATAFORMA */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider border border-zinc-700">
                      Carga en la Web
                    </span>
                    <Upload className="w-6 h-6 text-zinc-400" />
                  </div>

                  <h4 className="text-lg font-bold text-white">
                    Subir Captura a la Plataforma
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Si prefieres no usar WhatsApp, arrastra o selecciona la captura de tu comprobante y la revisaremos en el panel web.
                  </p>
                </div>

                <form onSubmit={handleUploadWebReceipt} className="space-y-4">
                  {/* Selector de Archivo */}
                  <div className="border border-dashed border-zinc-700 hover:border-ted-red/60 rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-zinc-950/40">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {receiptPreview ? (
                      <div className="space-y-2">
                        <img
                          src={receiptPreview}
                          alt="Vista previa"
                          className="max-h-28 mx-auto rounded-lg shadow-sm border border-zinc-700"
                        />
                        <p className="text-xs text-emerald-400 font-medium truncate">
                          {receiptFile?.name}
                        </p>
                      </div>
                    ) : receiptFile ? (
                      <div className="space-y-1 py-2">
                        <FileText className="w-6 h-6 text-emerald-400 mx-auto" />
                        <p className="text-xs font-semibold text-white truncate">{receiptFile.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 py-3">
                        <Upload className="w-5 h-5 text-zinc-500 mx-auto" />
                        <p className="text-xs font-semibold text-zinc-300">
                          Seleccionar captura de pantalla o PDF
                        </p>
                        <p className="text-[10px] text-zinc-500">JPG, PNG, WebP o PDF</p>
                      </div>
                    )}
                  </div>

                  {/* Número de Referencia Opcional */}
                  <input
                    type="text"
                    placeholder="Nº de Referencia bancaria (Opcional)"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-ted-red"
                  />

                  <Button
                    type="submit"
                    size="sm"
                    isLoading={loading}
                    disabled={!receiptFile}
                    className="w-full py-3 text-xs font-bold rounded-xl"
                  >
                    Confirmar y Subir a la Web
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Enlace de Salto Directo a Mis Boletos */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => onOrderCompleted(createdOrder.orderNumber)}
              className="text-xs text-zinc-400 hover:text-white transition-colors underline"
            >
              Consultar el estado de mi orden #{createdOrder.orderNumber} en el Ticket Hub →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

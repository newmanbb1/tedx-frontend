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
} from 'lucide-react';
import { EventData, PaymentSettingData, AttendeeInput } from '../types/index.js';
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
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerDocumentId, setBuyerDocumentId] = useState('');

  const initialAttendees: AttendeeInput[] = [];
  event.ticketTypes.forEach((t) => {
    const qty = selectedQuantities[t.id] || 0;
    for (let i = 0; i < qty; i++) {
      initialAttendees.push({
        ticketTypeId: t.id,
        attendeeName: '',
        attendeeEmail: '',
        attendeeDocumentId: '',
      });
    }
  });

  const [attendees, setAttendees] = useState<AttendeeInput[]>(initialAttendees);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');

  const [copiedBankInfo, setCopiedBankInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const bankInfo = paymentSettings[0] || {
    bankName: 'Banco Metropolitano',
    accountType: 'Cuenta Corriente',
    accountNumber: '0102-0456-7890-12345678',
    accountHolder: 'Fundación TEDx Innova A.C.',
    holderId: 'J-40998877-1',
    instructions: 'Transfiere el monto exacto y adjunta tu comprobante.',
  };

  const totalAmount = attendees.reduce((sum, a) => {
    const ticket = event.ticketTypes.find((t) => t.id === a.ticketTypeId);
    return sum + (ticket?.price || 0);
  }, 0);

  const handleCopyBank = () => {
    const textToCopy = `Banco: ${bankInfo.bankName}\nCuenta: ${bankInfo.accountNumber}\nTipo: ${bankInfo.accountType}\nTitular: ${bankInfo.accountHolder}\nRUT/RIF/Cédula: ${bankInfo.holderId}\nMonto: $${totalAmount.toFixed(2)}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedBankInfo(true);
    setTimeout(() => setCopiedBankInfo(false), 3000);
  };

  const handleCopyBuyerToFirstAttendee = () => {
    if (attendees.length > 0) {
      const copy = [...attendees];
      copy[0] = {
        ...copy[0],
        attendeeName: buyerName,
        attendeeEmail: buyerEmail,
        attendeeDocumentId: buyerDocumentId,
      };
      setAttendees(copy);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!buyerName || !buyerEmail || !buyerPhone || !buyerDocumentId) {
      setErrorMsg('Por favor completa todos los datos del comprador.');
      return;
    }

    for (let i = 0; i < attendees.length; i++) {
      const a = attendees[i];
      if (!a.attendeeName || !a.attendeeEmail || !a.attendeeDocumentId) {
        setErrorMsg(`Por favor completa los datos del Asistente #${i + 1}`);
        return;
      }
    }

    if (!receiptFile) {
      setErrorMsg('Debes adjuntar el comprobante o captura de la transferencia.');
      return;
    }

    setLoading(true);

    try {
      const { order } = await api.createOrder({
        eventId: event.id,
        buyerName,
        buyerEmail,
        buyerPhone,
        buyerDocumentId,
        attendees,
      });

      await api.uploadReceipt(order.orderNumber, receiptFile, referenceNumber);
      onOrderCompleted(order.orderNumber);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al procesar la orden y comprobante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a la selección de entradas
      </button>

      <div className="space-y-2 mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Datos de los Asistentes y Pago
        </h1>
        <p className="text-zinc-400 text-sm">
          Completa la información de los asistentes y realiza la transferencia a la cuenta oficial.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-8 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
          <div className="text-sm">{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-ted-red" />
              1. Datos del Comprador (Contacto Principal)
            </h2>
            <span className="text-xs text-zinc-400">Recibirá los boletos por email</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Ej. Roberto Sánchez"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-ted-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="roberto@ejemplo.com"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-ted-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Teléfono de Contacto / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="+1 234 567 890"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-ted-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Documento de Identidad / Cédula / DNI *
              </label>
              <input
                type="text"
                required
                value={buyerDocumentId}
                onChange={(e) => setBuyerDocumentId(e.target.value)}
                placeholder="Ej. 12345678"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-ted-red"
              />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-ted-red" />
                2. Acreditación de Asistentes ({attendees.length} {attendees.length === 1 ? 'boleto' : 'boletos'})
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Estos datos se imprimirán en las credenciales y se vincularán al código QR individual.
              </p>
            </div>
            {buyerName && (
              <button
                type="button"
                onClick={handleCopyBuyerToFirstAttendee}
                className="text-xs text-ted-red hover:underline font-semibold"
              >
                Copiar mis datos para el Boleto #1
              </button>
            )}
          </div>

          <div className="space-y-6">
            {attendees.map((attendee, idx) => {
              const ticketInfo = event.ticketTypes.find((t) => t.id === attendee.ticketTypeId);
              return (
                <div
                  key={idx}
                  className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                    <span className="text-sm font-bold text-ted-red">
                      Asistente #{idx + 1}
                    </span>
                    <span className="text-xs px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-lg font-medium border border-zinc-700">
                      {ticketInfo?.name} (${ticketInfo?.price.toFixed(2)})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                        Nombre y Apellido *
                      </label>
                      <input
                        type="text"
                        required
                        value={attendee.attendeeName}
                        onChange={(e) =>
                          handleAttendeeChange(idx, 'attendeeName', e.target.value)
                        }
                        placeholder="Nombre completo"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-ted-red"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                        Correo del Asistente *
                      </label>
                      <input
                        type="email"
                        required
                        value={attendee.attendeeEmail}
                        onChange={(e) =>
                          handleAttendeeChange(idx, 'attendeeEmail', e.target.value)
                        }
                        placeholder="email@asistente.com"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-ted-red"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                        Cédula / Documento de Identidad *
                      </label>
                      <input
                        type="text"
                        required
                        value={attendee.attendeeDocumentId}
                        onChange={(e) =>
                          handleAttendeeChange(idx, 'attendeeDocumentId', e.target.value)
                        }
                        placeholder="ID para acreditación"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-ted-red"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-ted-red" />
              3. Datos Bancarios & Subida de Comprobante
            </h2>
            <div className="text-right">
              <span className="text-xs text-zinc-400 block">Total a Transferir</span>
              <span className="text-2xl font-black text-white">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ted-red uppercase tracking-wider">
                Cuenta Bancaria Oficial TEDx
              </span>
              <button
                type="button"
                onClick={handleCopyBank}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700 transition-colors"
              >
                {copiedBankInfo ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Datos</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-sm">
              <div>
                <p className="text-xs text-zinc-400">Banco:</p>
                <p className="font-bold text-white">{bankInfo.bankName}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Tipo de Cuenta:</p>
                <p className="font-bold text-white">{bankInfo.accountType}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Número de Cuenta:</p>
                <p className="font-mono font-bold text-white tracking-wider">{bankInfo.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Titular y RIF/Cédula:</p>
                <p className="font-bold text-white">{bankInfo.accountHolder}</p>
                <p className="text-xs text-zinc-400">{bankInfo.holderId}</p>
              </div>
            </div>

            {bankInfo.instructions && (
              <p className="text-xs text-zinc-400 italic pt-2 border-t border-zinc-800">
                {bankInfo.instructions}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Adjuntar Comprobante de Transferencia (Captura o PDF) *
            </label>

            <div className="border-2 border-dashed border-zinc-700 hover:border-ted-red/60 rounded-2xl p-6 text-center cursor-pointer transition-colors relative bg-zinc-950/40">
              <input
                type="file"
                required
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {receiptPreview ? (
                <div className="space-y-3">
                  <img
                    src={receiptPreview}
                    alt="Vista previa comprobante"
                    className="max-h-56 mx-auto rounded-lg shadow-md border border-zinc-700"
                  />
                  <p className="text-xs text-emerald-400 font-medium">
                    ✓ {receiptFile?.name} cargado correctamente (Haz clic para cambiarlo)
                  </p>
                </div>
              ) : receiptFile ? (
                <div className="space-y-2 py-4">
                  <FileText className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-sm font-semibold text-white">{receiptFile.name}</p>
                  <p className="text-xs text-zinc-400">Archivo seleccionado (Haz clic para cambiarlo)</p>
                </div>
              ) : (
                <div className="space-y-3 py-6">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-white">
                    Arrastra aquí tu comprobante o haz clic para explorar
                  </p>
                  <p className="text-xs text-zinc-400">
                    Formatos soportados: JPG, PNG, WebP o PDF (Máx. 10MB)
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                Número de Referencia / Aprobación Bancaria (Opcional pero recomendado)
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Ej. REF-8392019"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ted-red"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800">
          <div className="text-xs text-zinc-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Tus datos están protegidos. El equipo organizador revisará tu pago en un plazo habitual de 1 a 6 horas.</span>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={loading}
            className="w-full sm:w-auto px-10 shadow-2xl shadow-ted-red/30"
          >
            Confirmar y Enviar Comprobante (${totalAmount.toFixed(2)})
          </Button>
        </div>
      </form>
    </div>
  );
};


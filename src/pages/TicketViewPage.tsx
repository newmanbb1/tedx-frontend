import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Printer,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Share2,
  Download,
  Sparkles,
} from 'lucide-react';
import { TicketData } from '../types/index.js';
import { api } from '../services/api.js';
import { Button } from '../components/ui/Button.js';

interface TicketViewPageProps {
  ticketCode: string;
  onBack: () => void;
}

export const TicketViewPage: React.FC<TicketViewPageProps> = ({ ticketCode, onBack }) => {
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const data = await api.getTicket(ticketCode);
        setTicket(data.ticket);
      } catch (err: any) {
        setErrorMsg(err.message || 'No se pudo cargar el boleto');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [ticketCode]);

  // Google Calendar URL Generator
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    'TEDx USFX 2026'
  )}&dates=20261121T133000Z/20261121T220000Z&details=${encodeURIComponent(
    `Pase Oficial de Acceso para ${ticket?.attendeeName || 'Asistente'} (Boleto: ${ticketCode}) en Teatro Gran Mariscal, Sucre. Presenta tu código QR en puerta.`
  )}&location=${encodeURIComponent('Teatro Gran Mariscal, Sucre, Bolivia')}`;

  // ICS File Generator
  const handleDownloadIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TEDx USFX//Event 2026//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:tedx-usfx-${ticketCode}@tedxusfx.com`,
      'DTSTAMP:20261112T000000Z',
      'DTSTART:20261121T133000Z',
      'DTEND:20261121T220000Z',
      'SUMMARY:TEDx USFX 2026',
      `DESCRIPTION:Pase oficial para ${ticket?.attendeeName || 'Asistente'}. Código: ${ticketCode}. Presenta tu código QR en la entrada.`,
      'LOCATION:Teatro Gran Mariscal, Sucre, Bolivia',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Pase_TEDx_USFX_${ticketCode}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWhatsAppShareLink = () => {
    if (!ticket) return '#';
    const message = `¡Hola! Aquí tienes tu pase oficial para *TEDx USFX 2026*:\n\nAsistente: *${ticket.attendeeName}*\nBoleto: *#${ticket.ticketCode}*\nLugar: Teatro Gran Mariscal, Sucre\nFecha: Sábado 21 de Noviembre, 9:30 AM\n\nPresenta tu código QR en puerta para ingresar.`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-zinc-400">
        Cargando credencial oficial TEDx USFX...
      </div>
    );
  }

  if (errorMsg || !ticket) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Boleto no encontrado</h2>
        <p className="text-sm text-zinc-400">{errorMsg || 'El código del boleto no es válido.'}</p>
        <Button onClick={onBack}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
      {/* Barra de Navegación y Acciones Rápidas */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Imprimir
          </Button>
        </div>
      </div>

      {/* Credencial Oficial TEDx USFX */}
      <div className="bg-zinc-900 border-2 border-ted-red/60 rounded-3xl overflow-hidden shadow-2xl shadow-ted-red/20 print:border-black print:text-black print:bg-white">
        {/* Cabecera Gráfica de la Credencial */}
        <div className="bg-gradient-to-r from-black via-zinc-900 to-black p-6 border-b border-zinc-800 text-center relative">
          <div className="flex items-baseline justify-center tracking-tighter">
            <span className="text-3xl sm:text-4xl font-black text-ted-red">
              TED<span className="text-xl align-super">x</span>
            </span>
            <span className="ml-2 text-2xl sm:text-3xl font-black text-white tracking-tight">
              USFX
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-ted-red" />
            <span>Pase Oficial de Acceso &bull; 2026</span>
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Asistente */}
          <div className="text-center space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-ted-red text-white uppercase tracking-wider">
              {ticket.ticketType?.name || 'Entrada General'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {ticket.attendeeName}
            </h1>
            <p className="text-sm text-zinc-400 font-mono">
              CI / Cédula: <strong className="text-zinc-200">{ticket.attendeeDocumentId}</strong>
            </p>
          </div>

          {/* Código QR Central de Alta Legibilidad */}
          <div className="flex flex-col items-center justify-center space-y-3 py-2">
            <div className="bg-white p-4 rounded-3xl shadow-2xl border-4 border-zinc-800 inline-block">
              {ticket.qrDataUrl ? (
                <img
                  src={ticket.qrDataUrl}
                  alt={`QR ${ticket.ticketCode}`}
                  className="w-56 h-56 object-contain rounded-lg"
                />
              ) : (
                <div className="w-56 h-56 flex flex-col items-center justify-center text-xs text-zinc-500 text-center p-4">
                  <span>Código QR pendiente de emisión por verificación</span>
                </div>
              )}
            </div>
            <p className="font-mono text-sm text-zinc-400 font-bold tracking-widest bg-zinc-950 px-4 py-1 rounded-full border border-zinc-800">
              {ticket.ticketCode}
            </p>
          </div>

          {/* Datos del Evento */}
          <div className="bg-zinc-950/80 rounded-2xl p-4 border border-zinc-800/80 space-y-3 text-xs text-zinc-300">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-ted-red shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Sábado, 21 de Noviembre de 2026</p>
                <p className="text-zinc-400">09:30 AM (Apertura de puertas 08:30 AM)</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-ted-red shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Teatro Gran Mariscal</p>
                <p className="text-zinc-400">Sucre, Bolivia</p>
              </div>
            </div>
          </div>

          {/* Botones Rápidos de Guardado y Calendario */}
          <div className="space-y-3 no-print pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-zinc-700 transition-colors text-center"
              >
                <Calendar className="w-4 h-4 text-ted-red" />
                <span>Añadir a Google Calendar</span>
              </a>

              <button
                type="button"
                onClick={handleDownloadIcs}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-zinc-700 transition-colors text-center"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Descargar iCal (.ics)</span>
              </button>
            </div>

            <a
              href={getWhatsAppShareLink()}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-xs font-bold text-emerald-300 border border-emerald-700 transition-colors text-center"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Enviar este pase por WhatsApp</span>
            </a>
          </div>

          <div className="text-center pt-2">
            {ticket.isCheckedIn ? (
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-950/60 px-4 py-2 rounded-xl border border-amber-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>Boleto acreditado en puerta</span>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                Presenta este código QR desde tu pantalla de celular o impreso al ingresar al evento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

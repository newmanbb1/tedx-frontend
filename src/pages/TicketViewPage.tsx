import React, { useEffect, useState } from 'react';
import { ArrowLeft, Printer, MapPin, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-zinc-400">
        Cargando credencial oficial...
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
      <div className="flex items-center justify-between no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <Button
          size="sm"
          variant="outline"
          leftIcon={<Printer className="w-4 h-4" />}
          onClick={() => window.print()}
        >
          Imprimir / Guardar PDF
        </Button>
      </div>

      <div className="bg-zinc-900 border-2 border-ted-red/60 rounded-3xl overflow-hidden shadow-2xl shadow-ted-red/10 print:border-black print:text-black print:bg-white">
        <div className="bg-gradient-to-r from-ted-black via-zinc-900 to-ted-black p-6 border-b border-zinc-800 text-center relative">
          <div className="flex items-baseline justify-center tracking-tighter">
            <span className="text-3xl font-black text-ted-red">
              TED<span className="text-xl align-super">x</span>
            </span>
            <span className="ml-2 text-2xl font-bold text-white tracking-tight">
              Innova
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest font-semibold">
            Pase Oficial de Acceso &bull; 2026
          </p>
        </div>

        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-ted-red text-white uppercase tracking-wider">
              {ticket.ticketType?.name || 'Entrada General'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {ticket.attendeeName}
            </h1>
            <p className="text-sm text-zinc-400 font-mono">
              Doc. Identidad: {ticket.attendeeDocumentId}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-3 py-2">
            <div className="bg-white p-4 rounded-2xl shadow-2xl border-4 border-zinc-800 inline-block">
              {ticket.qrDataUrl ? (
                <img
                  src={ticket.qrDataUrl}
                  alt={`QR ${ticket.ticketCode}`}
                  className="w-56 h-56 object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-zinc-500">
                  QR Pendiente de Emisión
                </div>
              )}
            </div>
            <p className="font-mono text-xs text-zinc-400 font-bold tracking-widest">
              {ticket.ticketCode}
            </p>
          </div>

          <div className="bg-zinc-950/80 rounded-2xl p-4 border border-zinc-800/80 space-y-3 text-xs text-zinc-300">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-ted-red shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Sábado, 28 de Noviembre de 2026</p>
                <p className="text-zinc-400">09:00 AM - 18:00 PM (Apertura de puertas 08:30 AM)</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-ted-red shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Auditorio Mayor de la Ciudad</p>
                <p className="text-zinc-400">Av. Innovación 1024, Pabellón Central</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            {ticket.isCheckedIn ? (
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-950/60 px-4 py-2 rounded-xl border border-amber-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>Boleto acreditado el día del evento</span>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">
                Presenta este código QR desde tu pantalla o impreso al ingresar al evento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

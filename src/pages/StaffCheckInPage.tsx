import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Camera,
  UserCheck,
} from 'lucide-react';
import { CheckInResult, TicketData } from '../types/index.js';
import { api } from '../services/api.js';
import { Button } from '../components/ui/Button.js';

export const StaffCheckInPage: React.FC = () => {
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState<CheckInResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TicketData[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const handleValidate = async (code: string) => {
    if (!code || loading) return;
    setLoading(true);
    try {
      const result = await api.validateTicket(code);
      setLastResult(result);
      setScanHistory((prev) => [result, ...prev.slice(0, 9)]);

      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (result.status === 'SUCCESS') {
          osc.frequency.setValueAtTime(800, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.15);
        } else {
          osc.frequency.setValueAtTime(300, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
        }
      } catch {
      }
    } catch (err: any) {
      setLastResult({
        status: 'INVALID',
        error: err.message || 'Error de conexión con el servidor',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
    };

    const scanner = new Html5QrcodeScanner('qr-reader', config, false);
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        handleValidate(decodedText);
      },
      (_errorMessage) => {
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleValidate(manualCode.trim());
      setManualCode('');
    }
  };

  const handleSearchAttendees = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const data = await api.searchAttendees(searchQuery.trim());
      setSearchResults(data.attendees);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-ted-red" />
            Control de Acceso y Check-In
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Escanea los boletos de los asistentes con la cámara web o busca por nombre/cédula.
          </p>
        </div>
      </div>

      {lastResult && (
        <div
          className={`p-6 rounded-3xl border-2 transition-all duration-300 shadow-2xl animate-in fade-in zoom-in-95 ${
            lastResult.status === 'SUCCESS'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-emerald-900/30'
              : lastResult.status === 'ALREADY_USED'
              ? 'bg-rose-950/90 border-rose-500 text-rose-100 shadow-rose-900/30'
              : 'bg-amber-950/90 border-amber-500 text-amber-100 shadow-amber-900/30'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-1">
              {lastResult.status === 'SUCCESS' ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              ) : lastResult.status === 'ALREADY_USED' ? (
                <XCircle className="w-10 h-10 text-rose-400" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-amber-400" />
              )}
            </div>

            <div className="space-y-1 flex-1">
              <h2 className="text-xl sm:text-2xl font-black">
                {lastResult.status === 'SUCCESS'
                  ? '¡ACCESO AUTORIZADO!'
                  : lastResult.status === 'ALREADY_USED'
                  ? '¡ALERTA: BOLETO YA UTILIZADO!'
                  : 'ACCESO DENEGADO'}
              </h2>
              <p className="text-sm opacity-90">
                {lastResult.message || lastResult.error}
              </p>

              {lastResult.ticket && (
                <div className="pt-3 mt-3 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="opacity-70 block">Asistente:</span>
                    <span className="font-bold text-sm">{lastResult.ticket.attendeeName}</span>
                  </div>
                  <div>
                    <span className="opacity-70 block">Documento:</span>
                    <span className="font-bold">{lastResult.ticket.attendeeDocumentId}</span>
                  </div>
                  <div>
                    <span className="opacity-70 block">Pase / Categoría:</span>
                    <span className="font-bold">{lastResult.ticket.ticketType}</span>
                  </div>
                  <div>
                    <span className="opacity-70 block">Código Boleto:</span>
                    <span className="font-mono">{lastResult.ticket.ticketCode}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-ted-red" />
              Cámara en Vivo (Escáner QR)
            </h3>
            <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
              Activo
            </span>
          </div>

          <div
            id="qr-reader"
            className="rounded-2xl overflow-hidden border border-zinc-700 bg-black min-h-[300px]"
          />

          <p className="text-xs text-zinc-400 text-center">
            Apunta la cámara del dispositivo hacia el código QR impreso o en pantalla del asistente.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <QrCode className="w-4 h-4 text-ted-red" />
              Ingreso Manual de Código
            </h3>

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ej. TEDX-ABCDE-T1-XXXX"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ted-red"
              />
              <Button type="submit" isLoading={loading}>
                Validar
              </Button>
            </form>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Search className="w-4 h-4 text-ted-red" />
              Búsqueda por Nombre o Documento
            </h3>

            <form onSubmit={handleSearchAttendees} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre, email o cédula..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-ted-red"
              />
              <Button size="sm" type="submit" isLoading={searchLoading}>
                Buscar
              </Button>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-56 overflow-y-auto pt-2">
                {searchResults.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs gap-2"
                  >
                    <div>
                      <p className="font-bold text-white">{t.attendeeName}</p>
                      <p className="text-zinc-400">ID: {t.attendeeDocumentId} &bull; {t.ticketType.name}</p>
                    </div>

                    {t.isCheckedIn ? (
                      <span className="text-[11px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                        Ya acreditado
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        className="text-xs py-1"
                        onClick={() => handleValidate(t.ticketCode)}
                      >
                        Acreditar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {scanHistory.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-zinc-800 pb-2">
                <span>Historial Reciente de la Sesión</span>
                <span className="text-xs text-zinc-400 font-normal">{scanHistory.length} escaneos</span>
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {scanHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {item.ticket?.attendeeName || 'Escaneo manual'}
                      </p>
                      <p className="text-[11px] text-zinc-400">{item.ticket?.ticketType || item.error}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'SUCCESS'
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-rose-950 text-rose-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

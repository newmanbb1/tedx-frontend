import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Camera,
  CameraOff,
  Zap,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  ExternalLink,
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

  // Estados de control de cámara
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ text: string; time: number } | null>(null);
  const isStartingRef = useRef(false);

  const isSecure =
    typeof window !== 'undefined' &&
    (window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  const playBeep = (success: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (success) {
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
      // Audio restringido antes de interacción del usuario
    }
  };

  const handleValidate = async (rawCode: string) => {
    if (!rawCode || loading) return;

    // Normalizar si viene como URL completa (ej. https://tedxusfx.tech/?ticket=TEDX-...)
    let code = rawCode.trim();
    const urlMatch = code.match(/[?&]ticket=([^&#]+)/);
    if (urlMatch && urlMatch[1]) {
      code = decodeURIComponent(urlMatch[1]);
    }

    setLoading(true);
    try {
      const result = await api.validateTicket(code);
      setLastResult(result);
      setScanHistory((prev) => [result, ...prev.slice(0, 9)]);
      playBeep(result.status === 'SUCCESS');
    } catch (err: any) {
      const failResult: CheckInResult = {
        status: 'INVALID',
        error: err.message || 'Error de conexión con el servidor',
      };
      setLastResult(failResult);
      playBeep(false);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = async () => {
    if (!scannerRef.current) return;
    try {
      const state = scannerRef.current.getState();
      if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
        await scannerRef.current.stop();
      }
      setIsScanning(false);
      setTorchOn(false);
      setTorchSupported(false);
    } catch (err) {
      console.error('[stopCamera]', err);
    }
  };

  const startCamera = async (cameraId?: string) => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setCameraError(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      const scanner = scannerRef.current;
      const state = scanner.getState();
      if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
        await scanner.stop();
      }

      const cameraSource = cameraId
        ? { deviceId: { exact: cameraId } }
        : { facingMode: 'environment' };

      await scanner.start(
        cameraSource,
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edgeSize = Math.max(180, Math.floor(minEdge * 0.72));
            return { width: edgeSize, height: edgeSize };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          const now = Date.now();
          if (
            lastScanRef.current &&
            lastScanRef.current.text === decodedText &&
            now - lastScanRef.current.time < 2800
          ) {
            return; // Debounce anti duplicados de lectura continua
          }
          lastScanRef.current = { text: decodedText, time: now };
          handleValidate(decodedText);
        },
        () => {
          // Ignorar frames sin código QR
        }
      );

      setIsScanning(true);

      // Comprobar si admite linterna (torch)
      try {
        const capabilities = scanner.getRunningTrackCapabilities();
        setTorchSupported(Boolean((capabilities as any)?.torch));
      } catch {
        setTorchSupported(false);
      }
    } catch (err: any) {
      console.error('[startCamera]', err);
      setIsScanning(false);
      setCameraError(
        err.message ||
          'No se pudo acceder a la cámara. Asegúrate de otorgar permisos o ingresar a través de HTTPS.'
      );
    } finally {
      isStartingRef.current = false;
    }
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !isScanning || !torchSupported) return;
    try {
      const nextTorch = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch } as any],
      });
      setTorchOn(nextTorch);
    } catch (err) {
      console.warn('[toggleTorch]', err);
    }
  };

  const handleCameraChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    await startCamera(newId);
  };

  useEffect(() => {
    let isMounted = true;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!isMounted) return;
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Preferir cámara trasera por defecto
          const backCam =
            devices.find(
              (d) =>
                d.label.toLowerCase().includes('back') ||
                d.label.toLowerCase().includes('trasera') ||
                d.label.toLowerCase().includes('rear')
            ) || devices[devices.length - 1];

          setSelectedCameraId(backCam.id);
          startCamera(backCam.id);
        } else {
          startCamera();
        }
      })
      .catch((err) => {
        console.warn('[getCameras]', err);
        if (isMounted) {
          startCamera();
        }
      });

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
            scannerRef.current
              .stop()
              .then(() => {
                scannerRef.current?.clear();
              })
              .catch(console.error);
          } else {
            scannerRef.current.clear();
          }
        } catch (e) {
          console.error(e);
        }
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-ted-red" />
            Control de Acceso y Check-In
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Escanea los boletos de los asistentes con la cámara o busca por nombre y carnet.
          </p>
        </div>
      </div>

      {/* Alerta si el usuario está en conexión HTTP insegura */}
      {!isSecure && (
        <div className="bg-amber-950/90 border border-amber-600 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200 text-xs">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>Atención:</strong> Estás accediendo por conexión HTTP ({window.location.host}).
              Los navegadores móviles requieren HTTPS para activar la cámara web.
            </span>
          </div>
          <a
            href="https://tedxusfx.tech/checkin"
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir en HTTPS</span>
          </a>
        </div>
      )}

      {/* Cartel de Resultado de Validación */}
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
                  ? `¡ACCESO AUTORIZADO! (CHECK ${lastResult.ticket?.checkInCount || 1}/4)`
                  : lastResult.status === 'ALREADY_USED'
                  ? '¡ALERTA: BOLETO YA COMPLETÓ SUS 4 CHECKS!'
                  : 'ACCESO DENEGADO'}
              </h2>
              <p className="text-sm opacity-90">{lastResult.message || lastResult.error}</p>

              {/* Indicador visual de los 4 checks */}
              {lastResult.ticket?.checkInCount !== undefined && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {[1, 2, 3, 4].map((step) => {
                    const isDone = (lastResult.ticket?.checkInCount || 0) >= step;
                    return (
                      <div
                        key={step}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                          isDone
                            ? 'bg-emerald-500 text-black border-emerald-400'
                            : 'bg-zinc-900/80 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        <span>Check {step}</span>
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    );
                  })}
                </div>
              )}

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

      {/* Grid: Cámara y Controles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Columna Izquierda: Escáner de Cámara */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-ted-red" />
              Cámara en Vivo
            </h3>
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${
                isScanning
                  ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
                  : 'text-zinc-500 bg-zinc-950 border-zinc-800'
              }`}
            >
              {isScanning ? 'Escaneando' : 'Inactiva'}
            </span>
          </div>

          {/* Selector de Dispositivos y Linterna */}
          <div className="flex flex-wrap items-center gap-2">
            {cameras.length > 1 && (
              <select
                value={selectedCameraId}
                onChange={handleCameraChange}
                className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white flex-1 focus:outline-none focus:border-ted-red"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label || `Cámara ${c.id.substring(0, 8)}`}
                  </option>
                ))}
              </select>
            )}

            {torchSupported && isScanning && (
              <Button
                variant={torchOn ? 'primary' : 'outline'}
                size="sm"
                onClick={toggleTorch}
                title="Linterna / Flash"
                className={`text-xs ${torchOn ? 'bg-amber-500 hover:bg-amber-600 text-black border-none' : 'border-zinc-700 text-zinc-300'}`}
              >
                <Zap className="w-3.5 h-3.5 mr-1" />
                {torchOn ? 'Flash ON' : 'Flash'}
              </Button>
            )}

            {isScanning ? (
              <Button
                variant="outline"
                size="sm"
                onClick={stopCamera}
                className="text-xs border-zinc-700 text-zinc-400 hover:text-white"
              >
                <CameraOff className="w-3.5 h-3.5 mr-1" />
                Pausar
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => startCamera(selectedCameraId)}
                className="text-xs bg-ted-red hover:bg-red-700 text-white"
              >
                <Camera className="w-3.5 h-3.5 mr-1" />
                Iniciar Cámara
              </Button>
            )}
          </div>

          {/* Visor de Cámara */}
          <div
            id="qr-reader"
            className="rounded-2xl overflow-hidden border border-zinc-700 bg-black min-h-[300px] w-full flex items-center justify-center relative"
          />

          {cameraError && (
            <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-200 text-xs space-y-2">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                No se pudo activar la cámara
              </p>
              <p className="opacity-90">{cameraError}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => startCamera(selectedCameraId)}
                className="text-xs border-rose-700 text-rose-300 hover:bg-rose-900"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Reintentar
              </Button>
            </div>
          )}

          <p className="text-xs text-zinc-400 text-center">
            Apunta la cámara del dispositivo hacia el código QR de la credencial o entrada digital.
          </p>
        </div>

        {/* Columna Derecha: Búsqueda Manual e Historial */}
        <div className="space-y-6">
          {/* Ingreso Manual */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
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
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ted-red font-mono"
              />
              <Button type="submit" isLoading={loading} className="bg-ted-red hover:bg-red-700 text-white font-bold">
                Validar
              </Button>
            </form>
          </div>

          {/* Búsqueda por Cédula o Nombre */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Search className="w-4 h-4 text-ted-red" />
              Búsqueda por Nombre o Documento
            </h3>

            <form onSubmit={handleSearchAttendees} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre o Carnet de Identidad..."
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-ted-red"
              />
              <Button size="sm" type="submit" isLoading={searchLoading} className="bg-zinc-800 hover:bg-zinc-700 text-white">
                Buscar
              </Button>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-56 overflow-y-auto pt-2">
                {searchResults.map((t) => {
                  const checkCount = t.checkInCount || (t.isCheckedIn ? 1 : 0);
                  const isComplete = checkCount >= 4;

                  return (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs gap-2"
                    >
                      <div>
                        <p className="font-bold text-white">{t.attendeeName}</p>
                        <p className="text-zinc-400">
                          CI: {t.attendeeDocumentId} &bull; {t.ticketType.name}
                        </p>
                      </div>

                      {isComplete ? (
                        <span className="text-[11px] text-zinc-400 bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-700 font-semibold">
                          4/4 Checks Usados
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                            {checkCount}/4 checks
                          </span>
                          <Button
                            size="sm"
                            variant="primary"
                            className="text-xs py-1 bg-ted-red hover:bg-red-700 text-white font-bold"
                            onClick={() => handleValidate(t.ticketCode)}
                          >
                            Check {checkCount + 1}/4
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Historial de la Sesión */}
          {scanHistory.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-3 shadow-xl">
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
                      <p className="text-[11px] text-zinc-400">
                        {item.ticket?.ticketType || item.error}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'SUCCESS'
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-rose-950 text-rose-300'
                      }`}
                    >
                      {item.status === 'SUCCESS' ? `Check ${item.ticket?.checkInCount || 1}/4` : item.status}
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

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import { CertificateData, CertificateVerifyResult } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';
import {
  Award,
  Search,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';

interface CertificatesPortalPageProps {
  initialCode?: string;
  onGoHome: () => void;
}

export function CertificatesPortalPage({ initialCode, onGoHome }: CertificatesPortalPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [lookupMessage, setLookupMessage] = useState<{ type: 'error' | 'warning' | 'info'; text: string } | null>(null);

  // Verificación de QR
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyResult, setVerifyResult] = useState<CertificateVerifyResult | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Si se pasa un código inicial para verificar
  useEffect(() => {
    if (initialCode) {
      handleVerifyCode(initialCode);
    }
  }, [initialCode]);

  // Dibujar el certificado en el Canvas cuando se carga el certificado
  useEffect(() => {
    if (!certificate) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensiones en alta resolución para impresión (1920x1080)
    canvas.width = 1920;
    canvas.height = 1080;

    const bgImage = new Image();
    bgImage.crossOrigin = 'anonymous';
    bgImage.src =
      certificate.template?.backgroundImageUrl ||
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80';

    bgImage.onload = () => {
      // 1. Fondo
      ctx.drawImage(bgImage, 0, 0, 1920, 1080);

      // Filtro semitransparente oscuro para contraste elegante
      ctx.fillStyle = 'rgba(10, 10, 12, 0.82)';
      ctx.fillRect(0, 0, 1920, 1080);

      // Marco dorado / rojo TEDx
      ctx.strokeStyle = '#EB0028';
      ctx.lineWidth = 14;
      ctx.strokeRect(50, 50, 1820, 980);

      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 3;
      ctx.strokeRect(70, 70, 1780, 940);

      // 2. Logo TEDx USFX
      ctx.fillStyle = '#EB0028';
      ctx.font = 'bold 64px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TEDx USFX', 960, 170);

      // Subtítulo
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '500 24px Inter, sans-serif';
      ctx.fillText('x = evento organizado independientemente bajo licencia de TED', 960, 215);

      // 3. Título del Certificado según categoría
      const categoryTitles: Record<string, string> = {
        ATTENDEE: 'CERTIFICADO DE ASISTENCIA Y PARTICIPACIÓN',
        SPEAKER: 'CERTIFICADO DE HONOR - DISERTANTE OFICIAL',
        VOLUNTEER: 'CERTIFICADO DE RECONOCIMIENTO - VOLUNTARIADO',
        VIP: 'CERTIFICADO ESPECIAL DE DISTINCIÓN & ALIANZA',
      };

      const certTitle = categoryTitles[certificate.category] || 'CERTIFICADO OFICIAL';
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 36px Inter, sans-serif';
      ctx.fillText(certTitle, 960, 310);

      // Texto de otorgamiento
      ctx.fillStyle = '#D4D4D8';
      ctx.font = '400 28px Inter, sans-serif';
      ctx.fillText('Se otorga el presente reconocimiento a:', 960, 390);

      // 4. Nombre del Beneficiario en Gran Tamaño
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 72px Georgia, serif';
      ctx.fillText(certificate.recipientName.toUpperCase(), 960, 480);

      // Carnet de Identidad
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '500 26px Inter, monospace';
      ctx.fillText(`C.I. ${certificate.recipientDocumentId}`, 960, 535);

      // 5. Cuerpo del Certificado
      ctx.fillStyle = '#E4E4E7';
      ctx.font = '300 28px Inter, sans-serif';
      ctx.fillText(
        'Por su destacada participación en el evento oficial "TEDx USFX: Fronteras del Pensamiento",',
        960,
        620
      );
      ctx.fillText(
        'un espacio multidisciplinario para compartir ideas que transforman la ciencia, tecnología y comunidad.',
        960,
        665
      );

      // Fecha y lugar
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '400 24px Inter, sans-serif';
      ctx.fillText('Celebrado el 28 de Noviembre de 2026 en el Auditorio Mayor de la Ciudad', 960, 740);

      // 6. Firmas
      ctx.strokeStyle = '#52525B';
      ctx.lineWidth = 2;

      // Línea Firma 1
      ctx.beginPath();
      ctx.moveTo(350, 890);
      ctx.lineTo(650, 890);
      ctx.stroke();

      ctx.fillStyle = '#FAFAFA';
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.fillText('Lic. María Morales', 500, 925);
      ctx.fillStyle = '#71717A';
      ctx.font = '400 18px Inter, sans-serif';
      ctx.fillText('Directora General TEDx USFX', 500, 955);

      // Línea Firma 2
      ctx.beginPath();
      ctx.moveTo(1270, 890);
      ctx.lineTo(1570, 890);
      ctx.stroke();

      ctx.fillStyle = '#FAFAFA';
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.fillText('Comité Académico & Curaduría', 1420, 925);
      ctx.fillStyle = '#71717A';
      ctx.font = '400 18px Inter, sans-serif';
      ctx.fillText('Fundación TEDx USFX', 1420, 955);

      // 7. QR de Validación Único al Centro Inferior
      if (certificate.qrDataUrl) {
        const qrImg = new Image();
        qrImg.src = certificate.qrDataUrl;
        qrImg.onload = () => {
          // Fondo blanco para el QR
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(900, 800, 120, 120);
          ctx.drawImage(qrImg, 905, 805, 110, 110);

          ctx.fillStyle = '#A1A1AA';
          ctx.font = '500 16px monospace';
          ctx.fillText(certificate.certificateCode, 960, 945);

          ctx.fillStyle = '#71717A';
          ctx.font = '400 14px Inter, sans-serif';
          ctx.fillText('Escanea para verificar autenticidad', 960, 968);
        };
      }
    };
  }, [certificate]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setLookupMessage(null);
    setCertificate(null);

    try {
      const res = await api.lookupCertificate(searchQuery.trim());

      if (res.status === 'SUCCESS' && res.certificate) {
        setCertificate(res.certificate);
      } else if (res.status === 'NOT_CHECKED_IN') {
        setLookupMessage({
          type: 'warning',
          text:
            res.message ||
            'Tu entrada está confirmada, pero requieres haber ingresado al evento (check-in en puerta) para generar tu certificado.',
        });
      } else if (res.status === 'ORDER_NOT_APPROVED') {
        setLookupMessage({
          type: 'warning',
          text: res.message || 'Tu orden aún no está aprobada por el equipo de finanzas.',
        });
      } else {
        setLookupMessage({
          type: 'error',
          text:
            res.message ||
            `No encontramos ningún registro con "${searchQuery}". Verifica tu número de carnet (CI).`,
        });
      }
    } catch (err: any) {
      setLookupMessage({
        type: 'error',
        text: err.message || 'Error al buscar certificado.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas || !certificate) return;

    const link = document.createElement('a');
    link.download = `Certificado-TEDx-${certificate.recipientName.replace(/\s+/g, '-')}-${certificate.certificateCode}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  const handleDownloadPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas || !certificate) return;

    const imgData = canvas.toDataURL('image/png', 1.0);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Certificado TEDx - ${certificate.recipientName}</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
            img { max-width: 100%; max-height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${imgData}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleVerifyCode = async (code: string) => {
    setVerifyLoading(true);
    setVerifyModalOpen(true);
    try {
      const res = await api.verifyCertificate(code);
      setVerifyResult(res);
    } catch (err: any) {
      setVerifyResult({ valid: false, error: err.message || 'Certificado no válido' });
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="max-w-3xl mx-auto flex items-center justify-start">
        <button
          onClick={onGoHome}
          className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Inicio</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-ted-red uppercase tracking-widest">
          <Award className="w-4 h-4" />
          Acreditación & Reconocimiento Oficial
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Portal de Certificados Digitales
        </h1>
        <p className="text-sm sm:text-base text-zinc-400">
          Consulta y descarga tu certificado oficial de asistencia a <strong>TEDx USFX 2026</strong> con código QR de verificación único e irrepetible.
        </p>
      </div>

      {/* Buscador de Certificados */}
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ingresa tu Carnet (CI) o Nombre Completo..."
              className="w-full bg-zinc-950 border-2 border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-ted-red font-medium"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !searchQuery.trim()}
            className="bg-ted-red hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-sm shrink-0 flex items-center justify-center space-x-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>Consultar</span>}
          </Button>
        </form>

        <p className="text-xs text-zinc-500 text-center">
          * Para emitir el certificado de Asistente, es indispensable haber realizado el ingreso/check-in en puerta.
        </p>
      </div>

      {/* Alertas y Mensajes */}
      {lookupMessage && (
        <div
          className={`max-w-2xl mx-auto p-4 rounded-xl border text-xs flex items-center space-x-3 ${
            lookupMessage.type === 'warning'
              ? 'bg-amber-950/60 border-amber-800 text-amber-200'
              : 'bg-red-950/60 border-red-800 text-red-200'
          }`}
        >
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
          <span>{lookupMessage.text}</span>
        </div>
      )}

      {/* Canvas y Vista Previa del Certificado */}
      {certificate && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Certificado Acreditado y Válido
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {certificate.recipientName}
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  Código Único: {certificate.certificateCode}
                </span>
              </div>

              {/* Botones de Descarga */}
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownloadPNG}
                  className="bg-ted-red hover:bg-red-700 text-white flex items-center space-x-1.5 text-xs font-bold shadow"
                >
                  <Download className="w-4 h-4 mr-1" />
                  <span>Descargar Imagen HD</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="border-zinc-700 text-zinc-300 hover:text-white flex items-center space-x-1.5 text-xs font-bold"
                >
                  <Printer className="w-4 h-4 mr-1" />
                  <span>Imprimir / PDF</span>
                </Button>
              </div>
            </div>

            {/* Lienzo Canvas Oficial */}
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950">
              <canvas
                ref={canvasRef}
                className="w-full h-auto block"
                style={{ aspectRatio: '16/9' }}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400 pt-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Autenticado digitalmente por TEDx USFX</span>
              </div>

              <button
                type="button"
                onClick={() => handleVerifyCode(certificate.certificateCode)}
                className="text-ted-red hover:underline flex items-center space-x-1 font-semibold"
              >
                <span>Probar verificación de código QR</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Validación de Autenticidad QR */}
      {verifyModalOpen && (
        <Modal
          isOpen={verifyModalOpen}
          onClose={() => setVerifyModalOpen(false)}
          title="Verificación Oficial de Autenticidad TEDx"
        >
          {verifyLoading ? (
            <div className="p-8 text-center text-xs text-zinc-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-ted-red mb-2" />
              Consultando registro oficial...
            </div>
          ) : verifyResult?.valid && verifyResult.certificate ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-center space-y-1">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-300">
                  Certificado Oficial y Válido
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Este documento fue emitido por la organización oficial de TEDx USFX.
                </p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2.5">
                <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-500">Beneficiario:</span>
                  <span className="font-bold text-white text-sm">
                    {verifyResult.certificate.recipientName}
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-500">Carnet (CI):</span>
                  <span className="font-mono text-zinc-200">
                    {verifyResult.certificate.recipientDocumentId}
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-500">Categoría:</span>
                  <span className="font-semibold text-ted-red">
                    {verifyResult.certificate.category}
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-500">Evento:</span>
                  <span className="text-zinc-300">{verifyResult.certificate.eventName}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-500">Código de Registro:</span>
                  <span className="font-mono text-xs text-amber-300 font-bold">
                    {verifyResult.certificate.code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Fecha de Validación:</span>
                  <span className="font-mono text-zinc-400">
                    {new Date(verifyResult.certificate.verifiedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center space-y-2 text-xs">
              <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
              <h4 className="text-sm font-bold text-rose-400">Certificado No Encontrado</h4>
              <p className="text-zinc-400">
                El código de verificación escaneado no corresponde a ningún certificado registrado en nuestra base de datos oficial.
              </p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
export default CertificatesPortalPage;


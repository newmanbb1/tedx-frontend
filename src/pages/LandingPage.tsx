import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Award,
  Maximize2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventData, SpeakerData, BackgroundImageData } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { api } from '../services/api.js';

interface LandingPageProps {
  event: EventData | null;
  onSelectTickets: (selection: Record<string, number>) => void;
  onNavigate?: (view: string) => void;
}

const DEFAULT_SPEAKERS = [
  {
    name: 'Erick Mita',
    role: 'Speaker Oficial',
    topic: 'TEDx USFX',
    imageUrl: '/images/flyer-erick-mita.jpg',
  },
  {
    name: 'Carlos Mendoza',
    role: 'Speaker Oficial',
    topic: 'Exploración e Innovación',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Ing. Sofía Alarcón',
    role: 'Speaker Oficial',
    topic: 'Sostenibilidad y Futuro',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Mateo Rivas',
    role: 'Speaker Oficial',
    topic: 'Creatividad y Nuevas Tecnologías',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ event, onSelectTickets, onNavigate }) => {
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [speakers, setSpeakers] = useState<Array<SpeakerData | typeof DEFAULT_SPEAKERS[0]>>(DEFAULT_SPEAKERS);
  const [bgImages, setBgImages] = useState<BackgroundImageData[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [selectedFlyer, setSelectedFlyer] = useState<{ name: string; url: string } | null>(null);

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const res = await api.getPublicSpeakers();
        if (res.speakers && res.speakers.length > 0) {
          setSpeakers(res.speakers);
        }
      } catch (e) {
        console.warn('Usando speakers predeterminados');
      }
    };

    const fetchBackgrounds = async () => {
      try {
        const res = await api.getBackgroundImages();
        if (res.images && res.images.length > 0) {
          setBgImages(res.images);
        }
      } catch (e) {
        console.warn('No hay imágenes de fondo');
      }
    };

    fetchSpeakers();
    fetchBackgrounds();
  }, []);

  useEffect(() => {
    if (bgImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [bgImages]);

  const handleQtyChange = (ticketTypeId: string, delta: number, maxAvailable: number) => {
    setSelectedQuantities((prev) => {
      const current = prev[ticketTypeId] || 0;
      const next = Math.max(0, Math.min(current + delta, maxAvailable, 10));
      if (next === 0) {
        const copy = { ...prev };
        delete copy[ticketTypeId];
        return copy;
      }
      return { ...prev, [ticketTypeId]: next };
    });
  };

  const totalSelectedTickets = Object.values(selectedQuantities).reduce((a, b) => a + b, 0);
  const totalAmount = event?.ticketTypes.reduce((sum, t) => {
    return sum + (selectedQuantities[t.id] || 0) * t.price;
  }, 0) || 0;

  const handleProceedToCheckout = () => {
    if (totalSelectedTickets > 0) {
      onSelectTickets(selectedQuantities);
    }
  };

  return (
    <div className="space-y-24 pb-20 overflow-hidden relative">
      {/* Fondo de Carrusel Dinámico */}
      {bgImages.length > 0 && (
        <div className="absolute inset-0 pointer-events-none -z-20 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBgIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.25, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${bgImages[currentBgIndex].imageUrl})` }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/60 to-[#0D0D0D]" />
        </div>
      )}

      {/* Fondo de patrón dinámico TEDx USFX */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none flex flex-wrap gap-12 font-black text-6xl tracking-widest text-red-600 overflow-hidden -z-10 leading-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <span key={i}>TEDxUSFX</span>
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-8 sm:pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(235,0,40,0.18)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] bg-ted-red/15 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-ted-red uppercase tracking-widest shadow-xl"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Edición Oficial 2026 &bull; {event?.title || 'TEDx USFX'}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-7xl font-black tracking-tight text-white leading-[1.05]"
          >
            IDEAS QUE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ted-red via-red-500 to-amber-500">
              VALE LA PENA DIFUNDIR
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-2xl mx-auto text-sm sm:text-xl text-zinc-300 leading-relaxed font-light"
          >
            {event?.subtitle ||
              'Conectando mentes audaces, ciencia de frontera y las soluciones que transformarán nuestra sociedad.'}
          </motion.p>

          {/* Bloques de Alto Contraste Inspirados en el Póster Oficial */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <div className="bg-white text-black font-black px-6 py-3 rounded-none shadow-2xl flex flex-col items-center justify-center w-full sm:w-auto uppercase tracking-tighter">
              <span className="text-sm sm:text-base">SÁBADO, 21 NOV.</span>
              <span className="text-xl sm:text-2xl leading-none">9:30 A.M.</span>
            </div>
            <div className="bg-white text-black font-black px-6 py-3 rounded-none shadow-2xl flex flex-col items-center justify-center w-full sm:w-auto uppercase tracking-tighter">
              <span className="text-xs sm:text-sm">LUGAR:</span>
              <span className="text-base sm:text-xl leading-none">TEATRO GRAN MARISCAL.</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          >
            <Button
              size="lg"
              onClick={() => {
                const el = document.getElementById('tickets');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 shadow-xl shadow-ted-red/20 font-bold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Comprar Entradas en Bs
            </Button>

            {onNavigate && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate('certificates')}
                className="w-full sm:w-auto border-zinc-700 text-zinc-200 hover:text-white flex items-center space-x-2"
              >
                <Award className="w-4 h-4 text-ted-red" />
                <span>Certificados de Asistencia</span>
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Sección de Oradores Oficiales (Diseño Afiches de Alto Impacto) */}
      <section id="speakers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ted-red uppercase tracking-widest bg-red-950/30 px-3.5 py-1.5 rounded-full border border-ted-red/20 shadow-sm">
            <Sparkles className="w-4 h-4 text-ted-red" />
            <span>Expositores Destacados</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Oradores Oficiales TEDx USFX
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
            Conoce a los conferencistas que compartirán ideas transformadoras en el Teatro Gran Mariscal.
          </p>
        </div>

        {/* Grid de Afiches de Speakers */}
        <div className={`grid gap-6 sm:gap-8 ${
          speakers.length === 1
            ? 'max-w-md mx-auto grid-cols-1'
            : speakers.length === 2
            ? 'max-w-3xl mx-auto grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {speakers.map((speaker, idx) => (
            <motion.div
              key={(speaker as any).id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              onClick={() => setSelectedFlyer({ name: speaker.name, url: speaker.imageUrl })}
              className="group cursor-pointer bg-zinc-950 border border-zinc-800/90 hover:border-ted-red/60 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Contenedor del Afiche Oficial (Formato Vertical Completo) */}
              <div className="relative aspect-[4/5] bg-zinc-950 overflow-hidden flex items-center justify-center">
                <img
                  src={speaker.imageUrl}
                  alt={speaker.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-white bg-ted-red/90 px-3.5 py-1.5 rounded-full backdrop-blur-sm shadow-lg">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Ver Afiche en Grande</span>
                  </span>
                </div>
              </div>

              {/* Pie de tarjeta con Nombre del Speaker */}
              <div className="p-4 sm:p-5 bg-zinc-900/95 border-t border-zinc-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-ted-red transition-colors">
                    {speaker.name}
                  </h3>
                  <p className="text-xs text-ted-red font-semibold uppercase tracking-wider mt-0.5">Speaker Oficial TEDx USFX</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-ted-red transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tickets Section */}
      <section id="tickets" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ted-red uppercase tracking-widest">
            <Zap className="w-4 h-4" />
            Acceso Oficial al Evento
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Adquiere Tus Entradas
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
            Selecciona la cantidad de pases que deseas y continúa para realizar tu acreditación y pago por QR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {event?.ticketTypes.map((tt) => {
            const isSoldOut = tt.remainingQuota <= 0;
            const currentQty = selectedQuantities[tt.id] || 0;

            return (
              <div
                key={tt.id}
                className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-2xl font-black text-white">{tt.name}</h3>
                  <p className="text-sm text-zinc-400 mt-2 min-h-[48px]">{tt.description}</p>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-4xl font-black text-white font-mono">Bs {tt.price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                    <button
                      onClick={() => handleQtyChange(tt.id, -1, tt.remainingQuota)}
                      disabled={currentQty === 0 || isSoldOut}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-zinc-800 disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-white">{currentQty}</span>
                    <button
                      onClick={() => handleQtyChange(tt.id, 1, tt.remainingQuota)}
                      disabled={currentQty >= tt.remainingQuota || isSoldOut}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-zinc-800 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalSelectedTickets > 0 && (
          <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3 sm:px-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-zinc-900/95 backdrop-blur-md border border-ted-red/50 p-3.5 sm:p-4 rounded-2xl shadow-2xl flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] sm:text-xs text-zinc-400 font-semibold">{totalSelectedTickets} pase(s) seleccionado(s)</p>
                <p className="text-lg sm:text-xl font-black text-white font-mono">Total: Bs {totalAmount.toFixed(2)}</p>
              </div>
              <Button onClick={handleProceedToCheckout} className="bg-ted-red hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-4 sm:px-5">
                Continuar
              </Button>
            </motion.div>
          </div>
        )}
      </section>

      {/* Lightbox / Modal para ver el afiche completo en alta resolución */}
      <AnimatePresence>
        {selectedFlyer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFlyer(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex items-center justify-center cursor-zoom-out"
          >
            <div
              className="relative max-w-lg max-h-[92vh] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-ted-red"></span>
                  <span className="text-sm font-bold text-white truncate">{selectedFlyer.name} — Afiche Oficial</span>
                </div>
                <button
                  onClick={() => setSelectedFlyer(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-auto p-2 bg-black flex items-center justify-center">
                <img
                  src={selectedFlyer.url}
                  alt={selectedFlyer.name}
                  className="max-h-[82vh] w-auto object-contain rounded-lg shadow-xl"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

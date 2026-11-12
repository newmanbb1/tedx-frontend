import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Award,
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
    name: 'ERICK MITA',
    role: 'Vicerrector USFX & Gestor Universitario',
    topic: 'En la universidad no solo se debe formar profesionales, sino transformar vidas y contribuir al desarrollo de la sociedad.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    quote: 'En la universidad no solo se debe formar profesionales, sino transformar vidas y contribuir al desarrollo de la sociedad',
  },
  {
    name: 'Carlos Mendoza',
    role: 'Astrofísico & Divulgador Científico',
    topic: 'De la Tierra al Cosmos: Nuevos horizontes en la exploración interplanetaria',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Ing. Sofía Alarcón',
    role: 'Fundadora de EcoSolutions',
    topic: 'Biomateriales y economía circular contra la crisis climática',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Mateo Rivas',
    role: 'Compositor & Diseñador Sonoro Inmersivo',
    topic: 'El sonido como catalizador de la empatía colectiva',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ event, onSelectTickets, onNavigate }) => {
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [speakers, setSpeakers] = useState<Array<SpeakerData | typeof DEFAULT_SPEAKERS[0]>>(DEFAULT_SPEAKERS);
  const [bgImages, setBgImages] = useState<BackgroundImageData[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

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

      {/* Orador Destacado: Erick Mita (Diseño Poster) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/5 select-none pointer-events-none">
            SPEAKER
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                alt="Erick Mita"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/80 px-4 py-1 border border-zinc-700 text-xs font-bold text-ted-red tracking-wider">
                SPEAKER TEDxUSFX 2026
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">ERICK MITA</h3>
              <p className="text-ted-red font-semibold text-sm uppercase">Vicerrector USFX & Gestor Universitario</p>
              <div className="p-4 bg-zinc-950/80 border-l-4 border-ted-red rounded-r-xl">
                <p className="italic text-zinc-300 text-sm sm:text-base font-light">
                  "En la universidad no solo se debe formar profesionales, sino transformar vidas y contribuir al desarrollo de la sociedad"
                </p>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Docente, investigador y gestor universitario, Doctor en Ciencias de la Educación. Ha desempeñado importantes cargos académicos, destacándose por su liderazgo, producción científica y compromiso con la transformación de la educación superior.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Resto de Oradores */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Otros Conferencistas Invitados
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
            Líderes que compartirán ideas transformadoras en el Teatro Gran Mariscal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {speakers.slice(1).map((speaker, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -8 }}
              className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/5] bg-zinc-950 overflow-hidden">
                <img src={speaker.imageUrl} alt={speaker.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{speaker.name}</h3>
                  <p className="text-xs text-ted-red mt-1 uppercase font-semibold">{speaker.role}</p>
                  <p className="text-sm text-zinc-400 mt-2 italic line-clamp-2">"{speaker.topic}"</p>
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
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-zinc-900/95 backdrop-blur-md border border-ted-red/50 p-4 rounded-2xl shadow-2xl flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-zinc-400 font-semibold">{totalSelectedTickets} pase(s) seleccionado(s)</p>
                <p className="text-xl font-black text-white font-mono">Total: Bs {totalAmount.toFixed(2)}</p>
              </div>
              <Button onClick={handleProceedToCheckout} className="bg-ted-red text-white font-bold">
                Continuar
              </Button>
            </motion.div>
          </div>
        )}
      </section>
    </div>
  );
};

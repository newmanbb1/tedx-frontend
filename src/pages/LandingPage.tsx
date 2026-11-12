import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Zap,
  Award,
} from 'lucide-react';
import { EventData, TicketTypeData, SpeakerData } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { api } from '../services/api.js';

interface LandingPageProps {
  event: EventData | null;
  onSelectTickets: (selection: Record<string, number>) => void;
  onNavigate?: (view: string) => void;
}

const DEFAULT_SPEAKERS = [
  {
    name: 'Dra. Elena Vega',
    role: 'Investigadora en Neurotecnología & IA',
    topic: 'La interfaz mente-máquina: El futuro de la cognición humana',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
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

const AGENDA = [
  { time: '08:30 - 09:30', title: 'Registro y Acreditación QR', desc: 'Entrega de kits de bienvenida y café de apertura' },
  { time: '09:30 - 11:30', title: 'Bloque 1: Rompiendo Paradigmas', desc: '4 charlas magistrales sobre ciencia y tecnología emergente' },
  { time: '11:30 - 12:30', title: 'Experiencias Interactivas & Networking', desc: 'Demostraciones en vivo y contacto con sponsors' },
  { time: '12:30 - 14:00', title: 'Almuerzo Libre & Actividades', desc: 'Zona gastronómica y dinámicas guiadas' },
  { time: '14:00 - 16:30', title: 'Bloque 2: El Futuro en Nuestras Manos', desc: '4 conferencias sobre impacto social, arte y sostenibilidad' },
  { time: '16:30 - 18:00', title: 'Clausura & Cóctel VIP', desc: 'Espacio exclusivo para oradores y pases VIP' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ event, onSelectTickets, onNavigate }) => {
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [speakers, setSpeakers] = useState<Array<SpeakerData | typeof DEFAULT_SPEAKERS[0]>>(DEFAULT_SPEAKERS);

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
    fetchSpeakers();
  }, []);

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

  const eventDateFormatted = event?.date
    ? new Date(event.date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '28 de Noviembre de 2026';

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(235,0,40,0.15)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-ted-red/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-ted-red uppercase tracking-widest shadow-xl">
            <Sparkles className="w-3.5 h-3.5" />
            Edición Oficial 2026 &bull; {event?.title || 'TEDx Innova'}
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08]">
            IDEAS QUE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ted-red via-red-500 to-amber-500">
              VALE LA PENA DIFUNDIR
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-zinc-300 leading-relaxed font-light">
            {event?.subtitle ||
              'Conectando mentes audaces, ciencia de frontera y las soluciones que transformarán nuestra sociedad.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs sm:text-sm text-zinc-400">
            <div className="flex items-center gap-2 bg-zinc-900/80 px-4 py-2 rounded-full border border-zinc-800">
              <Calendar className="w-4 h-4 text-ted-red" />
              <span className="capitalize">{eventDateFormatted}</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900/80 px-4 py-2 rounded-full border border-zinc-800">
              <MapPin className="w-4 h-4 text-ted-red" />
              <span>{event?.venue || 'Auditorio Mayor'}, {event?.location || 'Bolivia'}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
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
          </div>
        </div>
      </section>

      {/* Banner de Certificados Digitales */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-red-950/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-ted-red/20 border border-ted-red/40 rounded-2xl text-ted-red shrink-0">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">
                ¿Asististe o participaste en TEDx Innova?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                Ingresa tu número de Carnet (CI) para consultar y descargar tu <strong>Certificado Digital Oficial</strong> con código QR de verificación único, disponible para Asistentes acreditados, Oradores, Voluntarios y VIPs.
              </p>
            </div>
          </div>

          {onNavigate && (
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate('certificates')}
              className="bg-ted-red hover:bg-red-700 text-white shrink-0 px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2"
            >
              <span>Generar Mi Certificado</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </section>

      {/* Speakers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ted-red uppercase tracking-widest">
            <Users className="w-4 h-4" />
            Líderes de Pensamiento
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Conferencistas Magistrales
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
            Ocho oradores excepcionales compartirán sus descubrimientos, experiencias y visiones en el escenario oficial de TEDx.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {speakers.map((speaker, idx) => (
            <div
              key={idx}
              className="group bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-ted-red/50 transition-all duration-300 hover:shadow-2xl hover:shadow-ted-red/10 flex flex-col"
            >
              <div className="aspect-[4/5] relative overflow-hidden bg-zinc-950">
                <img
                  src={speaker.imageUrl}
                  alt={speaker.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-ted-red transition-colors">
                    {speaker.name}
                  </h3>
                  <p className="text-xs font-medium text-ted-red/90 mt-1 uppercase tracking-wider">
                    {speaker.role}
                  </p>
                  <p className="text-sm text-zinc-400 mt-3 italic line-clamp-3">
                    "{speaker.topic}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Agenda Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ted-red uppercase tracking-widest">
            <Clock className="w-4 h-4" />
            Cronograma Oficial
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Programa de la Jornada
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Una experiencia inmersiva de día completo diseñada para inspirar y conectar.
          </p>
        </div>

        <div className="space-y-4">
          {AGENDA.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-colors gap-4"
            >
              <div className="flex items-center gap-4">
                <span className="px-3 py-1.5 rounded-lg bg-zinc-800 text-ted-red font-mono text-xs font-bold tracking-tight">
                  {item.time}
                </span>
                <div>
                  <h4 className="text-base font-bold text-white">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-zinc-400">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tickets Section con Precios en Bolivianos (Bs) */}
      <section id="tickets" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ted-red uppercase tracking-widest">
            <Zap className="w-4 h-4" />
            Venta Oficial en Bolivianos (Bs)
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Selecciona tus Entradas
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
            Pago seguro mediante transferencia bancaria o en efectivo en puntos de acreditación. Cupos limitados por aforo oficial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {event?.ticketTypes.map((ticket: TicketTypeData) => {
            const qty = selectedQuantities[ticket.id] || 0;
            const isSoldOut = ticket.remainingQuota <= 0;

            return (
              <div
                key={ticket.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 border ${
                  qty > 0
                    ? 'bg-zinc-900/90 border-ted-red shadow-2xl shadow-ted-red/10 scale-[1.02]'
                    : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {isSoldOut && (
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase">
                    Agotado
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-black text-white">{ticket.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                      Bs {ticket.price.toFixed(2)}
                    </span>
                    <span className="ml-2 text-xs text-zinc-400">/ entrada</span>
                  </div>

                  <p className="mt-4 text-sm text-zinc-300 leading-relaxed min-h-[48px]">
                    {ticket.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-zinc-800/80 space-y-3 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-ted-red shrink-0" />
                      <span>Acceso garantizado al auditorio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-ted-red shrink-0" />
                      <span>Credencial oficial con código QR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-ted-red shrink-0" />
                      <span>Certificado digital de asistencia con QR</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-800/80">
                  {isSoldOut ? (
                    <Button disabled className="w-full" variant="secondary">
                      Cupos Agotados
                    </Button>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center bg-zinc-800 rounded-xl p-1 border border-zinc-700">
                        <button
                          onClick={() => handleQtyChange(ticket.id, -1, ticket.remainingQuota)}
                          disabled={qty === 0}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-lg font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-white text-base font-mono">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleQtyChange(ticket.id, 1, ticket.remainingQuota)}
                          disabled={qty >= ticket.remainingQuota || qty >= 10}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-lg font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <Button
                        variant={qty > 0 ? 'primary' : 'outline'}
                        className="flex-1"
                        onClick={() => {
                          if (qty === 0) handleQtyChange(ticket.id, 1, ticket.remainingQuota);
                        }}
                      >
                        {qty > 0 ? 'Seleccionado' : 'Añadir'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Floating Bottom Bar si hay tickets seleccionados */}
      {totalSelectedTickets > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 p-4 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 animate-in slide-in-from-bottom duration-300 shadow-2xl">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-zinc-400">Total a Pagar (Bolivianos)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  Bs {totalAmount.toFixed(2)}
                </span>
                <span className="text-xs text-zinc-400">
                  ({totalSelectedTickets} {totalSelectedTickets === 1 ? 'entrada' : 'entradas'})
                </span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleProceedToCheckout}
              className="w-full sm:w-auto px-8 shadow-xl shadow-ted-red/20 font-bold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continuar al Formulario y Pago
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

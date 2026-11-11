import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Zap,
} from 'lucide-react';
import { EventData, TicketTypeData } from '../types/index.js';
import { Button } from '../components/ui/Button.js';

interface LandingPageProps {
  event: EventData | null;
  onSelectTickets: (selection: Record<string, number>) => void;
}

const SPEAKERS = [
  {
    name: 'Dra. Elena Vega',
    role: 'Investigadora en Neurotecnología & IA',
    topic: 'La interfaz mente-máquina: El futuro de la cognición humana',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Carlos Mendoza',
    role: 'Astrofísico & Divulgador Científico',
    topic: 'De la Tierra al Cosmos: Nuevos horizontes en la exploración interplanetaria',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Ing. Sofía Alarcón',
    role: 'Fundadora de EcoSolutions',
    topic: 'Biomateriales y economía circular contra la crisis climática',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Mateo Rivas',
    role: 'Compositor & Diseñador Sonoro Inmersivo',
    topic: 'El sonido como catalizador de la empatía colectiva',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
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

export const LandingPage: React.FC<LandingPageProps> = ({ event, onSelectTickets }) => {
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

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
    <div className="space-y-24 pb-20">
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

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-zinc-300 font-normal leading-relaxed">
            {event?.subtitle ||
              'Ideas revolucionarias, ciencia, tecnología y el futuro de nuestra comunidad. Una jornada para transformar tu visión del mundo.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-sm text-zinc-300">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800">
              <Calendar className="w-4 h-4 text-ted-red" />
              <span>Sábado, 28 de Noviembre de 2026</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800">
              <Clock className="w-4 h-4 text-ted-red" />
              <span>09:00 AM - 18:00 PM</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800">
              <MapPin className="w-4 h-4 text-ted-red" />
              <span>{event?.location || 'Auditorio Mayor'}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#tickets" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-4 shadow-2xl shadow-ted-red/30">
                Adquirir Entradas
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <a href="#speakers" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-6 py-4">
                Conocer Oradores
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section id="speakers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ted-red uppercase tracking-widest">
            <Users className="w-4 h-4" />
            Líderes de Pensamiento
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Nuestros Conferencistas
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
            Mentes brillantes provenientes de la ciencia, la tecnología, las artes y el activismo social reunidas en un solo escenario.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {SPEAKERS.map((speaker, idx) => (
            <div
              key={idx}
              className="group bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-ted-red/50 transition-all duration-300 hover:shadow-2xl hover:shadow-ted-red/10 flex flex-col"
            >
              <div className="aspect-[4/5] relative overflow-hidden bg-zinc-950">
                <img
                  src={speaker.image}
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

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ted-red uppercase tracking-widest">
            <Clock className="w-4 h-4" />
            Cronograma
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

      <section id="tickets" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ted-red uppercase tracking-widest">
            <Zap className="w-4 h-4" />
            Venta Oficial
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Selecciona tus Entradas
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
            Pago seguro mediante transferencia bancaria con validación directa de tu comprobante. Cupos limitados por aforo oficial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {event?.ticketTypes.map((ticket: TicketTypeData) => {
            const qty = selectedQuantities[ticket.id] || 0;
            const isSoldOut = ticket.remainingQuota <= 0;
            const isLowStock = ticket.remainingQuota > 0 && ticket.remainingQuota <= 20;

            return (
              <div
                key={ticket.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 border ${
                  qty > 0
                    ? 'bg-zinc-900/90 border-ted-red shadow-2xl shadow-ted-red/10 scale-[1.02]'
                    : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {isSoldOut ? (
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase">
                    Agotado
                  </span>
                ) : isLowStock ? (
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80 animate-pulse">
                    ¡Últimos {ticket.remainingQuota} cupos!
                  </span>
                ) : null}

                <div>
                  <h3 className="text-xl font-black text-white">{ticket.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl sm:text-5xl font-black text-white">
                      ${ticket.price.toFixed(2)}
                    </span>
                    <span className="ml-2 text-xs text-zinc-400">/ boleto</span>
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
                      <span>Certificado de asistencia digital</span>
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
                        <span className="w-10 text-center font-bold text-white text-base">
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

      {totalSelectedTickets > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 p-4 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 animate-in slide-in-from-bottom duration-300 shadow-2xl">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-zinc-400">Total a Pagar</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  ${totalAmount.toFixed(2)}
                </span>
                <span className="text-xs text-zinc-400">
                  ({totalSelectedTickets} {totalSelectedTickets === 1 ? 'boleto' : 'boletos'})
                </span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleProceedToCheckout}
              className="w-full sm:w-auto px-8 shadow-xl shadow-ted-red/20"
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


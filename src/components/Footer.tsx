import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, Sparkles, ExternalLink } from "lucide-react";
import { SponsorData } from '../types/index.js';
import { api } from '../services/api.js';

export const Footer: React.FC = () => {
  const [sponsors, setSponsors] = useState<SponsorData[]>([]);

  useEffect(() => {
    api.getSponsors().then((res: { sponsors: SponsorData[] }) => setSponsors(res.sponsors)).catch(console.error);
  }, []);

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Sección de Sponsors Destacada */}
        {sponsors.length > 0 && (
          <div className="space-y-8 scroll-mt-28" id="sponsors">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ted-red/10 border border-ted-red/30 text-ted-red text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Alianzas & Patrocinadores Oficiales
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Aliados que Impulsan las Ideas
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
                Agradecemos a las empresas e instituciones que hacen posible esta edición de TEDx USFX 2026.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {sponsors.map((s) => {
                const logoSrc = s.logoUrl.includes('?') ? s.logoUrl : `${s.logoUrl}?v=2`;
                return (
                  <a
                    key={s.id}
                    href={s.websiteUrl || undefined}
                    target={s.websiteUrl ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className={`group relative flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800/80 hover:border-ted-red/60 transition-all duration-300 hover:shadow-xl hover:shadow-ted-red/10 hover:-translate-y-1 ${
                      s.websiteUrl ? 'cursor-pointer' : 'cursor-default'
                    }`}
                    title={s.websiteUrl ? `Visitar sitio de ${s.name}` : s.name}
                  >
                    {/* Contenedor del Logo con Canvas de Alto Contraste */}
                    <div className="w-full h-24 sm:h-28 rounded-xl bg-zinc-950/80 border border-zinc-800/60 p-2.5 flex items-center justify-center relative overflow-hidden group-hover:border-zinc-700/80 transition-all">
                      {/* Aura radial sutil para dar contraste a logos oscuros y transparentes */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.06)_0%,_transparent_75%)] pointer-events-none" />
                      
                      <img
                        src={logoSrc}
                        alt={s.name}
                        loading="lazy"
                        className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Metadatos del Auspiciador */}
                    <div className="w-full mt-2.5 text-center flex flex-col items-center justify-center">
                      <span
                        className="block text-xs sm:text-sm font-bold text-zinc-200 group-hover:text-white transition-colors truncate max-w-full"
                        title={s.name}
                      >
                        {s.name}
                      </span>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-ted-red/90 font-medium">
                          {s.tier || 'Oficial'}
                        </span>
                        {s.websiteUrl && (
                          <ExternalLink className="w-2.5 h-2.5 text-zinc-500 group-hover:text-ted-red transition-colors shrink-0" />
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Separador */}
        {sponsors.length > 0 && <div className="border-t border-zinc-900" />}

        {/* Info TEDx & Evento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-baseline tracking-tighter">
              <span className="text-2xl font-black text-ted-red">
                TED<span className="text-lg align-super">x</span>
              </span>
              <span className="ml-2 text-xl font-bold text-white tracking-tight">
                USFX
              </span>
            </div>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              En el espíritu de las ideas que vale la pena difundir, TEDx es un programa de eventos locales auto-organizados que reúnen a personas para compartir una experiencia similar a TED.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Evento</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-ted-red shrink-0" />
                <span>21 de Noviembre, 2026</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-ted-red shrink-0" />
                <span>Teatro Gran Mariscal, Sucre</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© 2026 TEDx USFX. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

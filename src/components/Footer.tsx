import React, { useEffect, useState } from 'react';
import { MapPin, Calendar } from "lucide-react";
import { SponsorData } from '../types/index.js';
import { api } from '../services/api.js';

export const Footer: React.FC = () => {
  const [sponsors, setSponsors] = useState<SponsorData[]>([]);

  useEffect(() => {
    api.getSponsors().then((res: { sponsors: SponsorData[] }) => setSponsors(res.sponsors)).catch(console.error);
  }, []);

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          
          {/* Sección de Sponsors */}
          <div className="space-y-4 md:col-span-4 border-t border-zinc-900 pt-8">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase text-center">Aliados y Auspiciadores</h4>
            <div className="flex flex-wrap justify-center gap-6">
              {sponsors.map((s) => (
                <a key={s.id} href={s.websiteUrl || '#'} target="_blank" rel="noreferrer" className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 hover:border-ted-red transition-all">
                  <img src={s.logoUrl} alt={s.name} className="h-10 object-contain" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© 2026 TEDx USFX. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};


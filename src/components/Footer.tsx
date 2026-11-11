import React from 'react';
import { Mail, MapPin, Calendar, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
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
                Innova
              </span>
            </div>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              En el espíritu de las ideas que vale la pena difundir, TEDx es un programa de eventos locales auto-organizados que reúnen a personas para compartir una experiencia similar a TED.
            </p>
            <p className="text-xs text-zinc-400">
              Este evento independiente TEDx es operado bajo la licencia concedida por TED Conferences LLC.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Evento</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-ted-red shrink-0" />
                <span>28 de Noviembre, 2026</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-ted-red shrink-0" />
                <span>Auditorio Mayor, Pabellón Central</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-ted-red shrink-0" />
                <span>contacto@tedxinnova.org</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Información</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>Pago 100% verificado vía transferencia</li>
              <li>Acreditación QR ágil en puerta</li>
              <li>Preguntas frecuentes</li>
              <li>Políticas de reembolso y cupos</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© 2026 TEDx Innova. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Diseñado con <Heart className="w-3.5 h-3.5 text-ted-red fill-ted-red" /> para la comunidad TEDx.
          </p>
        </div>
      </div>
    </footer>
  );
};

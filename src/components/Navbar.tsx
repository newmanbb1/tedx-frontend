import React, { useState } from 'react';
import { Ticket, Shield, Menu, X, QrCode, ShieldCheck, Users, Award } from 'lucide-react';
import { Button } from './ui/Button.js';
import { UserRole } from '../types/index.js';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user?: { name: string; role: UserRole } | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isValidator = user?.role === 'VALIDATOR' || isAdmin;
  const isVolunteer = user?.role === 'VOLUNTEER' || isAdmin;
  const isCheckin = user?.role === 'CHECKIN' || user?.role === 'STAFF' || isAdmin;

  return (
    <nav className="sticky top-0 z-40 w-full bg-ted-black/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => handleNav('landing')}
          >
            <div className="flex items-baseline tracking-tighter">
              <span className="text-3xl font-black text-ted-red group-hover:scale-105 transition-transform">
                TED<span className="text-xl align-super">x</span>
              </span>
              <span className="ml-2 text-2xl font-bold text-white tracking-tight">
                Innova
              </span>
            </div>
            <span className="hidden md:inline-block ml-3 px-2 py-0.5 text-[11px] font-semibold text-zinc-400 bg-zinc-800/80 rounded border border-zinc-700/60 uppercase tracking-widest">
              2026
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => handleNav('landing')}
              className={`text-sm font-medium transition-colors ${
                currentView === 'landing' ? 'text-ted-red' : 'text-zinc-300 hover:text-white'
              }`}
            >
              Evento
            </button>
            <button
              onClick={() => handleNav('landing-tickets')}
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Boletos
            </button>
            <button
              onClick={() => handleNav('order-lookup')}
              className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                currentView === 'order-lookup' ? 'text-ted-red' : 'text-zinc-300 hover:text-white'
              }`}
            >
              <Ticket className="w-4 h-4" />
              Consultar Mi Orden
            </button>
            <button
              onClick={() => handleNav('certificates')}
              className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                currentView === 'certificates' ? 'text-ted-red' : 'text-zinc-300 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 text-ted-red" />
              Certificados
            </button>

            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
                {isAdmin && (
                  <Button
                    size="sm"
                    variant={currentView === 'admin' ? 'primary' : 'secondary'}
                    onClick={() => handleNav('admin')}
                    leftIcon={<Shield className="w-4 h-4" />}
                  >
                    Admin
                  </Button>
                )}

                {isValidator && (
                  <Button
                    size="sm"
                    variant={currentView === 'validator' ? 'primary' : 'outline'}
                    onClick={() => handleNav('validator')}
                    leftIcon={<ShieldCheck className="w-4 h-4 text-amber-400" />}
                    className="border-zinc-700 text-xs"
                  >
                    Validaciones
                  </Button>
                )}

                {isVolunteer && (
                  <Button
                    size="sm"
                    variant={currentView === 'volunteer' ? 'primary' : 'outline'}
                    onClick={() => handleNav('volunteer')}
                    leftIcon={<Users className="w-4 h-4 text-emerald-400" />}
                    className="border-zinc-700 text-xs"
                  >
                    Voluntarios
                  </Button>
                )}

                {isCheckin && (
                  <Button
                    size="sm"
                    variant={currentView === 'checkin' ? 'primary' : 'outline'}
                    onClick={() => handleNav('checkin')}
                    leftIcon={<QrCode className="w-4 h-4" />}
                    className="border-zinc-700 text-xs"
                  >
                    Puerta
                  </Button>
                )}

                <div className="flex items-center space-x-2 pl-2">
                  <span className="text-[11px] text-zinc-400 font-mono hidden lg:inline">
                    {user.name.split(' ')[0]} ({user.role})
                  </span>
                  <button
                    onClick={onLogout}
                    className="text-xs text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    Salir
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center pl-4 border-l border-zinc-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleNav('login')}
                  leftIcon={<Shield className="w-4 h-4" />}
                >
                  Acceso Equipo
                </Button>
              </div>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white focus:outline-none"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 pt-2 pb-6 space-y-3">
          <button
            onClick={() => handleNav('landing')}
            className="block w-full text-left py-2 text-base font-medium text-zinc-200"
          >
            Inicio & Evento
          </button>
          <button
            onClick={() => handleNav('landing-tickets')}
            className="block w-full text-left py-2 text-base font-medium text-zinc-200"
          >
            Comprar Entradas
          </button>
          <button
            onClick={() => handleNav('order-lookup')}
            className="block w-full text-left py-2 text-base font-medium text-zinc-200"
          >
            Consultar Mi Orden / Subir Comprobante
          </button>
          <button
            onClick={() => handleNav('certificates')}
            className="block w-full text-left py-2 text-base font-medium text-ted-red font-semibold"
          >
            🎓 Certificados Digitales (Asistencia)
          </button>

          {user ? (
            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <p className="text-xs text-zinc-400">Sesión iniciada: {user.name} ({user.role})</p>
              {isAdmin && (
                <button
                  onClick={() => handleNav('admin')}
                  className="block w-full text-left py-2 text-base font-medium text-ted-red"
                >
                  Panel Administrativo
                </button>
              )}
              {isValidator && (
                <button
                  onClick={() => handleNav('validator')}
                  className="block w-full text-left py-2 text-base font-medium text-amber-400"
                >
                  Cola de Validadores (5 personas)
                </button>
              )}
              {isVolunteer && (
                <button
                  onClick={() => handleNav('volunteer')}
                  className="block w-full text-left py-2 text-base font-medium text-emerald-400"
                >
                  Mesa de Voluntarios (Carnet & WhatsApp)
                </button>
              )}
              {isCheckin && (
                <button
                  onClick={() => handleNav('checkin')}
                  className="block w-full text-left py-2 text-base font-medium text-blue-400"
                >
                  Escáner Puerta (Check-in)
                </button>
              )}
              <button
                onClick={onLogout}
                className="block w-full text-left py-2 text-sm text-zinc-400 hover:text-red-400"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-zinc-800">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => handleNav('login')}
              >
                Acceso Equipo TEDx
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

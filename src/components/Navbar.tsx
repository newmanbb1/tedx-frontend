import React, { useState } from 'react';
import {
  Ticket,
  Shield,
  Menu,
  X,
  QrCode,
  ShieldCheck,
  Users,
  Award,
  Home,
  Search,
  LogOut,
} from 'lucide-react';
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
                USFX
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
              className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors focus:outline-none"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Drawer Móvil Full-Screen Moderno */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-20 bottom-0 bg-zinc-950/98 backdrop-blur-2xl z-50 overflow-y-auto px-5 py-6 flex flex-col justify-between border-t border-zinc-800 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-6">
            {/* Navegación Pública */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3">
                Navegación
              </span>
              <button
                onClick={() => handleNav('landing')}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  currentView === 'landing'
                    ? 'bg-ted-red text-white shadow-lg shadow-ted-red/20'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4 shrink-0" />
                <span>Inicio & Evento TEDx</span>
              </button>

              <button
                onClick={() => handleNav('landing-tickets')}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  currentView === 'landing-tickets'
                    ? 'bg-ted-red text-white shadow-lg shadow-ted-red/20'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Ticket className="w-4 h-4 shrink-0" />
                  <span>Comprar Entradas</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  En Bs
                </span>
              </button>

              <button
                onClick={() => handleNav('order-lookup')}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  currentView === 'order-lookup'
                    ? 'bg-ted-red text-white shadow-lg shadow-ted-red/20'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Search className="w-4 h-4 shrink-0" />
                <span>Consultar Mi Orden / Comprobante</span>
              </button>

              <button
                onClick={() => handleNav('certificates')}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  currentView === 'certificates'
                    ? 'bg-ted-red text-white shadow-lg shadow-ted-red/20'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4 text-ted-red shrink-0" />
                <span>Certificados Digitales Oficiales</span>
              </button>
            </div>

            {/* Zona de Equipo / Staff */}
            {user ? (
              <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                <div className="px-3 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">Sesión Activa</span>
                    <span className="text-xs font-bold text-white">{user.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-ted-red/20 text-ted-red border border-ted-red/30">
                    {user.role}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3">
                    Herramientas de Equipo
                  </span>

                  {isAdmin && (
                    <button
                      onClick={() => handleNav('admin')}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                        currentView === 'admin'
                          ? 'bg-ted-red text-white shadow-lg shadow-ted-red/20'
                          : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-ted-red shrink-0" />
                      <span>Panel Administrativo General</span>
                    </button>
                  )}

                  {isValidator && (
                    <button
                      onClick={() => handleNav('validator')}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                        currentView === 'validator'
                          ? 'bg-amber-600 text-white'
                          : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Cola de Validadores (5 personas)</span>
                    </button>
                  )}

                  {isVolunteer && (
                    <button
                      onClick={() => handleNav('volunteer')}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                        currentView === 'volunteer'
                          ? 'bg-emerald-600 text-white'
                          : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Mesa de Voluntarios (Carnet & WhatsApp)</span>
                    </button>
                  )}

                  {isCheckin && (
                    <button
                      onClick={() => handleNav('checkin')}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                        currentView === 'checkin'
                          ? 'bg-blue-600 text-white'
                          : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Escáner Puerta (Check-in)</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-zinc-800/80">
                <Button
                  size="md"
                  variant="outline"
                  className="w-full justify-center text-sm py-3"
                  leftIcon={<Shield className="w-4 h-4" />}
                  onClick={() => handleNav('login')}
                >
                  Acceso Equipo TEDx
                </Button>
              </div>
            )}
          </div>

          {/* Botón Cerrar Sesión fijo al fondo */}
          {user && (
            <div className="pt-6 border-t border-zinc-800">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-rose-400 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

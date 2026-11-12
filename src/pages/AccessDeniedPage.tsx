import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut, ExternalLink } from 'lucide-react';
import { UserRole } from '../types/index.js';
import { Button } from '../components/ui/Button.js';

interface AccessDeniedPageProps {
  currentRole?: UserRole;
  userName?: string;
  requiredRoles: UserRole[];
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  currentRole,
  userName,
  requiredRoles,
  onNavigate,
  onLogout,
}) => {
  const getHomeViewForRole = (role?: UserRole): { view: string; label: string } => {
    switch (role) {
      case 'ADMIN':
        return { view: 'admin', label: 'Ir a mi Panel de Administración' };
      case 'VALIDATOR':
        return { view: 'validator', label: 'Ir a mi Panel de Validaciones' };
      case 'VOLUNTEER':
        return { view: 'volunteer', label: 'Ir a mi Escritorio de Voluntarios' };
      case 'STAFF':
      case 'CHECKIN':
        return { view: 'checkin', label: 'Ir a mi Puerta de Acreditación' };
      default:
        return { view: 'landing', label: 'Volver al Inicio' };
    }
  };

  const roleHome = getHomeViewForRole(currentRole);

  return (
    <div className="max-w-xl mx-auto px-4 py-20">
      <div className="bg-zinc-900/90 border border-red-900/60 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-800 flex items-center justify-center mx-auto text-ted-red shadow-lg shadow-red-950/50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-950 text-red-400 border border-red-800 uppercase tracking-widest">
            Error 403 • Acceso Denegado
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Área de Acceso Restringido
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            {userName ? (
              <span>
                Hola <strong className="text-white">{userName}</strong>, tu cuenta con rol{' '}
                <span className="font-mono text-amber-400 font-semibold">{currentRole}</span> no cuenta con
                los permisos necesarios para visualizar este panel.
              </span>
            ) : (
              <span>Tu rol no tiene los permisos suficientes para acceder a esta sección.</span>
            )}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center text-zinc-400">
            <span>Roles autorizados para este módulo:</span>
            <span className="font-mono font-bold text-emerald-400">
              {requiredRoles.join(', ')}
            </span>
          </div>
          <div className="flex justify-between items-center text-zinc-400">
            <span>Tu rol activo en el sistema:</span>
            <span className="font-mono font-bold text-amber-400">
              {currentRole || 'Sin Rol Asignado'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
          <Button
            size="md"
            variant="primary"
            onClick={() => onNavigate(roleHome.view)}
            leftIcon={<ExternalLink className="w-4 h-4" />}
          >
            {roleHome.label}
          </Button>

          <Button
            size="md"
            variant="outline"
            onClick={() => onNavigate('landing')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="border-zinc-700 text-zinc-300"
          >
            Portada
          </Button>

          <Button
            size="md"
            variant="danger"
            onClick={onLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Cambiar Cuenta
          </Button>
        </div>
      </div>
    </div>
  );
};


import React, { useEffect } from 'react';
import { UserRole } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { AccessDeniedPage } from '../../pages/AccessDeniedPage.js';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  requestedView: string;
  onRequireLogin: (intendedView: string) => void;
  onNavigate: (view: string) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  requestedView,
  onRequireLogin,
  onNavigate,
}) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      onRequireLogin(requestedView);
    }
  }, [isLoading, isAuthenticated, requestedView, onRequireLogin]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-400 space-y-3">
        <div className="w-8 h-8 border-2 border-ted-red border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
          Verificando credenciales de acceso...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // El useEffect redirigirá a la vista de login
  }

  // Si el usuario no tiene ninguno de los roles permitidos (ADMIN siempre tiene acceso a todo)
  const hasAccess = user.role === 'ADMIN' || allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      <AccessDeniedPage
        currentRole={user.role}
        userName={user.name}
        requiredRoles={allowedRoles}
        onNavigate={onNavigate}
        onLogout={logout}
      />
    );
  }

  return <>{children}</>;
};


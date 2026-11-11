import React, { useState } from 'react';
import { Lock, Mail, Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api.js';
import { Button } from '../components/ui/Button.js';
import { UserData } from '../types/index.js';

interface LoginPageProps {
  onLoginSuccess: (user: UserData) => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const data = await api.login(email, password);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const setCredentials = (role: 'admin' | 'staff') => {
    if (role === 'admin') {
      setEmail('admin@tedx.local');
      setPassword('AdminTedx2026!');
    } else {
      setEmail('staff@tedx.local');
      setPassword('StaffTedx2026!');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a la portada
      </button>

      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-ted-red border border-zinc-700">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Acceso al Panel</h1>
          <p className="text-xs text-zinc-400">
            Exclusivo para administradores del evento y staff de acreditación
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tedx.local"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-ted-red"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-ted-red"
              />
            </div>
          </div>

          <Button type="submit" size="md" isLoading={loading} className="w-full mt-2">
            Ingresar
          </Button>
        </form>

        <div className="pt-4 border-t border-zinc-800 space-y-2">
          <p className="text-[11px] text-zinc-400 text-center uppercase tracking-wider">
            Credenciales de Prueba para Desarrollo:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCredentials('admin')}
              className="py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-medium border border-zinc-700 transition-colors"
            >
              Cargar Admin
            </button>
            <button
              type="button"
              onClick={() => setCredentials('staff')}
              className="py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-medium border border-zinc-700 transition-colors"
            >
              Cargar Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


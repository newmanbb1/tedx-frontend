import { useEffect, useState, useCallback } from 'react';
import { EventData, PaymentSettingData, UserData } from './types/index.js';
import { api } from './services/api.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { LandingPage } from './pages/LandingPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderSuccessPage } from './pages/OrderSuccessPage.js';
import { TicketViewPage } from './pages/TicketViewPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { StaffCheckInPage } from './pages/StaffCheckInPage.js';
import { ValidatorDashboardPage } from './pages/ValidatorDashboardPage.js';
import { VolunteerDeskPage } from './pages/VolunteerDeskPage.js';
import { CertificatesPortalPage } from './pages/CertificatesPortalPage.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ProtectedRoute } from './components/auth/ProtectedRoute.js';

function AppContent() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [intendedView, setIntendedView] = useState<string | undefined>(undefined);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingData[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [currentOrderNumber, setCurrentOrderNumber] = useState<string>('');
  const [currentTicketCode, setCurrentTicketCode] = useState<string>('');
  const [initialCertCode, setInitialCertCode] = useState<string>('');
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ticketParam = urlParams.get('ticket');
    const verifyCertParam = urlParams.get('verifyCert') || urlParams.get('cert');

    if (ticketParam) {
      setCurrentTicketCode(ticketParam);
      setCurrentView('ticket-view');
    } else if (verifyCertParam) {
      setInitialCertCode(verifyCertParam);
      setCurrentView('certificates');
    }

    const initEvent = async () => {
      try {
        const eventRes = await api.getPublicEvent();
        setEventData(eventRes.event);
        setPaymentSettings(eventRes.paymentSettings);
      } catch (err) {
        console.error('Error cargando información pública del evento:', err);
      } finally {
        setLoadingEvent(false);
      }
    };

    initEvent();
  }, []);

  const handleNavigate = useCallback((view: string) => {
    if (view === 'landing-tickets') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById('tickets');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    if (view === 'order-lookup') {
      setCurrentView('order-success');
      return;
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRequireLogin = useCallback((requestedView: string) => {
    setIntendedView(requestedView);
    setCurrentView('login');
  }, []);

  const handleSelectTickets = (selection: Record<string, number>) => {
    setSelectedQuantities(selection);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCompleted = (orderNumber: string) => {
    setCurrentOrderNumber(orderNumber);
    setSelectedQuantities({});
    setCurrentView('order-success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewTicket = (ticketCode: string) => {
    setCurrentTicketCode(ticketCode);
    setCurrentView('ticket-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (loggedInUser: UserData, pendingView?: string) => {
    const target = pendingView || intendedView;
    setIntendedView(undefined);

    // Si había una vista solicitada previa y el usuario tiene acceso, vamos a ella
    if (target === 'admin' && loggedInUser.role === 'ADMIN') {
      setCurrentView('admin');
      return;
    }
    if (target === 'validator' && (loggedInUser.role === 'VALIDATOR' || loggedInUser.role === 'ADMIN')) {
      setCurrentView('validator');
      return;
    }
    if (target === 'volunteer' && (loggedInUser.role === 'VOLUNTEER' || loggedInUser.role === 'ADMIN')) {
      setCurrentView('volunteer');
      return;
    }
    if (target === 'checkin' && (loggedInUser.role === 'STAFF' || loggedInUser.role === 'CHECKIN' || loggedInUser.role === 'ADMIN')) {
      setCurrentView('checkin');
      return;
    }

    // Por defecto redirige al panel según su rol principal
    if (loggedInUser.role === 'ADMIN') {
      setCurrentView('admin');
    } else if (loggedInUser.role === 'VALIDATOR') {
      setCurrentView('validator');
    } else if (loggedInUser.role === 'VOLUNTEER') {
      setCurrentView('volunteer');
    } else {
      setCurrentView('checkin');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentView('landing');
  };

  if (loadingEvent || authLoading) {
    return (
      <div className="min-h-screen bg-ted-black flex flex-col items-center justify-center text-white space-y-4">
        <div className="flex items-baseline tracking-tighter">
          <span className="text-4xl font-black text-ted-red animate-pulse">
            TED<span className="text-2xl align-super">x</span>
          </span>
          <span className="ml-2 text-3xl font-bold text-white tracking-tight">
            Innova
          </span>
        </div>
        <p className="text-xs text-zinc-400 font-mono">Cargando plataforma oficial de ticketing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ted-black text-gray-100 flex flex-col">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            event={eventData}
            onSelectTickets={handleSelectTickets}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'checkout' && eventData && (
          <CheckoutPage
            event={eventData}
            paymentSettings={paymentSettings}
            selectedQuantities={selectedQuantities}
            onBack={() => handleNavigate('landing')}
            onOrderCompleted={handleOrderCompleted}
          />
        )}

        {currentView === 'order-success' && (
          <OrderSuccessPage
            initialOrderNumber={currentOrderNumber}
            onViewTicket={handleViewTicket}
            onGoHome={() => handleNavigate('landing')}
          />
        )}

        {currentView === 'ticket-view' && (
          <TicketViewPage
            ticketCode={currentTicketCode}
            onBack={() => handleNavigate(currentOrderNumber ? 'order-success' : 'landing')}
          />
        )}

        {currentView === 'certificates' && (
          <CertificatesPortalPage
            initialCode={initialCertCode}
            onGoHome={() => handleNavigate('landing')}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onBack={() => handleNavigate('landing')}
            intendedView={intendedView}
          />
        )}

        {currentView === 'admin' && (
          <ProtectedRoute
            allowedRoles={['ADMIN']}
            requestedView="admin"
            onRequireLogin={handleRequireLogin}
            onNavigate={handleNavigate}
          >
            <AdminDashboardPage />
          </ProtectedRoute>
        )}

        {currentView === 'validator' && (
          <ProtectedRoute
            allowedRoles={['ADMIN', 'VALIDATOR']}
            requestedView="validator"
            onRequireLogin={handleRequireLogin}
            onNavigate={handleNavigate}
          >
            <ValidatorDashboardPage />
          </ProtectedRoute>
        )}

        {currentView === 'volunteer' && (
          <ProtectedRoute
            allowedRoles={['ADMIN', 'VOLUNTEER']}
            requestedView="volunteer"
            onRequireLogin={handleRequireLogin}
            onNavigate={handleNavigate}
          >
            <VolunteerDeskPage event={eventData} />
          </ProtectedRoute>
        )}

        {currentView === 'checkin' && (
          <ProtectedRoute
            allowedRoles={['ADMIN', 'STAFF', 'CHECKIN']}
            requestedView="checkin"
            onRequireLogin={handleRequireLogin}
            onNavigate={handleNavigate}
          >
            <StaffCheckInPage />
          </ProtectedRoute>
        )}
      </main>

      <Footer />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

import { useEffect, useState } from 'react';
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

export function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingData[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [currentOrderNumber, setCurrentOrderNumber] = useState<string>('');
  const [currentTicketCode, setCurrentTicketCode] = useState<string>('');
  const [user, setUser] = useState<UserData | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        const [eventRes, userRes] = await Promise.allSettled([
          api.getPublicEvent(),
          api.getMe(),
        ]);

        if (eventRes.status === 'fulfilled') {
          setEventData(eventRes.value.event);
          setPaymentSettings(eventRes.value.paymentSettings);
        }

        if (userRes.status === 'fulfilled' && userRes.value?.user) {
          setUser(userRes.value.user);
        }
      } catch (err) {
        console.error('Error inicializando aplicación:', err);
      } finally {
        setLoadingInitial(false);
      }
    };

    initApp();
  }, []);

  const handleNavigate = (view: string) => {
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
  };

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

  const handleLoginSuccess = (loggedInUser: UserData) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'ADMIN') {
      setCurrentView('admin');
    } else {
      setCurrentView('checkin');
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setCurrentView('landing');
  };

  if (loadingInitial) {
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
        <p className="text-xs text-zinc-400">Cargando plataforma oficial de ticketing...</p>
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
          />
        )}

        {currentView === 'checkout' && eventData && (
          <CheckoutPage
            event={eventData}
            paymentSettings={paymentSettings}
            selectedQuantities={selectedQuantities}
            onBack={() => setCurrentView('landing')}
            onOrderCompleted={handleOrderCompleted}
          />
        )}

        {currentView === 'order-success' && (
          <OrderSuccessPage
            initialOrderNumber={currentOrderNumber}
            onViewTicket={handleViewTicket}
            onGoHome={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'ticket-view' && (
          <TicketViewPage
            ticketCode={currentTicketCode}
            onBack={() => setCurrentView(currentOrderNumber ? 'order-success' : 'landing')}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardPage />
        )}

        {currentView === 'checkin' && (
          <StaffCheckInPage />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;

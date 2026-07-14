import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Toaster } from 'sonner';

import { NavBar } from '@/components/NavBar';
import { TickerBar } from '@/components/TickerBar';
import { AuthModals } from '@/components/AuthModals';

import Home from '@/pages/Home';
import Market from '@/pages/Market';
import Dashboard from '@/pages/Dashboard';
import Deposit from '@/pages/Deposit';
import Withdraw from '@/pages/Withdraw';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Router() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      <NavBar
        onShowLogin={() => setShowLogin(true)}
        onShowRegister={() => setShowRegister(true)}
      />
      <TickerBar />
      
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/market" component={Market} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/deposit" component={Deposit} />
        <Route path="/withdraw" component={Withdraw} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>

      <AuthModals
        showLogin={showLogin}
        showRegister={showRegister}
        onCloseLogin={() => setShowLogin(false)}
        onCloseRegister={() => setShowRegister(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    </>
  );
}

function App() {
  useEffect(() => {
    // Add dark class to html element
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster theme="dark" position="bottom-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

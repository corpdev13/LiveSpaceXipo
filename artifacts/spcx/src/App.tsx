import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Toaster } from 'sonner';

import Home from '@/pages/Home';
import SignIn from '@/pages/SignIn';
import AccessPending from '@/pages/AccessPending';
import Dashboard from '@/pages/Dashboard';
import Management from '@/pages/Management';
import Support from '@/pages/Support';
import Orders from '@/pages/Orders';
import Trade from '@/pages/Trade';
import Settings from '@/pages/Settings';
import Updates from '@/pages/Updates';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/access-pending" component={AccessPending} />
      <Route path="/signin" component={SignIn} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/management" component={Management} />
      <Route path="/support" component={Support} />
      <Route path="/orders" component={Orders} />
      <Route path="/trade" component={Trade} />
      <Route path="/settings" component={Settings} />
      <Route path="/updates" component={Updates} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
      <Toaster theme="dark" position="bottom-center" />
    </QueryClientProvider>
  );
}

export default App;

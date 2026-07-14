import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, register } from '@/lib/store';
import { toast } from 'sonner';
import { Clock, ShieldCheck } from 'lucide-react';

interface AuthModalsProps {
  showLogin: boolean;
  showRegister: boolean;
  onCloseLogin: () => void;
  onCloseRegister: () => void;
  onSwitchToRegister: () => void;
  onSwitchToLogin: () => void;
}

export function AuthModals({
  showLogin,
  showRegister,
  onCloseLogin,
  onCloseRegister,
  onSwitchToRegister,
  onSwitchToLogin,
}: AuthModalsProps) {
  const [loginUsername, setLoginUsername] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerDone, setRegisterDone] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginEmail) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoginLoading(true);
    setTimeout(() => {
      try {
        const user = login(loginUsername, loginEmail);
        toast.success(`Welcome back, ${user.username}`);
        onCloseLogin();
        window.location.reload();
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Login failed';
        if (msg === 'PENDING_APPROVAL') {
          toast.warning('Your account is pending admin approval. You will be notified once approved.');
        } else if (msg === 'ACCOUNT_REJECTED') {
          toast.error('Your account application was not approved. Contact support for assistance.');
        } else {
          toast.error(msg);
        }
        setLoginLoading(false);
      }
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerUsername || !registerEmail) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      register(registerUsername, registerEmail);
      setRegisterDone(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  const handleCloseRegister = () => {
    setRegisterDone(false);
    setRegisterUsername('');
    setRegisterEmail('');
    onCloseRegister();
  };

  return (
    <>
      {/* Login Modal */}
      <Dialog open={showLogin} onOpenChange={onCloseLogin}>
        <DialogContent className="sm:max-w-md bg-[#0d0d0d] border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Access SPCX</DialogTitle>
            <DialogDescription className="text-white/50">
              Enter your registered credentials to access your account
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="login-username" className="text-white/70">Username</Label>
              <Input
                id="login-username"
                type="text"
                placeholder="Your username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-white/70">Email Address</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="your@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-primary"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={loginLoading}
                className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
              >
                {loginLoading ? 'Verifying...' : 'Sign In'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCloseLogin}
                className="border-white/10 hover:bg-white/5"
              >
                Cancel
              </Button>
            </div>

            <div className="text-center text-sm text-white/40">
              No account yet?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-primary hover:underline font-medium"
              >
                Apply for access
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog open={showRegister} onOpenChange={handleCloseRegister}>
        <DialogContent className="sm:max-w-md bg-[#0d0d0d] border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Apply for Access</DialogTitle>
            <DialogDescription className="text-white/50">
              Submit your application — admin review required before account activation
            </DialogDescription>
          </DialogHeader>

          {registerDone ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
                <Clock className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-bold">Application Submitted</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Your account request for <strong className="text-white">{registerUsername}</strong> has been received.
                An admin will review and approve your access. You will be able to log in once approved.
              </p>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary/80">
                Keep your username and email — you will need them to sign in once approved.
              </div>
              <Button
                onClick={handleCloseRegister}
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold"
              >
                Got it
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="register-username" className="text-white/70">Username</Label>
                <Input
                  id="register-username"
                  type="text"
                  placeholder="Choose a username"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-white/70">Email Address</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="your@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-primary"
                />
              </div>

              <div className="p-3 rounded-lg bg-white/3 border border-white/8 flex items-start gap-3">
                <ShieldCheck size={16} className="text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-white/50 leading-relaxed">
                  All accounts require admin approval before activation. Your dashboard will start at zero balance — fund your account after approval via crypto deposit.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                >
                  Submit Application
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseRegister}
                  className="border-white/10 hover:bg-white/5"
                >
                  Cancel
                </Button>
              </div>

              <div className="text-center text-sm text-white/40">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

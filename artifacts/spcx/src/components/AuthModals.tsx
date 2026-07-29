import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, register } from '@/lib/store';
import { toast } from 'sonner';
import { Mail, ShieldCheck } from 'lucide-react';

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
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredUsername, setRegisteredUsername] = useState('');

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
          toast.warning('Your account is under review. The company will be in touch shortly.');
        } else if (msg === 'ACCOUNT_REJECTED') {
          toast.error('Your account application was not approved. Contact support@spcx.io for assistance.');
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
      setRegisteredEmail(registerEmail);
      setRegisteredUsername(registerUsername);
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

  // Today's date formatted like an email client
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

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
        <DialogContent className="sm:max-w-lg bg-[#0d0d0d] border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Apply for Access</DialogTitle>
            <DialogDescription className="text-white/50">
              Submit your application — our team reviews all requests in due course
            </DialogDescription>
          </DialogHeader>

          {registerDone ? (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-chart-2/15 border border-chart-2/30 flex items-center justify-center shrink-0">
                  <Mail className="text-chart-2" size={20} />
                </div>
                <div>
                  <div className="font-bold text-base">Account Confirmed</div>
                  <div className="text-sm text-white/50">A welcome email has been sent to <span className="text-white">{registeredEmail}</span></div>
                </div>
              </div>

              {/* Realistic email preview */}
              <div className="rounded-xl border border-white/10 overflow-hidden text-sm">
                {/* Email header bar */}
                <div className="bg-white/5 px-4 py-3 border-b border-white/10">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-2 h-2 rounded-full bg-chart-2" />
                    <span className="text-xs font-bold text-chart-2 uppercase tracking-widest">Inbox</span>
                  </div>
                  <div className="font-bold text-white">Welcome to SPCX — Your Account is Approved</div>
                  <div className="text-xs text-white/40 mt-0.5">
                    <span className="text-white/60">From:</span> no-reply@spcx.io &nbsp;·&nbsp;
                    <span className="text-white/60">To:</span> {registeredEmail} &nbsp;·&nbsp;
                    {dateStr} at {timeStr}
                  </div>
                </div>

                {/* Email body */}
                <div className="bg-[#0a0a0a] px-5 py-5 space-y-3 text-white/70 leading-relaxed text-[13px]">
                  <p>Dear <span className="font-semibold text-white">{registeredUsername}</span>,</p>

                  <p>
                    Thank you for your interest in SPCX — the exclusive trading platform for SpaceX's
                    initial public offering on NASDAQ.
                  </p>

                  <p>
                    We are pleased to inform you that your account application has been reviewed and
                    <span className="text-chart-2 font-semibold"> approved</span>. You may now log in
                    and access your investor dashboard using the credentials you provided during registration.
                  </p>

                  <div className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 space-y-1">
                    <div className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">Your Account Details</div>
                    <div><span className="text-white/50">Username:</span> <span className="text-white font-mono">{registeredUsername}</span></div>
                    <div><span className="text-white/50">Email:</span> <span className="text-white font-mono">{registeredEmail}</span></div>
                    <div><span className="text-white/50">Account Status:</span> <span className="text-chart-2 font-semibold">Active</span></div>
                  </div>

                  <p>
                    To fund your account and begin trading, please log in and navigate to the <strong className="text-white">Deposit</strong> section.
                    We recommend using our crypto (USDC) deposit method for the fastest processing times.
                  </p>

                  <p>
                    If you have any questions or require assistance, our investor relations team is
                    available at <a href="mailto:support@spcx.io" className="text-primary hover:underline">support@spcx.io</a>.
                  </p>

                  <p className="pt-1">
                    Regards,<br />
                    <span className="text-white font-semibold">SPCX Investor Relations</span><br />
                    <span className="text-white/40 text-xs">SpaceX IPO Platform · support@spcx.io</span>
                  </p>
                </div>
              </div>

              <Button
                onClick={() => { handleCloseRegister(); onSwitchToLogin(); }}
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold"
              >
                Sign In to Your Account
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
                  All applications are reviewed by our team. The company will review your request and approve access in due time. A confirmation email will be sent to your address upon approval.
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

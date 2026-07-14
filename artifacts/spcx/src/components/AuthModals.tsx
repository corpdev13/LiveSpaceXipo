import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, register } from '@/lib/store';
import { toast } from 'sonner';

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginUsername || !loginEmail) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const user = login(loginUsername, loginEmail);
      toast.success(`Welcome back, ${user.username}!`);
      onCloseLogin();
      window.location.reload();
    } catch (error) {
      toast.error('Login failed');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerUsername || !registerEmail) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const user = register(registerUsername, registerEmail);
      toast.success(`🎉 Welcome to SPCX, ${user.username}! Your account has been created with $10,000 starting balance.`);
      onCloseRegister();
      window.location.reload();
    } catch (error) {
      toast.error('Registration failed');
    }
  };

  return (
    <>
      {/* Login Modal */}
      <Dialog open={showLogin} onOpenChange={onCloseLogin}>
        <DialogContent className="sm:max-w-md bg-card border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Access SPCX</DialogTitle>
            <DialogDescription className="text-white/60">
              Enter your credentials to access your trading account
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="login-username">Username</Label>
              <Input
                id="login-username"
                type="text"
                placeholder="demo"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="bg-input border-white/10"
                data-testid="input-login-username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="demo@spcx.io"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="bg-input border-white/10"
                data-testid="input-login-email"
              />
            </div>

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-primary">
                Demo credentials: <strong>demo</strong> / <strong>demo@spcx.io</strong>
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold"
                data-testid="button-login-submit"
              >
                Access Dashboard
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCloseLogin}
                className="border-white/20"
              >
                Cancel
              </Button>
            </div>

            <div className="text-center text-sm text-white/60">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-primary hover:underline font-medium"
              >
                Register now
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog open={showRegister} onOpenChange={onCloseRegister}>
        <DialogContent className="sm:max-w-md bg-card border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create Account</DialogTitle>
            <DialogDescription className="text-white/60">
              Join SPCX and start trading with $10,000
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleRegister} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="register-username">Username</Label>
              <Input
                id="register-username"
                type="text"
                placeholder="Choose a username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                className="bg-input border-white/10"
                data-testid="input-register-username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="your@email.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="bg-input border-white/10"
                data-testid="input-register-email"
              />
            </div>

            <div className="p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
              <p className="text-xs text-chart-2">
                New accounts receive $10,000 in trading capital
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold"
                data-testid="button-register-submit"
              >
                Create Account
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCloseRegister}
                className="border-white/20"
              >
                Cancel
              </Button>
            </div>

            <div className="text-center text-sm text-white/60">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary hover:underline font-medium"
              >
                Log in
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

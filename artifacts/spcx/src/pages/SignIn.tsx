import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ArrowLeft } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useLookupSignIn, useSignIn } from '@workspace/api-client-react';
import logoImg from '@assets/logo_1784056609292.png';

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'email' | 'password'>('email');
  const lookupSignIn = useLookupSignIn();
  const signIn = useSignIn();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: FormValues) => {
    if (step === 'email') {
      lookupSignIn.mutate({ data: { email: data.email } }, {
        onSuccess: (res) => {
          if (res.next === 'setup' && res.setupToken) {
            sessionStorage.setItem('spcx_password_setup_token', res.setupToken);
            sessionStorage.setItem('spcx_password_setup_email', res.email);
            setLocation('/setup-password');
          } else {
            setStep('password');
          }
        },
        onError: (error: any) => {
          const msg = error?.data?.error || "Failed to find your account.";
          if (error?.status === 404 || msg.toLowerCase().includes("not found")) {
            toast.error("No account found with this email. Please sign up first.");
          } else {
            toast.error(msg);
          }
        },
      });
      return;
    }

    if (!data.password) {
      toast.error("Password is required.");
      return;
    }

    signIn.mutate({ data: { email: data.email, password: data.password } }, {
      onSuccess: (res) => {
        if (res.status === 'approved') {
          localStorage.setItem('spcx_user', JSON.stringify({ email: res.email, fullName: res.fullName }));
          setLocation('/dashboard');
        } else if (res.status === 'pending') {
          setLocation('/access-pending?email=' + encodeURIComponent(res.email));
        } else if (res.status === 'rejected') {
          toast.error("Your access request was not approved.");
        }
      },
      onError: (error: any) => {
        const msg = error?.data?.error || "Failed to sign in.";
        if (error?.status === 401) {
          toast.error("The password you entered is incorrect.");
        } else {
          toast.error(msg);
        }
      },
    });
  };

  const isPending = lookupSignIn.isPending || signIn.isPending;

  return (
    <div className="min-h-[100dvh] bg-[#050a0f] text-white selection:bg-white/20 flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px]">
        <Link href="/" className="flex items-center">
          <img src={logoImg} alt="SPCX" className="h-8 sm:h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-2 text-sm sm:text-base font-medium tracking-widest text-white/50 uppercase">
          <span className="hidden sm:inline">Sign In</span>
          <User className="w-5 h-5" />
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center px-6 pt-24 pb-12 w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="w-full"
        >
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-widest mb-4">
              Investor Access
            </h1>
            <p className="text-white/60 font-light text-lg">
              {step === 'email' ? 'Enter your registered email to continue' : 'Enter your password to continue'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                autoComplete="email"
                disabled={step === 'password'}
                {...register("email")}
                className="w-full bg-black/50 border border-white/30 text-white placeholder:text-white/40 px-6 py-5 focus:outline-none focus:border-white/80 focus:bg-white/5 transition-all font-display tracking-widest text-lg uppercase disabled:opacity-50"
              />
              {errors.email && <p className="text-red-400 font-display tracking-wider text-sm mt-2">{errors.email.message}</p>}
            </div>
            {step === 'password' && (
              <div>
                <input
                  type="password"
                  placeholder="PASSWORD"
                  autoComplete="current-password"
                  autoFocus
                  {...register("password")}
                  className="w-full bg-black/50 border border-white/30 text-white placeholder:text-white/40 px-6 py-5 focus:outline-none focus:border-white/80 focus:bg-white/5 transition-all font-display tracking-widest text-lg uppercase"
                />
                {errors.password && <p className="text-red-400 font-display tracking-wider text-sm mt-2">{errors.password.message}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-white text-black font-display font-bold text-xl tracking-[0.2em] uppercase py-5 hover:bg-white/90 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {lookupSignIn.isPending ? "Checking..." : signIn.isPending ? "Authenticating..." : step === 'email' ? "Continue" : "Sign In"}
            </button>
          </form>

          {step === 'password' && (
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setValue('password', '');
              }}
              className="mt-6 mx-auto flex items-center gap-2 text-white/50 hover:text-white transition-colors uppercase font-display tracking-widest text-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Use a different email
            </button>
          )}

          <div className="mt-8 text-center">
            <Link href="/" className="text-white/50 hover:text-white transition-colors uppercase font-display tracking-widest text-sm">
              New investor? Sign up
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
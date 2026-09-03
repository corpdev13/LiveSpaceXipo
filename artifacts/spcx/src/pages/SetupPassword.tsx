import React from 'react';
import { motion } from 'framer-motion';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useSetupPassword } from '@workspace/api-client-react';
import logoImg from '@assets/logo_1784056609292.png';

const formSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function SetupPassword() {
  const [, setLocation] = useLocation();
  const setupPassword = useSetupPassword();
  const setupToken = typeof window !== 'undefined' ? sessionStorage.getItem('spcx_password_setup_token') : null;
  const email = typeof window !== 'undefined' ? sessionStorage.getItem('spcx_password_setup_email') : null;

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    if (!setupToken) {
      toast.error("This password setup session has expired. Start again from sign in.");
      setLocation('/signin');
      return;
    }

    setupPassword.mutate({ data: { token: setupToken, password: data.password } }, {
      onSuccess: () => {
        sessionStorage.removeItem('spcx_password_setup_token');
        sessionStorage.removeItem('spcx_password_setup_email');
        toast.success("Password set. Sign in to continue.");
        setLocation('/signin');
      },
      onError: (error: any) => {
        toast.error(error?.data?.error || "Unable to set your password. Please start again.");
      },
    });
  };

  return (
    <div className="min-h-[100dvh] bg-[#050a0f] text-white selection:bg-white/20 flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px]">
        <Link href="/" className="flex items-center">
          <img src={logoImg} alt="SPCX" className="h-8 sm:h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-2 text-sm sm:text-base font-medium tracking-widest text-white/50 uppercase">
          <span className="hidden sm:inline">Password Setup</span>
          <KeyRound className="w-5 h-5" />
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
              Set Up Password
            </h1>
            <p className="text-white/60 font-light text-lg">
              {email ? `Create a password for ${email}` : 'Create your investor password'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input
              type="email"
              name="email"
              autoComplete="username"
              value={email ?? ''}
              readOnly
              tabIndex={-1}
              aria-label="Investor email"
              className="sr-only"
            />
            <div>
              <input
                type="password"
                placeholder="NEW PASSWORD (8+ CHARACTERS)"
                autoComplete="new-password"
                autoFocus
                {...register("password")}
                className="w-full bg-black/50 border border-white/30 text-white placeholder:text-white/40 px-6 py-5 focus:outline-none focus:border-white/80 focus:bg-white/5 transition-all font-display tracking-widest text-lg uppercase"
              />
              {errors.password && <p className="text-red-400 font-display tracking-wider text-sm mt-2">{errors.password.message}</p>}
            </div>
            <div>
              <input
                type="password"
                placeholder="CONFIRM PASSWORD"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className="w-full bg-black/50 border border-white/30 text-white placeholder:text-white/40 px-6 py-5 focus:outline-none focus:border-white/80 focus:bg-white/5 transition-all font-display tracking-widest text-lg uppercase"
              />
              {errors.confirmPassword && <p className="text-red-400 font-display tracking-wider text-sm mt-2">{errors.confirmPassword.message}</p>}
            </div>
            <button
              type="submit"
              disabled={setupPassword.isPending}
              className="w-full bg-white text-black font-display font-bold text-xl tracking-[0.2em] uppercase py-5 hover:bg-white/90 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {setupPassword.isPending ? "Saving..." : "Set Password"}
            </button>
          </form>

          <Link href="/signin" className="mt-8 mx-auto flex w-fit items-center gap-2 text-white/50 hover:text-white transition-colors uppercase font-display tracking-widest text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { User } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useCreateInvestor } from '@workspace/api-client-react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import heroPhoto from '@assets/section-c_1785378506308.webp';
import logoImg from '@assets/logo_1784056609292.png';

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
});

type FormValues = z.infer<typeof formSchema>;

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const createInvestor = useCreateInvestor();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    createInvestor.mutate({ data }, {
      onSuccess: (resData) => {
        toast.success("Successfully registered for investor access.");
        reset();
        setLocation('/access-pending?email=' + encodeURIComponent(resData.email));
      },
      onError: (error: any) => {
        const errData = error?.data as { error?: string } | null;
        const errorMsg = errData?.error ?? "Failed to register. Please try again.";
        toast.error(errorMsg);
      }
    });
  };

  return (
    <div className="min-h-[100dvh] bg-[#050a0f] text-white selection:bg-white/20">
      {/* Sticky Dark Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px]">
        <img src={logoImg} alt="SPCX" className="h-8 sm:h-9 w-auto" />
        <Link href="/signin" className="flex items-center gap-2 text-sm sm:text-base font-medium tracking-widest hover:text-white/70 transition-colors uppercase">
          <span className="hidden sm:inline">Sign In</span>
          <User className="w-5 h-5" />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative h-[100dvh] w-full flex flex-col justify-end px-6 pb-12 sm:px-12 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroPhoto}
            alt="Starship Launch"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050a0f] via-[#050a0f]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <FadeIn>
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-bold uppercase leading-[0.9] tracking-tight">
              Investor<br/>Relations
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-4 text-lg sm:text-2xl font-light tracking-[0.2em] text-blue-50/90 uppercase">
              Now Trading · SPCX
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="flex gap-8 mt-12 font-medium tracking-[0.15em] text-sm sm:text-base">
              <a href="#prospectus" className="border-b border-white/40 pb-1 hover:border-white transition-colors uppercase">
                Prospectus
              </a>
              <a href="#announcement" className="border-b border-white/40 pb-1 hover:border-white transition-colors uppercase">
                Announcement
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Investor Signup Section */}
      <section className="py-32 px-6 sm:px-12 bg-[#050a0f]">
        <div className="max-w-2xl mx-auto w-full">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold uppercase tracking-widest leading-tight">
                Sign up for SpaceX Investor Access
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="FULL NAME"
                  {...register("fullName")}
                  className="w-full bg-black/50 border border-white/30 text-white placeholder:text-white/40 px-6 py-5 focus:outline-none focus:border-white/80 focus:bg-white/5 transition-all font-display tracking-widest text-lg sm:text-xl uppercase"
                />
                {errors.fullName && <p className="text-red-400 font-display tracking-wider text-sm mt-2">{errors.fullName.message}</p>}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  {...register("email")}
                  className="w-full bg-black/50 border border-white/30 text-white placeholder:text-white/40 px-6 py-5 focus:outline-none focus:border-white/80 focus:bg-white/5 transition-all font-display tracking-widest text-lg sm:text-xl uppercase"
                />
                {errors.email && <p className="text-red-400 font-display tracking-wider text-sm mt-2">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={createInvestor.isPending}
                className="w-full bg-white text-black font-display font-bold text-xl sm:text-2xl tracking-[0.2em] uppercase py-5 mt-4 hover:bg-white/90 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {createInvestor.isPending ? "Submitting..." : "Submit"}
              </button>
            </form>
          </FadeIn>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 sm:px-12 bg-[#050a0f] border-t border-white/10">
        <div className="max-w-4xl mx-auto w-full">
          <FadeIn>
            <div className="mb-16">
              <span className="text-white/50 text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                Investor FAQ
              </span>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-widest">
                Frequently Asked Questions
              </h2>
            </div>

            <AccordionPrimitive.Root type="single" collapsible className="w-full">
              {[
                {
                  q: "What is SPCX?",
                  a: "SPCX is the ticker symbol for SpaceX shares trading on the SPCX platform, dedicated to pre-IPO space economy equities."
                },
                {
                  q: "Who is eligible to participate?",
                  a: "Accredited investors in supported jurisdictions may participate. Verification is required before trading begins."
                },
                {
                  q: "How do I place an order?",
                  a: "After completing accredited investor verification, you may submit market or limit orders through the SPCX trading portal."
                },
                {
                  q: "When does trading begin?",
                  a: "Trading is expected to commence following regulatory clearance. Sign up above to receive launch notifications."
                },
                {
                  q: "Is my investment insured?",
                  a: "All accounts are held in segregated custody. SIPC coverage applies to eligible accounts per standard brokerage regulations."
                }
              ].map((faq, i) => (
                <AccordionPrimitive.Item key={i} value={`item-${i}`} className="border-b border-white/10 overflow-hidden">
                  <AccordionPrimitive.Header className="flex">
                    <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between py-8 font-display text-2xl sm:text-3xl tracking-widest text-left transition-all hover:text-white/80 [&[data-state=open]>svg]:rotate-180 uppercase cursor-pointer">
                      {faq.q}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        className="h-6 w-6 shrink-0 transition-transform duration-300 text-white/50"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>
                  <AccordionPrimitive.Content className="overflow-hidden text-white/60 text-lg sm:text-xl font-light leading-relaxed data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="pb-8 pt-0">{faq.a}</div>
                  </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
              ))}
            </AccordionPrimitive.Root>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 sm:px-12 border-t border-white/10 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6 text-xs sm:text-sm text-white/40 tracking-[0.15em] uppercase font-display">
        <p>© 2026 SPCX. All rights reserved.</p>
        <p>Regulatory disclosures apply.</p>
      </footer>
    </div>
  );
}

import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#050a0f] text-white px-6 text-center">
      <div className="font-display text-8xl sm:text-9xl font-bold tracking-widest mb-4">404</div>
      <p className="font-display text-xl sm:text-2xl uppercase tracking-widest text-white/60 mb-10">
        Page not found
      </p>
      <Link href="/" className="px-6 py-3 border border-white/30 font-display tracking-widest uppercase text-sm hover:bg-white/5 transition-colors">
        Return home
      </Link>
    </div>
  );
}

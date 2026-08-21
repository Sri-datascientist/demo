import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function BottomNav() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="bg-white rounded-full px-5 py-2 border border-neutral-100 flex items-center gap-5 shadow-card-complex backdrop-blur-md bg-white/95">
        <Logo size="xs" linkToHome className="h-6 sm:h-7" />

        <Link
          to="/contact"
          className="rounded-full py-1.5 px-5 text-xs tracking-wide font-medium bg-[#2D5A27] text-white hover:opacity-90 transition-opacity"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}

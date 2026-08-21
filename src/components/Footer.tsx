import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useInViewAnimation } from '../hooks/useInViewAnimation';
import { COMPANY_CONTACT } from '../lib/companyContact';
import { Logo } from './Logo';

export function Footer() {
  const { ref, isInView } = useInViewAnimation<HTMLElement>();

  return (
    <footer
      id="footer"
      ref={ref}
      className={`w-full bg-white py-16 px-6 max-w-[1200px] mx-auto transition-all duration-700 ease-out ${
        isInView ? 'animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-12 border-t border-[#051A24]/10 pt-16">
        <div className="flex flex-col items-start gap-4">
          <Logo size="lg" linkToHome className="h-11 sm:h-12" />
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium bg-[#2D5A27] text-white hover:opacity-90 transition-opacity"
          >
            Contact us
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-12 md:gap-20">
          <div className="hidden sm:block text-[#051A24]/40 mt-1">
            <ArrowUpRight className="w-6 h-6 animate-pulse" />
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#051A24]/40 mb-1">
              Navigate
            </span>
            <Link to="/products" className="text-base text-[#051A24] font-medium hover:opacity-70 transition-all duration-300">
              Products
            </Link>
            <Link to="/about" className="text-base text-[#051A24] font-medium hover:opacity-70 transition-all duration-300">
              About us
            </Link>
            <Link to="/gallery" className="text-base text-[#051A24] font-medium hover:opacity-70 transition-all duration-300">
              Gallery
            </Link>
            <Link to="/contact" className="text-base text-[#051A24] font-medium hover:opacity-70 transition-all duration-300">
              Contact us
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#051A24]/40 mb-1">Connect</span>
            <a
              href={COMPANY_CONTACT.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-[#051A24] font-medium hover:opacity-70 transition-all duration-300"
            >
              {COMPANY_CONTACT.websiteLabel}
            </a>
            <a
              href={`mailto:${COMPANY_CONTACT.email}`}
              className="text-base text-[#051A24] font-medium hover:opacity-70 transition-all duration-300"
            >
              {COMPANY_CONTACT.email}
            </a>
            <a
              href={`tel:${COMPANY_CONTACT.phoneTel}`}
              className="text-base text-[#051A24] font-medium hover:opacity-70 transition-all duration-300"
            >
              {COMPANY_CONTACT.phone}
            </a>
            <a
              href={COMPANY_CONTACT.whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-[#051A24] font-medium hover:text-[#25D366] transition-all duration-300 flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5 shrink-0 text-[#25D366]">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.13-1.347a9.96 9.96 0 004.88 1.277h.005c5.505 0 9.988-4.478 9.989-9.985C22.007 6.476 17.519 2 12.012 2zm5.72 14.184c-.245.69-1.42 1.347-1.956 1.43-.49.077-1.127.135-3.303-.767-2.782-1.15-4.55-3.98-4.69-4.167-.14-.186-1.12-1.488-1.12-2.839 0-1.35.706-2.012.957-2.274.25-.262.55-.328.73-.328.18 0 .36 0 .52.008.17.008.396-.065.62.482.23.563.78 1.905.847 2.043.067.138.113.298.02.485-.09.186-.135.3-.27.46-.135.158-.284.354-.405.474-.135.135-.277.283-.12.553.158.27.7 1.15 1.502 1.866.8 1.715 1.47 2.25 1.77 2.404.3.155.476.132.65-.067.175-.2.756-.88.956-1.18.2-.3.4-.25.67-.15.27.1.1.72 1.71 1.52.81.4 1.35.6 1.485.83.136.23.136.884-.11 1.574z" />
              </svg>
              WhatsApp
            </a>
            <a
              href={COMPANY_CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-[#051A24] font-medium hover:text-[#E1306C] transition-all duration-300 flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 shrink-0 text-[#E1306C]">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

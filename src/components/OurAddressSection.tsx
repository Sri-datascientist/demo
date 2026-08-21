import { Mail, MapPin, Phone } from 'lucide-react';
import { COMPANY_CONTACT } from '../lib/companyContact';

export function OurAddressSection({ title = 'Our Address', className = '' }: { title?: string; className?: string }) {
  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-[#2D5A27] mb-6">{title}</h2>
      <div className="space-y-0">
        <div className="flex items-start gap-4 py-5 border-b border-neutral-200/80">
          <Phone className="w-5 h-5 text-[#2D5A27] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#2D5A27] mb-1">Phone</p>
            <a href={`tel:${COMPANY_CONTACT.phoneTel}`} className="page-body hover:underline">
              {COMPANY_CONTACT.phone}
            </a>
          </div>
        </div>
        <div className="flex items-start gap-4 py-5 border-b border-neutral-200/80">
          <MapPin className="w-5 h-5 text-[#2D5A27] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#2D5A27] mb-1">Address</p>
            <p className="page-body">{COMPANY_CONTACT.address}</p>
          </div>
        </div>
        <div className="flex items-start gap-4 py-5 border-b border-neutral-200/80">
          <Mail className="w-5 h-5 text-[#2D5A27] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#2D5A27] mb-1">Email</p>
            <a href={`mailto:${COMPANY_CONTACT.email}`} className="page-body hover:underline">
              {COMPANY_CONTACT.email}
            </a>
          </div>
        </div>
        <div className="flex items-start gap-4 py-5 border-b border-neutral-200/80">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#2D5A27] shrink-0 mt-0.5">
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.13-1.347a9.96 9.96 0 004.88 1.277h.005c5.505 0 9.988-4.478 9.989-9.985C22.007 6.476 17.519 2 12.012 2zm5.72 14.184c-.245.69-1.42 1.347-1.956 1.43-.49.077-1.127.135-3.303-.767-2.782-1.15-4.55-3.98-4.69-4.167-.14-.186-1.12-1.488-1.12-2.839 0-1.35.706-2.012.957-2.274.25-.262.55-.328.73-.328.18 0 .36 0 .52.008.17.008.396-.065.62.482.23.563.78 1.905.847 2.043.067.138.113.298.02.485-.09.186-.135.3-.27.46-.135.158-.284.354-.405.474-.135.135-.277.283-.12.553.158.27.7 1.15 1.502 1.866.8 1.715 1.47 2.25 1.77 2.404.3.155.476.132.65-.067.175-.2.756-.88.956-1.18.2-.3.4-.25.67-.15.27.1.1.72 1.71 1.52.81.4 1.35.6 1.485.83.136.23.136.884-.11 1.574z" />
          </svg>
          <div>
            <p className="font-semibold text-[#2D5A27] mb-1">WhatsApp</p>
            <a href={COMPANY_CONTACT.whatsAppUrl} target="_blank" rel="noopener noreferrer" className="page-body hover:underline font-medium">
              {COMPANY_CONTACT.whatsApp} (Chat)
            </a>
          </div>
        </div>
        <div className="flex items-start gap-4 py-5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#2D5A27] shrink-0 mt-0.5">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          <div>
            <p className="font-semibold text-[#2D5A27] mb-1">Instagram</p>
            <a href={COMPANY_CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="page-body hover:underline">
              @{COMPANY_CONTACT.instagram}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

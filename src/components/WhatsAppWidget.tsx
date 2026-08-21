import { COMPANY_CONTACT } from '../lib/companyContact';

export function WhatsAppWidget() {
  return (
    <a
      href={COMPANY_CONTACT.whatsAppUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 sm:bottom-8 sm:right-8 z-50 flex items-center justify-center bg-[#25D366] text-white rounded-full p-4 shadow-xl hover:bg-[#128C7E] transition-all hover:scale-110 cursor-pointer group"
      aria-label="Chat on WhatsApp"
    >
      {/* Pulse Effect */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75 animate-ping -z-10 group-hover:opacity-0 transition-opacity"></span>

      {/* Tooltip */}
      <span className="absolute right-16 scale-0 group-hover:scale-100 transition-all origin-right bg-[#051A24] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap hidden sm:inline-block">
        Chat with us on WhatsApp
      </span>

      {/* WhatsApp Icon */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7"
      >
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.13-1.347a9.96 9.96 0 004.88 1.277h.005c5.505 0 9.988-4.478 9.989-9.985C22.007 6.476 17.519 2 12.012 2zm5.72 14.184c-.245.69-1.42 1.347-1.956 1.43-.49.077-1.127.135-3.303-.767-2.782-1.15-4.55-3.98-4.69-4.167-.14-.186-1.12-1.488-1.12-2.839 0-1.35.706-2.012.957-2.274.25-.262.55-.328.73-.328.18 0 .36 0 .52.008.17.008.396-.065.62.482.23.563.78 1.905.847 2.043.067.138.113.298.02.485-.09.186-.135.3-.27.46-.135.158-.284.354-.405.474-.135.135-.277.283-.12.553.158.27.7 1.15 1.502 1.866.8 1.715 1.47 2.25 1.77 2.404.3.155.476.132.65-.067.175-.2.756-.88.956-1.18.2-.3.4-.25.67-.15.27.1.1.72 1.71 1.52.81.4 1.35.6 1.485.83.136.23.136.884-.11 1.574z" />
      </svg>
    </a>
  );
}

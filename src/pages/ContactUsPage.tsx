import { PageHeader } from '../components/PageHeader';
import { OurAddressSection } from '../components/OurAddressSection';
import { Globe } from 'lucide-react';
import { COMPANY_CONTACT } from '../lib/companyContact';

export default function ContactUsPage() {
  return (
    <div className="pb-20 font-body">
      <PageHeader
        title="Let's Build the Future of"
        titleAccent="Agriculture Together"
        subtitle="For orders, farm visits, partnerships, or bulk enquiries, our team is here to help."
      />

      <section className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-8">
            <div>
              <h2 className="page-section-title mb-6">We'd Love to Hear From You</h2>
              <p className="page-body">
                Whether you're a farmer, enterprise, institution, investor, government organisation, or strategic partner, OyeDesi is committed to building solutions that create lasting impact.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-100 bg-[#f4f8f3] p-6 md:p-8">
              <OurAddressSection />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
                <h4 className="font-semibold text-base text-[#2D5A27] mb-2">Bulk Orders & Partnerships</h4>
                <p className="text-xs leading-relaxed text-[#273C46]/90">
                  We work with retailers, wholesalers, hospitality businesses, and distributors for premium supply and farm partnerships.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
                <h4 className="font-semibold text-base text-[#2D5A27] mb-2">Farm Visit Enquiries</h4>
                <p className="text-xs leading-relaxed text-[#273C46]/90">
                  Plan your orchard experience with customized group visits, seasonal tours, and family bookings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-2">
              <div className="w-10 h-10 rounded-full bg-[#689F38]/15 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-[#2D5A27]" />
              </div>
              <div>
                <p className="page-label text-[#273C46]/60 mb-1">Website</p>
                <a
                  href={COMPANY_CONTACT.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-[#2D5A27] font-semibold hover:underline"
                >
                  {COMPANY_CONTACT.websiteLabel}
                </a>
              </div>
            </div>
          </div>

          <form
            className="rounded-2xl border border-neutral-100 shadow-sm p-6 md:p-8 space-y-5"
            onSubmit={(e) => e.preventDefault()}
          >
            <h3 className="text-xl font-semibold text-[#2D5A27]">Send a Message</h3>
            <div>
              <label className="block page-label text-[#273C46]/60 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#689F38]/40"
              />
            </div>
            <div>
              <label className="block page-label text-[#273C46]/60 mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#689F38]/40"
              />
            </div>
            <div>
              <label className="block page-label text-[#273C46]/60 mb-2">Subject</label>
              <select
                className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#689F38]/40 bg-white"
              >
                <option>Product Enquiry</option>
                <option>Farmer Partnership</option>
                <option>AgriHub Collaboration</option>
                <option>General Enquiry</option>
              </select>
            </div>
            <div>
              <label className="block page-label text-[#273C46]/60 mb-2">Message</label>
              <textarea
                rows={4}
                placeholder="How can we help you?"
                className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#689F38]/40 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-[#2D5A27] text-white py-4 text-base font-semibold hover:opacity-90 transition-opacity"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

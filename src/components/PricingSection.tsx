import { useInViewAnimation } from '../hooks/useInViewAnimation';
import { Button } from './Button';

export function PricingSection() {
  const { ref: sectionRef, isInView } = useInViewAnimation<HTMLDivElement>();

  return (
    <section
      id="login"
      ref={sectionRef}
      className="py-16 md:py-24 px-6 w-full bg-white"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:items-end">
        <div className="w-full md:max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 - Farmer (dark) */}
          <div
            className={`flex flex-col justify-between bg-[#051A24] rounded-[40px] pl-10 pr-10 md:pr-24 pt-10 pb-10 shadow-inner text-[#F6FCFF] transition-all duration-750 ease-out ${
              isInView ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.1s', boxShadow: 'inset 0 4px 20px rgba(0, 0, 0, 0.4)' }}
          >
            <div>
              <div className="text-[22px] font-medium tracking-tight mb-2 text-[#F6FCFF]">
                Farmer Login
              </div>
              <div className="text-sm md:text-base text-[#E0EBF0]/80 leading-relaxed mb-12 whitespace-pre-line">
                Manage land, crops, and crop listings.{'\n'}
                Access your farmer dashboard on Oyedesi.
              </div>
            </div>

            <div className="mt-auto">
              <div className="mb-8">
                <span className="text-4xl font-semibold text-[#F6FCFF] font-serif">Grow & sell</span>
                <span className="block text-xs uppercase tracking-widest text-[#E0EBF0]/50 mt-1">
                  Farmer portal
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="secondary"
                  href="/login?type=farmer"
                  className="w-full sm:w-auto text-sm"
                >
                  Sign in
                </Button>
                <Button
                  variant="primary"
                  href="/signup"
                  className="w-full sm:w-auto text-sm border border-neutral-700"
                >
                  Create account
                </Button>
              </div>
            </div>
          </div>

          {/* Card 2 - User / Customer (light) */}
          <div
            className={`flex flex-col justify-between bg-white rounded-[40px] pl-10 pr-10 md:pr-24 pt-10 pb-10 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-neutral-100 text-[#051A24] transition-all duration-750 ease-out ${
              isInView ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.2s' }}
          >
            <div>
              <div className="text-[22px] font-medium tracking-tight mb-2 text-[#0D212C]">
                User Login
              </div>
              <div className="text-sm md:text-base text-[#273C46]/80 leading-relaxed mb-12 whitespace-pre-line">
                Shop farm-fresh produce and track orders.{'\n'}
                Manage your profile, wallet, and addresses.
              </div>
            </div>

            <div className="mt-auto">
              <div className="mb-8">
                <span className="text-4xl font-semibold text-[#0D212C] font-serif">Shop fresh</span>
                <span className="block text-xs uppercase tracking-widest text-[#273C46]/50 mt-1">
                  Customer portal
                </span>
              </div>

              <div>
                <Button variant="tertiary" href="/login?type=customer" className="w-full sm:w-auto text-sm">
                  Sign in
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

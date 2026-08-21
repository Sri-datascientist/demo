import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface Product {
  title: string;
  description: string;
  imageUrl: string;
}

const products: Product[] = [
  {
    title: 'Organic Inputs',
    description:
      'Production and supply of bio-manures, bio-fertilizers, bio-pesticides, and soil conditioners to restore soil fertility and reduce dependence on chemical inputs.',
    imageUrl:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Market Access',
    description:
      'Enabling seamless supply chain linkages that directly connect farmers with buyers across national and global markets.',
    imageUrl:
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Agri-value creation',
    description:
      'Setting up Primary Processing Centers (PPCs) and Secondary Processing Centers (SPCs) to improve produce quality and drive value-added product development.',
    imageUrl:
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=80',
  },
];

function TitlePill({
  title,
  isActive,
  size = 'default',
}: {
  title: string;
  isActive: boolean;
  size?: 'default' | 'large' | 'small';
}) {
  const sizeClasses =
    size === 'large'
      ? 'px-5 py-2.5 text-sm md:text-base gap-2'
      : size === 'small'
        ? 'px-3 py-1.5 text-xs gap-1.5'
        : 'px-4 py-2 text-sm gap-2';

  return (
    <div
      className={`flex items-center rounded-full border shadow-sm transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${sizeClasses} ${
        isActive
          ? 'bg-[#2D5A27] border-[#2D5A27] text-white shadow-md'
          : 'bg-white border-neutral-200 text-[#0D212C] hover:border-[#689F38]/40'
      }`}
    >
      <span className="font-medium tracking-tight whitespace-nowrap">{title}</span>
      <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
    </div>
  );
}

export function ProductsShowcase() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isActive = activeIndex !== null;
  const activeProduct = isActive ? products[activeIndex] : null;
  const inactiveItems = isActive
    ? products
        .map((product, index) => ({ product, index }))
        .filter(({ index }) => index !== activeIndex)
    : [];

  return (
    <div
      className="mt-12 md:mt-16 w-full max-w-5xl mx-auto"
      onMouseLeave={() => setActiveIndex(null)}
    >
      <div
        className={`relative transition-[min-height] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isActive ? 'min-h-[680px] md:min-h-[760px] lg:min-h-[820px]' : 'min-h-[480px] md:min-h-[560px] lg:min-h-[600px]'
        }`}
      >
        {/* ── Idle: three large equal columns ── */}
        <div
          className={`absolute inset-x-0 top-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isActive ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="flex flex-row justify-center items-start gap-6 md:gap-10 lg:gap-14">
            {products.map((product, index) => (
              <div
                key={product.title}
                className="flex flex-col items-center cursor-pointer"
                onMouseEnter={() => setActiveIndex(index)}
              >
                <TitlePill title={product.title} isActive={false} size="large" />
                <div className="mt-10 md:mt-14">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="rounded-2xl object-cover aspect-[4/5] w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px] shadow-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Active: hero + side detail + bottom thumbnails ── */}
        <div
          className={`absolute inset-x-0 top-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isActive ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-4'
          }`}
        >
          {activeProduct && (
            <div className="flex flex-col">
              {/* Hero row */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-8 lg:gap-10 xl:gap-14">
                <div
                  className="flex flex-col items-center lg:items-start shrink-0"
                  onMouseEnter={() => setActiveIndex(activeIndex!)}
                >
                  <TitlePill title={activeProduct.title} isActive={true} size="large" />
                  <div className="mt-10 md:mt-12">
                    <img
                      key={activeProduct.title}
                      src={activeProduct.imageUrl}
                      alt={activeProduct.title}
                      referrerPolicy="no-referrer"
                      className="rounded-2xl object-cover aspect-[4/5] w-[280px] sm:w-[320px] md:w-[360px] lg:w-[400px] shadow-xl ring-2 ring-[#689F38]/20 animate-fade-in-up"
                      style={{ animationDuration: '0.4s' }}
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-center lg:max-w-sm xl:max-w-md px-2 lg:px-0">
                  <div
                    key={activeProduct.title}
                    className="bg-[#689F38]/8 border border-[#689F38]/25 rounded-2xl p-6 md:p-8 shadow-sm animate-fade-in-up"
                    style={{ animationDuration: '0.4s' }}
                  >
                    <div className="w-10 h-1 rounded-full bg-[#689F38] mb-5" />
                    <h4 className="font-sans text-xl md:text-2xl font-semibold text-[#2D5A27] mb-4 leading-tight">
                      {activeProduct.title}
                    </h4>
                    <p className="font-sans text-sm md:text-base text-[#273C46]/85 leading-relaxed font-light">
                      {activeProduct.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pushed-down thumbnails */}
              <div className="mt-16 md:mt-20 lg:mt-28 flex flex-row justify-center items-start gap-10 md:gap-14 lg:gap-20">
                {inactiveItems.map(({ product, index }) => (
                  <div
                    key={product.title}
                    className="flex flex-col items-center cursor-pointer opacity-75 hover:opacity-100 transition-all duration-300"
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <TitlePill title={product.title} isActive={false} size="small" />
                    <div className="mt-6 md:mt-8">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        className="rounded-xl object-cover aspect-[4/5] w-[120px] sm:w-[140px] md:w-[170px] shadow-md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

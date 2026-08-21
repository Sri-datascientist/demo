import React from 'react';
import { Droplets, Globe, Leaf, Sprout, Zap } from 'lucide-react';
import { Logo } from './Logo';

interface Practice {
  title: string;
  description: string;
  imageUrl: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const practices: Practice[] = [
  {
    title: 'Innovation - Purpose-Driven Progress',
    description:
      'Every solution we develop is driven by real agricultural needs, ensuring technology remains practical, accessible, and results-oriented. Innovation should make farming simpler, smarter, and more rewarding. We develop practical AgriTech solutions that help farmers make informed decisions, optimise resources, and improve productivity.',
    imageUrl:
      'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=1200&q=80',
    Icon: Sprout,
  },
  {
    title: 'Sustainability at Every Step',
    description:
      'We believe productivity and environmental responsibility should go hand in hand. Our approach encourages healthier soil, efficient resource utilisation, and resilient farming systems that continue to deliver value for generations.',
    imageUrl:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    Icon: Leaf,
  },
  {
    title: 'People-Centred Growth',
    description:
      "Farmers are at the heart of agriculture. Agriculture doesn't end at harvest. Every initiative we undertake is designed to strengthen rural livelihoods, encourage entrepreneurship, and create lasting opportunities for communities.",
    imageUrl:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
    Icon: Globe,
  },
  {
    title: 'Partnerships That Create Value',
    description:
      'True agricultural progress is measured not only by yields but by livelihoods. We work collaboratively with farmers, businesses, institutions, researchers, and policymakers to develop resilient agricultural ecosystems that benefit everyone involved.',
    imageUrl:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    Icon: Droplets,
  },
];

const doubledPractices = [...practices, ...practices];

function PracticeCard({ practice }: { practice: Practice }) {
  const { title, description, imageUrl, Icon } = practice;

  return (
    <article
      className="relative mx-3 flex-shrink-0 w-[280px] sm:w-[340px] md:w-[420px] h-[280px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg border border-[#2D5A27]/10 group cursor-pointer"
    >
      <img
        src={imageUrl}
        alt={title}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#1a3d1a]/90 via-[#2D5A27]/40 to-[#2D5A27]/10 transition-opacity duration-500 group-hover:opacity-60"
      />
      <div
        className="absolute inset-0 bg-[#1a3d1a]/75 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Hover description overlay */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center p-6 md:p-10 opacity-0 translate-y-2 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none"
      >
        <p className="font-sans text-sm md:text-base text-white/95 leading-relaxed text-center font-light max-w-[90%]">
          {description}
        </p>
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full p-6 md:p-8 pointer-events-none">
        <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#689F38] shadow-md ring-4 ring-white/20 transition-transform duration-500 group-hover:scale-95">
          <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" strokeWidth={1.75} />
        </div>

        <div className="flex flex-col gap-2 transition-transform duration-500 group-hover:translate-y-1">
          <div className="w-10 h-1 rounded-full bg-[#689F38]" />
          <h3 className="font-sans text-xl md:text-2xl font-semibold text-white leading-tight tracking-tight">
            {title}
          </h3>
        </div>
      </div>
    </article>
  );
}

export function SustainablePracticesSection() {
  return (
    <section
      id="gallery"
      className="relative w-full mt-16 md:mt-20 mb-16 overflow-hidden"
    >
      {/* Header */}
      <div className="max-w-[1240px] mx-auto px-6 mb-10 md:mb-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-8">
          <div className="max-w-2xl">
            <h2 className="font-sans text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight mb-4">
              <span className="text-[#2D5A27]">Our</span> <span className="text-[#689F38]">Impact</span>
            </h2>
            <p className="text-sm sm:text-base text-[#273C46]/80 leading-relaxed">
              <strong>Creating Value Beyond the Harvest.</strong> Our impact extends far beyond agricultural production. We help build stronger rural economies, improve market accessibility, encourage responsible farming practices, support agricultural innovation, and create opportunities that contribute to sustainable social and economic development. Every project we undertake reflects our commitment to creating agriculture that is smarter, more resilient, and better prepared for tomorrow.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <Logo size="lg" className="h-10 sm:h-11 md:h-12" />
          </div>
        </div>
      </div>

      {/* Side-scrolling marquee */}
      <div id="marquee" className="w-full overflow-hidden marquee-pausable">
        <div className="animate-marquee">
          {doubledPractices.map((practice, idx) => (
            <div key={`${practice.title}-${idx}`} className="flex-shrink-0">
              <PracticeCard practice={practice} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer accent */}
      <div className="max-w-[1240px] mx-auto px-6 mt-8 flex items-center justify-between">
        <a
          href="https://www.oyedesi.co"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-[#2D5A27]/70 hover:text-[#2D5A27] transition-colors font-sans"
        >
          <Globe className="w-4 h-4" strokeWidth={1.75} />
          www.oyedesi.co
        </a>
      </div>

      {/* Bottom green wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none opacity-30">
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="w-full h-12 md:h-16"
          aria-hidden="true"
        >
          <path
            d="M0,40 C360,80 720,0 1080,40 C1260,56 1380,48 1440,40 L1440,80 L0,80 Z"
            fill="#689F38"
          />
        </svg>
      </div>
    </section>
  );
}

import { ChevronRight } from 'lucide-react';
import { useInViewAnimation } from '../hooks/useInViewAnimation';

interface ValueChainItem {
  title: string;
  description: string;
  imageUrl: string;
}

const valueChain: ValueChainItem[] = [
  {
    title: 'Input and Output',
    description:
      'Helping farmers and FPOs receive quality agricultural inputs, and market connect to their output.',
    imageUrl:
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Post Harvest',
    description:
      'Providing certifications and testing facilities to farmers as well as getting post harvest facility loans through electronic receipts.',
    imageUrl:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Processing & Aggregation',
    description:
      'Extending institutional and private financing to processors, exporters, traders against their stored grains or cotton bales.',
    imageUrl:
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Storage & Distribution',
    description:
      'Creating world-class storage and warehousing solutions for our partners to manage distribution systems across India.',
    imageUrl:
      'https://images.unsplash.com/photo-1566576721346-d4a3b3098d43?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Marketing & Consumption',
    description:
      'Offering loading, unloading, cleaning, packing, barcoding, transportation and private labeling support. Go Green helps to store, transport, pack and distribute the commodities till the first mile & last mile customers.',
    imageUrl:
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=600&q=80',
  },
];

function ValueChainRow({
  item,
  index,
  reversed,
}: {
  key?: any;
  item: ValueChainItem;
  index: number;
  reversed: boolean;
}) {
  const { ref, isInView } = useInViewAnimation<HTMLDivElement>();
  const step = String(index + 1).padStart(2, '0');

  return (
    <article
      ref={ref}
      className={`group relative transition-all duration-700 ease-out ${
        isInView ? 'animate-fade-in-up' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div
        className={`flex flex-col gap-6 md:gap-0 md:items-center ${
          reversed ? 'md:flex-row-reverse' : 'md:flex-row'
        }`}
      >
        {/* Image */}
        <div className="md:w-[42%] flex justify-center md:justify-end shrink-0">
          <div
            className={`relative ${reversed ? 'md:mr-0 md:ml-8' : 'md:ml-0 md:mr-8'}`}
          >
            <div
              className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#D4AF37]/40 to-[#2D5A27]/20 blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-500"
              aria-hidden
            />
            <div className="relative p-1 rounded-full bg-gradient-to-br from-[#E8C547] via-[#D4AF37] to-[#B8941F] shadow-lg group-hover:shadow-xl transition-shadow duration-500">
              <div className="p-1 rounded-full bg-white">
                <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden ring-1 ring-[#2D5A27]/10">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>
              </div>
            </div>
            <span
              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-[#2D5A27] text-white text-xs font-bold flex items-center justify-center shadow-md border-2 border-white"
              aria-hidden
            >
              {step}
            </span>
          </div>
        </div>

        {/* Content card */}
        <div className="md:w-[58%] flex-1 min-w-0">
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#2D5A27]/8 p-6 sm:p-7 md:p-8 shadow-card-complex transition-all duration-500 group-hover:border-[#2D5A27]/20 group-hover:shadow-[0_12px_48px_rgba(45,90,39,0.1)]">
            <div className="inline-flex items-center gap-2.5 bg-[#1B4332] text-white rounded-full pl-3 pr-5 py-2.5 mb-4 shadow-[0_4px_14px_rgba(27,67,50,0.35)]">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/15 shrink-0">
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={3} />
              </span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.12em]">
                {item.title}
              </span>
            </div>
            <p className="text-[15px] sm:text-base text-[#273C46]/80 leading-[1.75] font-light">
              {item.description}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProjectsSection() {
  const { ref: headerRef, isInView: headerInView } = useInViewAnimation<HTMLDivElement>();

  return (
    <section id="projects" className="relative overflow-hidden py-20 md:py-28">
      {/* Background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#F4F8F2] via-white to-[#FAFCF9]"
        aria-hidden
      />
      <div
        className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full bg-[#2D5A27]/[0.04] blur-3xl -translate-y-1/2 translate-x-1/3"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#8B3A2A]/[0.05] blur-3xl translate-y-1/3 -translate-x-1/4"
        aria-hidden
      />

      <div className="relative max-w-5xl mx-auto px-6">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center mb-14 md:mb-20 transition-all duration-700 ${
            headerInView ? 'animate-fade-in-up' : 'opacity-0'
          }`}
        >
          <span className="inline-block font-mono text-[11px] uppercase tracking-[0.2em] text-[#2D5A27]/70 mb-4 px-4 py-1.5 rounded-full border border-[#2D5A27]/15 bg-white/60">
            Selected Work
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-[2.75rem] font-semibold text-[#8B3A2A] leading-[1.15] max-w-3xl mx-auto">
            A one-stop solution for the Agri Value Chain
          </h2>
          <div className="mt-6 flex items-center justify-center gap-3" aria-hidden>
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
          </div>
        </div>

        {/* Timeline list */}
        <div className="relative flex flex-col gap-10 md:gap-16">
          <div
            className="hidden md:block absolute left-1/2 top-8 bottom-8 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#2D5A27]/15 to-transparent"
            aria-hidden
          />

          {valueChain.map((item, idx) => (
            <ValueChainRow
              key={item.title}
              item={item}
              index={idx}
              reversed={idx % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

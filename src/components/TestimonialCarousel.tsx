import { useState, useEffect, useRef, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useInViewAnimation } from '../hooks/useInViewAnimation';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Ramesh Kumar',
    role: 'Farmer',
    company: 'Sonipat, Haryana',
    avatar:
      'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=150',
    quote:
      'Oyedesi organic basmati and bio-manures changed our harvest. Soil is healthier, yield is up, and buyers now pay premium for our Satvik rice straight from the field.',
  },
  {
    name: 'Priya Sharma',
    role: 'FPO Coordinator',
    company: 'Amritsar FPO, Punjab',
    avatar:
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=150',
    quote:
      'Market access through Oyedesi connected our 400 farmers to national buyers. Wheat and mustard now reach mandis faster—with fair prices and no middlemen eating our margins.',
  },
  {
    name: 'Arjun Patel',
    role: 'Organic Farmer',
    company: 'Anand, Gujarat',
    avatar:
      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=150',
    quote:
      'Their cold-pressed mustard oil and natural turmeric are what our customers trust. Traceable, chemical-free produce—exactly what Satvik Krishi promises.',
  },
  {
    name: 'Lakshmi Reddy',
    role: 'Agri Entrepreneur',
    company: 'Guntur, Andhra Pradesh',
    avatar:
      'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=150',
    quote:
      'From Himalayan forest honey to organic jaggery, Oyedesi products sell because quality is real. My retail partners keep asking for more Oyedesi stock every season.',
  },
  {
    name: 'Suresh Yadav',
    role: 'Warehouse Partner',
    company: 'Kanpur Agri Hub, UP',
    avatar:
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=150',
    quote:
      'Storage and distribution support from Oyedesi kept our grains safe through monsoon. Multigrain atta and pulses move smoothly from our hub to retailers across North India.',
  },
];

const SLIDE_COUNT = testimonials.length;
const GAP_PX = 24;
const extendedTestimonials = [...testimonials, ...testimonials, ...testimonials];

export function TestimonialCarousel() {
  const { ref: sectionRef, isInView } = useInViewAnimation<HTMLDivElement>();
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(SLIDE_COUNT);
  const [slideStep, setSlideStep] = useState(451.5);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const measureStep = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const firstSlide = track.querySelector<HTMLElement>('[data-testimonial-slide]');
    if (firstSlide) {
      setSlideStep(firstSlide.offsetWidth + GAP_PX);
    }
  }, []);

  useEffect(() => {
    measureStep();
    const ro = new ResizeObserver(measureStep);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measureStep);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measureStep);
    };
  }, [measureStep]);

  const handlePrev = () => {
    setIsTransitioning(true);
    setActiveIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    setIsTransitioning(true);
    setActiveIndex((prev) => prev + 1);
  };

  // Seamless infinite loop — reset position without animation at clone boundaries
  useEffect(() => {
    if (activeIndex <= SLIDE_COUNT - 1) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setActiveIndex(SLIDE_COUNT * 2 - 1);
      }, 500);
      return () => clearTimeout(timer);
    }
    if (activeIndex >= SLIDE_COUNT * 2) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setActiveIndex(SLIDE_COUNT);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeIndex]);

  // Auto-advance every 4s (pauses on hover)
  useEffect(() => {
    if (isHovered) return;
    const id = setInterval(() => {
      setIsTransitioning(true);
      setActiveIndex((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(id);
  }, [isHovered]);

  const translateX = activeIndex * slideStep;

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="py-20 w-full overflow-hidden bg-white transition-all duration-700 ease-out"
    >
      <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div
          className={`flex-1 transition-all duration-700 ease-out ${
            isInView ? 'animate-fade-in-up' : 'opacity-0'
          }`}
          style={{ animationDelay: '0.1s' }}
        >
          <h2 className="text-[32px] md:text-[40px] lg:text-[44px] text-[#0D212C] font-semibold tracking-tight leading-[1.1]">
            What <span className="font-serif italic font-normal">farmers</span> say
          </h2>
        </div>

        <div
          className={`flex items-center gap-4 transition-all duration-700 ease-out ${
            isInView ? 'animate-fade-in-up' : 'opacity-0'
          }`}
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex gap-1 text-black">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-black text-black" />
            ))}
          </div>
          <span className="text-sm font-semibold tracking-wide uppercase text-[#0D212C] border-l border-[#0D212C]/20 pl-4">
            Farmers 5/5
          </span>
        </div>
      </div>

      <div
        className="relative px-6 select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="max-w-7xl mx-auto relative">
          <div className="overflow-hidden">
            <div
              ref={trackRef}
              className="flex gap-6"
              style={{
                transition: isTransitioning
                  ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  : 'none',
                transform: `translateX(-${translateX}px)`,
              }}
            >
              {extendedTestimonials.map((item, idx) => (
                <div
                  key={idx}
                  data-testimonial-slide
                  className="flex-shrink-0 w-[calc(100vw-48px)] md:w-[427.5px] bg-white rounded-[32px] md:rounded-[40px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-neutral-100 px-6 md:px-10 py-8 flex flex-col justify-between h-[340px] md:h-[380px]"
                >
                  <div>
                    <svg
                      className="w-8 h-8 text-[#0D212C]/10 fill-current mb-4"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M11.192 15.757c0-.962-.331-1.921-.994-2.879a15.39 15.39 0 0 1-1.63-2.903H10.1c1.55 0 2.763-1.053 2.763-2.9C12.863 5.3 11.238 4 9.066 4 6.741 4 5 5.922 5 8.749c0 4.269 2.505 7.424 5.23 8.358l.962-1.35zM18.192 15.757c0-.962-.331-1.921-.994-2.879a15.39 15.39 0 0 1-1.63-2.903H17.1c1.55 0 2.764-1.053 2.764-2.9C19.864 5.3 18.238 4 16.066 4c-2.325 0-4.066 1.922-4.066 8.749 0 4.269 2.505 7.424 5.23 8.358l.962-1.35z"
                      />
                    </svg>
                    <p className="text-base text-[#0D212C] font-normal leading-relaxed line-clamp-5">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-4 border-t border-slate-100 pt-4 mt-4">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover shadow-sm"
                    />
                    <div>
                      <div className="font-semibold text-sm text-[#0D212C]">{item.name}</div>
                      <div className="text-xs text-[#0D212C]/60 flex items-center gap-1 mt-0.5">
                        <span>→</span>
                        <span>{item.role}, {item.company}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-8 md:absolute md:top-[-80px] md:right-0 justify-end">
            <button
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="w-12 h-12 rounded-full border border-[#0D212C]/20 hover:border-[#0D212C] flex items-center justify-center bg-white text-[#0D212C] transition-all duration-300 cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next testimonial"
              className="w-12 h-12 rounded-full border border-[#0D212C]/20 hover:border-[#0D212C] flex items-center justify-center bg-white text-[#0D212C] transition-all duration-300 cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

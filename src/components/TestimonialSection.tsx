import { Quote } from 'lucide-react';
import { useInViewAnimation } from '../hooks/useInViewAnimation';
import { ProductsShowcase } from './ProductsShowcase';

export function TestimonialSection() {
  const { ref: sectionRef, isInView } = useInViewAnimation<HTMLDivElement>();

  return (
    <section 
      id="about-us"
      ref={sectionRef} 
      className="py-16 md:py-24 px-6 max-w-6xl mx-auto flex flex-col items-center text-center"
    >
      {/* Quote Icon */}
      <div 
        className={`transition-all duration-700 ease-out ${
          isInView ? 'animate-fade-in-up' : 'opacity-0'
        }`}
        style={{ animationDelay: '0.1s' }}
      >
        <Quote className="w-8 h-8 text-slate-900 rotate-180 fill-slate-900" />
      </div>

      {/* Large quote text */}
      <h2 
        className={`mt-6 text-[30px] md:text-[38px] lg:text-[42px] leading-[1.15] text-[#0D212C] font-semibold tracking-tight max-w-4xl transition-all duration-700 ease-out ${
          isInView ? 'animate-fade-in-up' : 'opacity-0'
        }`}
        style={{ animationDelay: '0.2s' }}
      >
        ‘Because meaningful impact begins long before the harvest and continues long after it reaches the market.’
      </h2>

      {/* Author/Subtitle */}
      <p 
        className={`mt-6 text-base md:text-lg text-[#273C46]/85 max-w-2xl transition-all duration-700 ease-out leading-relaxed ${
          isInView ? 'animate-fade-in-up' : 'opacity-0'
        }`}
        style={{ animationDelay: '0.3s' }}
      >
        What sets us apart is our ability to bring together technology, people, and purpose—creating solutions that are practical, scalable, and built for long-term impact.
      </p>

      {/* Our Products — three images with hover detail */}
      <div
        className={`w-full transition-all duration-700 ease-out ${
          isInView ? 'animate-fade-in-up' : 'opacity-0'
        }`}
        style={{ animationDelay: '0.4s' }}
      >
        <ProductsShowcase />
      </div>
    </section>
  );
}

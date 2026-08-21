import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { SustainablePracticesSection } from '../components/SustainablePracticesSection';
import { TestimonialSection } from '../components/TestimonialSection';
import { PricingSection } from '../components/PricingSection';
import { TestimonialCarousel } from '../components/TestimonialCarousel';
import { ProjectsSection } from '../components/ProjectsSection';
import { PartnerSection } from '../components/PartnerSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <SustainablePracticesSection />
      <TestimonialSection />
      <PricingSection />
      <TestimonialCarousel />
      <ProjectsSection />
      <PartnerSection />
      <div className="max-w-6xl mx-auto px-6 pb-16 flex flex-wrap justify-center gap-4">
        <Link
          to="/products"
          className="rounded-full px-6 py-3 text-sm font-medium bg-[#2D5A27] text-white hover:opacity-90 transition-opacity"
        >
          Explore Products
        </Link>
        <Link
          to="/about"
          className="rounded-full px-6 py-3 text-sm font-medium border border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27]/5 transition-colors"
        >
          Learn About Us
        </Link>
      </div>
    </>
  );
}

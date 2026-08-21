import { PageHeader } from '../components/PageHeader';
import { Check, ArrowRight } from 'lucide-react';
import dkJainImage from '../asset/images/DK jain.png';

const journeyMilestones = [
  'Promoting sustainable farming practices and Satvik Krishi across India.',
  'Supporting rural entrepreneurship and creating lasting community opportunities.',
  'Strengthening supply chains and developing processing infrastructure.',
  'Enabling market access and building direct connections for farmers.',
];

const values = [
  {
    title: 'Innovation',
    description: 'We embrace technology, research, and modern agricultural practices to develop practical solutions that improve productivity, efficiency, and sustainability.',
  },
  {
    title: 'Sustainability',
    description: 'Promoting responsible farming practices that preserve natural resources while supporting long-term agricultural resilience.',
  },
  {
    title: 'Integrity',
    description: 'Building trusted relationships through transparency, accountability, and ethical business practices.',
  },
  {
    title: 'Community',
    description: 'Creating meaningful partnerships that bring together farmers, businesses, institutions, and communities to achieve shared success.',
  },
  {
    title: 'Empowerment',
    description: 'Supporting people with the knowledge, opportunities, and infrastructure they need to grow with confidence.',
  },
];

const riskSafeguards = [
  {
    title: 'Credit Risk',
    description:
      'Mitigated through secured real estate assets providing collateral protection exceeding investment value.',
  },
  {
    title: 'Liquidity Risk',
    description:
      'Private placement structure; secondary transactions possible through private arrangements with legal framework support.',
  },
  {
    title: 'Operational Risk',
    description:
      'Managed by experienced leadership team with diversified operations across multiple agricultural verticals.',
  },
  {
    title: 'Interest Rate Fluctuation',
    description: 'Fixed rate ensures predictable returns.',
  },
];

export default function AboutUsPage() {
  return (
    <div className="pb-20 font-body">
      <PageHeader
        title="About"
        titleAccent="OyeDesi"
        subtitle="Inspiring the Next Era of Agriculture Through Innovation, Strategic Partnerships, Empowerment, and Lasting Impact."
      />

      <section className="max-w-6xl mx-auto px-6 mb-16 md:mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <span className="inline-block rounded-full bg-[#2D5A27] text-white text-sm font-semibold uppercase tracking-wider px-5 py-2 mb-6">
              Who We Are
            </span>
            <h2 className="page-section-title mb-6">About OyeDesi</h2>
            <div className="space-y-5 page-body">
              <p className="font-semibold text-lg text-[#2D5A27]">
                We believe agriculture deserves better.
              </p>
              <p className="italic text-[#273C46]/90">
                Better systems. Better opportunities. Better connections. Better outcomes. Because agriculture has never been only about growing crops. It is about creating livelihoods, strengthening communities, protecting natural resources, and feeding generations to come.
              </p>
              <p>
                <strong>OyeDesi AgriTech Services</strong> was founded with a simple belief: Agriculture deserves an ecosystem that works as hard as the people who sustain it.
              </p>
              <p>
                Our purpose is to build an integrated agricultural ecosystem where innovation and tradition work together, empowering farmers, strengthening rural communities, and delivering sustainable solutions that create long-term value.
              </p>
              <p>
                Our work extends far beyond farming. We integrate advanced agricultural technologies, sustainable cultivation practices (Satvik Krishi), processing infrastructure, supply chain solutions, market linkages, and rural entrepreneurship to create long-term value for farmers, businesses, institutions, and communities.
              </p>
              <p>
                As agriculture continues to evolve, so do we. Through innovation, strategic partnerships, and a commitment to responsible growth, we are helping shape a future where farming is smarter, rural communities are stronger, and opportunities reach every stakeholder across the agricultural network.
              </p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-[4/3] bg-neutral-100 lg:sticky lg:top-24">
            <img
              src={dkJainImage}
              alt="OyeDesi Team"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mb-16 md:mb-24">
        <h2 className="page-section-title mb-10">Vision & Mission</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-[#689F38]/25 bg-[#689F38]/5 p-7 md:p-9">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2D5A27] bg-white px-5 py-2.5 mb-6">
              <ArrowRight className="w-4 h-4 text-[#689F38]" />
              <span className="text-base font-semibold text-[#2D5A27]">Our Vision</span>
            </div>
            <p className="page-body leading-relaxed">
              To inspire and lead the next era of agriculture by creating an integrated ecosystem where innovation empowers farmers, regenerative practices restore nature, technology transforms food systems, and sustainable enterprises generate shared prosperity. We envision a future where agriculture becomes a powerful force for economic growth, environmental stewardship, rural transformation, and global well-being—building a resilient, climate-smart, and nature-positive world for generations to come.
            </p>
          </div>
          <div className="rounded-2xl border border-[#689F38]/25 bg-[#689F38]/5 p-7 md:p-9">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2D5A27] bg-white px-5 py-2.5 mb-6">
              <ArrowRight className="w-4 h-4 text-[#689F38]" />
              <span className="text-base font-semibold text-[#2D5A27]">Our Mission</span>
            </div>
            <p className="page-body leading-relaxed">
              To inspire the next era of agriculture by building an integrated Agri-Bio Innovation Ecosystem that connects farmers, technology, research, processing, renewable bio-energy, functional foods, rural enterprises, and global markets into one sustainable platform.
            </p>
            <p className="page-body leading-relaxed mt-4">
              We are committed to advancing regenerative agriculture, restoring soil health, conserving natural resources, promoting climate-smart farming, empowering rural communities, enabling farmer entrepreneurship, and delivering nutrient-rich, traceable, and responsibly produced food. Through innovation, strategic partnerships, and purpose-driven leadership, we aim to create lasting economic, environmental, and social impact while contributing to a resilient, nature-positive, and net-zero future.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mb-16 md:mb-24">
        <h2 className="page-section-title mb-6">Our Journey</h2>
        <p className="page-label mb-8">Growing with Purpose. Evolving with Innovation.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          <p className="page-body text-lg">
            Our journey began with a simple question: <strong>How can agriculture become more sustainable, connected, and future-ready?</strong> The answer was never a single product or service. It was the creation of an integrated ecosystem that brings together innovation, infrastructure, knowledge, and collaboration.
          </p>
          <p className="page-body text-lg">
            Today, OyeDesi continues to expand its capabilities through research, technology, strategic partnerships, and community-driven initiatives—building an ecosystem that supports farmers, businesses, and society alike.
          </p>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {journeyMilestones.map((item) => (
            <li
              key={item}
              className="flex gap-4 items-start rounded-xl border border-neutral-100 bg-white p-6 shadow-sm"
            >
              <Check className="w-6 h-6 text-[#689F38] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <span className="page-body">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-6xl mx-auto px-6 mb-16 md:mb-24">
        <h2 className="page-section-title mb-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((val) => (
            <div key={val.title} className="rounded-2xl border border-[#2D5A27]/20 p-6 bg-white shadow-sm hover:border-[#2D5A27]/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-[#2D5A27] text-white p-2">
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-semibold text-[#2D5A27]">{val.title}</h3>
              </div>
              <p className="text-sm text-[#273C46]/95 leading-relaxed">{val.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mb-16 md:mb-24">
        <h2 className="page-section-title mb-6">Why We Exist</h2>
        <div className="rounded-2xl border border-[#2D5A27]/25 bg-[#f4f8f3] p-8 md:p-10 text-center">
          <p className="text-xl md:text-2xl text-[#2D5A27] font-semibold mb-6 max-w-4xl mx-auto leading-relaxed">
            "At OyeDesi, we believe agriculture deserves solutions that look beyond today's challenges and prepare for tomorrow's opportunities."
          </p>
          <p className="page-body text-[#273C46]/85 max-w-2xl mx-auto mb-8">
            Our work is driven by a simple but powerful purpose—to create an agricultural ecosystem where innovation empowers farmers, sustainability protects resources, businesses thrive responsibly, and communities grow stronger together.
          </p>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#689F38]">
            Because the future of agriculture isn't built by one organisation alone.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mb-16 md:mb-24 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-[#0D212C] font-semibold mb-4">
          Growing trust, opportunity, and lasting impact
        </h2>
        <p className="page-body max-w-2xl mx-auto">
          Growing agriculture is important. Growing trust, opportunity, and lasting impact is what truly defines progress. At OyeDesi AgriTech Services, we're proud to be building both.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-[#7B2D3B] mb-2 tracking-tight">
          Risk Management & Safeguards
        </h2>
        <p className="page-label mb-8 text-[#7B2D3B]/70">How we protect</p>
        <div className="flex flex-col gap-6">
          {riskSafeguards.map((item) => (
            <div
              key={item.title}
              className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10 rounded-2xl bg-[#7B2D3B]/90 text-white p-7 md:p-9"
            >
              <h3 className="text-xl font-semibold md:w-52 shrink-0">{item.title}</h3>
              <p className="text-base md:text-lg text-white/95 leading-relaxed flex-1">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

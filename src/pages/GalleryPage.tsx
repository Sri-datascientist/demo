import { PageHeader } from '../components/PageHeader';

const galleryImages = [
  {
    title: 'Satvik Fields',
    imageUrl:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Fresh Harvest',
    imageUrl:
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Golden Wheat',
    imageUrl:
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Greenhouse Farming',
    imageUrl:
      'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Sunrise Fields',
    imageUrl:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Organic Vegetables',
    imageUrl:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Farm Partnership',
    imageUrl:
      'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Agri Warehouse',
    imageUrl:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Rural Entrepreneurs',
    imageUrl:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function GalleryPage() {
  return (
    <div className="pb-20 font-body">
      <PageHeader
        title="Our"
        titleAccent="Gallery"
        subtitle="A glimpse into Satvik Krishi—our farms, farmers, facilities, and the journey from soil to shelf."
      />

      <section className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {galleryImages.map((item, idx) => (
            <figure
              key={`${item.title}-${idx}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
              />
              <figcaption
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a3d1a]/90 to-transparent p-4 pt-12"
              >
                <span className="text-white text-base font-semibold">{item.title}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}

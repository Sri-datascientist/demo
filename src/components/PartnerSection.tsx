import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useInViewAnimation } from '../hooks/useInViewAnimation';

interface SpawnedGif {
  id: number;
  x: number;
  y: number;
  src: string;
  rotation: number;
}

const marqueeGifs = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=400&q=80"
];

export function PartnerSection() {
  const { ref: sectionRef, isInView } = useInViewAnimation<HTMLDivElement>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [spawns, setSpawns] = useState<SpawnedGif[]>([]);
  const spawnIdCounter = useRef(0);
  const lastSpawnTime = useRef(0);
  const gifIndex = useRef(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const now = Date.now();
    // Minimum 80ms spacing between spawns to avoid visual clutter
    if (now - lastSpawnTime.current < 80) return;
    lastSpawnTime.current = now;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const currentGif = marqueeGifs[gifIndex.current];
    gifIndex.current = (gifIndex.current + 1) % marqueeGifs.length;

    const rotation = Math.random() * 20 - 10; // -10 to +10 degrees
    const id = spawnIdCounter.current++;

    setSpawns((prev) => [...prev, { id, x, y, src: currentGif, rotation }]);

    // Remove the spawn after 1000ms
    setTimeout(() => {
      setSpawns((prev) => prev.filter((item) => item.id !== id));
    }, 1000);
  };

  return (
    <section 
      id="contact-us"
      ref={sectionRef} 
      className="py-16 px-6 w-full bg-white relative flex justify-center"
    >
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className={`w-full max-w-7xl py-36 md:py-48 rounded-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-neutral-100 bg-[#FFFFFF] relative overflow-hidden flex flex-col items-center justify-center text-center cursor-crosshair transition-all duration-750 ease-out ${
          isInView ? 'animate-fade-in-up' : 'opacity-0'
        }`}
      >
        {/* GIF particle spawn layer */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {spawns.map((spawn) => (
            <div
              key={spawn.id}
              className="absolute animate-gif-spawn w-32 h-20 sm:w-48 sm:h-32 rounded-lg overflow-hidden shadow-lg border border-white/50 bg-[#051A24]/10"
              style={{
                left: `${spawn.x}px`,
                top: `${spawn.y}px`,
                '--rot': `${spawn.rotation}deg`,
              } as any}
            >
              <img
                src={spawn.src}
                alt="thumbnail particle"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Inner Content */}
        <div className="relative z-20 flex flex-col items-center px-4 max-w-3xl">
          <h2 
            className="font-serif text-[44px] sm:text-[56px] md:text-[68px] lg:text-[80px] font-semibold text-[#0D212C] leading-none tracking-tight mb-12"
          >
            Partner with us
          </h2>

          <Link
            to="/contact"
            className="inline-flex items-center gap-4 bg-[#2D5A27] text-white rounded-full px-8 py-4 shadow-btn-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <span className="font-semibold text-sm tracking-wide font-sans">
              Get in touch with Oyedesi
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

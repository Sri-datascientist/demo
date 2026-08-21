import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import heroVideo from '../asset/images/Oyedesi.mp4';

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = videoContainerRef.current;
    if (!video || !container) return;

    let animId: number;

    const monitorVideo = () => {
      if (video && video.duration) {
        const current = video.currentTime;
        const dur = video.duration;
        let opacity = 1;

        if (current < 0.5) {
          opacity = current / 0.5;
        } else if (current > dur - 0.5) {
          opacity = Math.max(0, (dur - current) / 0.5);
        }

        container.style.opacity = opacity.toString();
      }
      animId = requestAnimationFrame(monitorVideo);
    };

    animId = requestAnimationFrame(monitorVideo);

    const handleEnded = () => {
      container.style.opacity = '0';
      setTimeout(() => {
        if (video) {
          video.currentTime = 0;
          video.play().catch((err) => {
            console.warn('Video failed to play after loop reset:', err);
          });
        }
      }, 100);
    };

    video.addEventListener('ended', handleEnded);
    video.play().catch(() => {});

    return () => {
      cancelAnimationFrame(animId);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className="relative min-h-[85vh] w-full overflow-hidden bg-white flex flex-col justify-center selection:bg-neutral-900 selection:text-white">
      <div
        ref={videoContainerRef}
        className="absolute inset-0 z-0 transition-opacity duration-300 ease-out pointer-events-none"
        style={{ opacity: 0 }}
      >
        <video
          ref={videoRef}
          src={heroVideo}
          muted
          playsInline
          autoPlay
          preload="auto"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 90% 70% at 50% 42%, rgba(10, 24, 10, 0.38) 0%, rgba(10, 24, 10, 0.12) 50%, transparent 75%),
              linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, transparent 10%, transparent 72%, rgba(255,255,255,0.95) 100%)
            `,
          }}
        />
      </div>

      <section
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 md:py-28 w-full"
      >
        <div className="hero-content-panel max-w-6xl w-full mx-auto flex flex-col items-center">
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[0.95] tracking-[-2.46px] font-display text-[#0D1F0A] animate-fade-rise">
            Natural farming for a{' '}
            <span className="italic text-[#3D7A35]">sustainable</span> Bharat.
          </h2>

          <p className="font-body text-base sm:text-lg text-[#1a3320]/85 max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
            Oyedesi empowers farmers with Satvik Krishi—connecting soil health, market access, and
            value-added agriculture across India&apos;s agri value chain.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-12 animate-fade-rise-delay-2">
            <Link
              to="/products"
              className="font-body rounded-full px-10 py-4 text-base font-semibold bg-[#2D5A27] text-white hover:bg-[#244a20] active:scale-[0.98] transition-all duration-300 shadow-[0_8px_28px_rgba(45,90,39,0.45)]"
            >
              View Products
            </Link>
            <Link
              to="/about"
              className="font-body rounded-full px-10 py-4 text-base font-semibold bg-white text-[#2D5A27] border-2 border-[#2D5A27] hover:bg-[#2D5A27]/5 active:scale-[0.98] transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            >
              About us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

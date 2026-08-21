import { useEffect, useRef, useState } from 'react';

export function useInViewAnimation<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const current = ref.current;
    if (!current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(current);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(current);

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, []);

  return { ref, isInView };
}

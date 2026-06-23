import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lenisInstance } from '../utils/lenis';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const scrollToElement = (element: HTMLElement) => {
      const offsetTop = element.offsetTop - 100;

      if (lenisInstance) lenisInstance.stop();

      window.scrollTo({ top: offsetTop, behavior: 'instant' });
      ScrollTrigger.refresh();

      if (lenisInstance) {
        timeoutId = setTimeout(() => {
          if (lenisInstance) {
            lenisInstance.start();
            lenisInstance.scrollTo(offsetTop, { immediate: true });
          }
        }, 500);
      }
    };

    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);

      if (element) {
        scrollToElement(element);
      } else {
        let observer: IntersectionObserver | undefined;
        let fallbackTimeout: ReturnType<typeof setTimeout> | undefined;
        let checkInterval: ReturnType<typeof setInterval> | undefined;

        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                scrollToElement(entry.target as HTMLElement);
                observer?.disconnect();
                if (fallbackTimeout) clearTimeout(fallbackTimeout);
                if (checkInterval) clearInterval(checkInterval);
              }
            });
          },
          { threshold: 0.1 },
        );

        fallbackTimeout = setTimeout(() => {
          const el = document.getElementById(id);
          if (el) scrollToElement(el);
          observer?.disconnect();
          if (checkInterval) clearInterval(checkInterval);
        }, 2000);

        checkInterval = setInterval(() => {
          const targetElement = document.getElementById(id);
          if (targetElement) {
            observer?.observe(targetElement);
            clearInterval(checkInterval);
          }
        }, 100);

        return () => {
          if (timeoutId) clearTimeout(timeoutId);
          clearTimeout(fallbackTimeout);
          clearInterval(checkInterval);
          observer?.disconnect();
        };
      }
    } else {
      if (lenisInstance) {
        lenisInstance.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;

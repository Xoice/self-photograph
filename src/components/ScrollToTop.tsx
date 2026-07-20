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
    let rafId: number;

    const scrollToElement = (element: HTMLElement) => {
      const offsetTop = element.offsetTop - (window.innerWidth >= 900 ? 80 : 60);

      if (lenisInstance) lenisInstance.stop();

      window.scrollTo({ top: offsetTop, behavior: 'instant' });
      ScrollTrigger.refresh();

      if (lenisInstance) {
        timeoutId = setTimeout(() => {
          if (lenisInstance) {
            lenisInstance.start();
            lenisInstance.scrollTo(offsetTop, { immediate: true });
          }
          window.history.replaceState(null, '', window.location.pathname);
        }, 500);
      } else {
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    if (hash) {
      const id = hash.replace('#', '');
      const startTime = Date.now();
      const MAX_WAIT = 2000;

      const tryScroll = () => {
        const element = document.getElementById(id);
        if (element) {
          scrollToElement(element);
          return;
        }
        if (Date.now() - startTime < MAX_WAIT) {
          rafId = requestAnimationFrame(tryScroll);
        }
      };
      tryScroll();
    } else {
      if (lenisInstance) {
        lenisInstance.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;

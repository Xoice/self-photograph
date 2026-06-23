import { useNavigate, useLocation } from 'react-router-dom';
import { lenisInstance } from './lenis';

const getScrollOffset = () => (window.innerWidth >= 900 ? 80 : 60);

const scrollToElement = (element: HTMLElement) => {
  if (lenisInstance) {
    lenisInstance.stop();
  }
  element.scrollIntoView({ behavior: 'instant' });
  if (lenisInstance) {
    const lenis = lenisInstance;
    setTimeout(() => {
      lenis.start();
      lenis.scrollTo(element.offsetTop - getScrollOffset(), { immediate: true });
    }, 100);
  }
};

export const handleNavigation = (targetId: string, navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) => {
  const hash = `#${targetId}`;

  if (location.pathname === '/') {
    window.history.pushState(null, '', hash);
    const element = document.getElementById(targetId);
    if (element) scrollToElement(element);
  } else {
    navigate(`/${hash}`);
  }
};

export const handleHashScroll = (hash: string) => {
  if (!hash) return;
  const targetId = hash.replace('#', '');
  const element = document.getElementById(targetId);
  if (element) scrollToElement(element);
};

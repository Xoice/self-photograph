import Lenis from 'lenis';

export let lenisInstance: Lenis | null = null;

export const setLenisInstance = (lenis: Lenis) => {
  lenisInstance = lenis;
};

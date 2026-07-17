import { Box, Typography, Stack } from '@mui/material';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { lazy, Suspense, useRef, useState, useEffect } from 'react';
import { useSiteConfig } from '@/hooks/useSiteConfig';

const HeroCanvas = lazy(() => import('../../../components/three/HeroCanvas'));

// Three.js 加载完成前的纯 CSS fallback 背景
const HeroFallback = () => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse at 50% 40%, #0a0a0a 0%, #050505 70%)',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(204,255,0,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.5,
      },
    }}
  />
);

const HeroSection = () => {
  const containerRef = useRef(null);
  const [canvasVisible, setCanvasVisible] = useState(true);
  const { data: config } = useSiteConfig();

  const titleParts = config?.heroTitle?.split(' ') || ['XOICE', 'PHOTOGRAPH'];
  const subtitle = config?.heroSubtitle || 'Capturing the soul of the county & stars.';

  // 滚出视口后暂停 R3F 渲染循环，省 CPU
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCanvasVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from('.hero-title span', {
      y: 100,
      opacity: 0,
      duration: 1.5,
      stagger: 0.2,
      ease: 'power4.out',
    }).from('.hero-subtitle', {
      y: 20,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
    }, '-=1');
  }, { scope: containerRef });

  return (
    <Box
      ref={containerRef}
      component="section"
      id="hero"
      sx={{ height: '100vh', width: '100%', position: 'relative', overflow: 'hidden', scrollMarginTop: '100px' }}
    >
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Suspense fallback={<HeroFallback />}>
          <HeroCanvas visible={canvasVisible} />
        </Suspense>
      </Box>

      <Stack
        justifyContent="center"
        alignItems="center"
        sx={{ height: '100%', position: 'relative', zIndex: 10, mixBlendMode: 'exclusion', pointerEvents: 'none' }}
      >
        <Typography variant="h1" className="hero-title" sx={{ textAlign: 'center', fontSize: { xs: '15vw', md: '12vw' }, lineHeight: 0.85 }}>
          {titleParts.map((part, idx) => (
            <Box key={idx} component="span" sx={{ display: 'block' }}>{part}</Box>
          ))}
        </Typography>
        <Typography className="hero-subtitle" sx={{ mt: 4, letterSpacing: '0.2em', color: 'primary.main', textTransform: 'uppercase' }}>
          {subtitle}
        </Typography>
      </Stack>
    </Box>
  );
};

export default HeroSection;

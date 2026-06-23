import { Canvas } from '@react-three/fiber';
import { Box, Typography, Stack } from '@mui/material';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import HeroParticles from '../../../components/three/HeroParticles';
import { useSiteConfig } from '@/hooks/useSiteConfig';

const HeroSection = () => {
  const containerRef = useRef(null);
  const { data: config } = useSiteConfig();

  const titleParts = config?.heroTitle?.split(' ') || ['XOICE', 'PHOTOGRAPH'];
  const subtitle = config?.heroSubtitle || 'Capturing the soul of the county & stars.';

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
        <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
          <color attach="background" args={['#050505']} />
          <fog attach="fog" args={['#050505', 10, 50]} />
          <HeroParticles />
        </Canvas>
      </Box>

      <Stack
        justifyContent="center"
        alignItems="center"
        sx={{ height: '100%', position: 'relative', zIndex: 10, mixBlendMode: 'exclusion' }}
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

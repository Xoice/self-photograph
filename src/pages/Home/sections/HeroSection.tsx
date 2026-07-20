import { Box, Typography, Stack } from '@mui/material';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { lazy, Suspense, useRef, useState, useEffect } from 'react';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useGalleryWorks } from '@/hooks/useGalleryWorks';

const HeroCanvas = lazy(() => import('../../../components/three/HeroCanvas'));

// Three.js 加载完成前的纯 CSS fallback 背景
const HeroFallback = () => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse at 50% 50%, #030310 0%, #010104 70%)',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.5,
      },
    }}
  />
);

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasVisible, setCanvasVisible] = useState(true);
  const { data: config } = useSiteConfig();
  const { data: galleryData } = useGalleryWorks({ featured: true, pageSize: 1 });
  const heroImage = galleryData?.items?.[0]?.coverImage;

  const titleParts = config?.heroTitle?.trim().split(/\s+/) ?? [];
  const subtitle = config?.heroSubtitle?.trim() ?? '';

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

  // 文字 3D 视差：入场动画完成后启用，幅度小不影响可读性
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let xToTitle: ReturnType<typeof gsap.quickTo> | null = null;
    let yToTitle: ReturnType<typeof gsap.quickTo> | null = null;
    let xToSub: ReturnType<typeof gsap.quickTo> | null = null;
    let yToSub: ReturnType<typeof gsap.quickTo> | null = null;
    let xToBg: ReturnType<typeof gsap.quickTo> | null = null;
    let yToBg: ReturnType<typeof gsap.quickTo> | null = null;

    // 延迟 2.5s 等入场动画跑完
    const initTimer = setTimeout(() => {
      const title = el.querySelector('.hero-title') as HTMLElement | null;
      const sub = el.querySelector('.hero-subtitle') as HTMLElement | null;
      const bgImg = el.querySelector('img[aria-hidden="true"]') as HTMLElement | null;

      if (title) {
        xToTitle = gsap.quickTo(title, 'x', { duration: 0.6, ease: 'power2.out' });
        yToTitle = gsap.quickTo(title, 'rotateX', { duration: 0.6, ease: 'power2.out' });
      }
      if (sub) {
        xToSub = gsap.quickTo(sub, 'x', { duration: 0.8, ease: 'power2.out' });
        yToSub = gsap.quickTo(sub, 'y', { duration: 0.8, ease: 'power2.out' });
      }
      if (bgImg) {
        xToBg = gsap.quickTo(bgImg, 'x', { duration: 1, ease: 'power2.out' });
        yToBg = gsap.quickTo(bgImg, 'y', { duration: 1, ease: 'power2.out' });
      }
    }, 2500);

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      // 归一化到 -0.5..0.5
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      // 标题：水平偏移 + 轻微 rotateX 产生 3D 仰俯
      if (xToTitle) xToTitle(px * 8);
      if (yToTitle) yToTitle(py * 3);
      // 副标题：幅度更小
      if (xToSub) xToSub(px * 5);
      if (yToSub) yToSub(py * 4);
      // 背景图反向偏移，增加深度感
      if (xToBg) xToBg(px * -6);
      if (yToBg) yToBg(py * -4);
    };

    el.addEventListener('mousemove', onMove);

    return () => {
      clearTimeout(initTimer);
      el.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      component="section"
      id="hero"
      sx={{ height: '100vh', width: '100%', position: 'relative', overflow: 'hidden', scrollMarginTop: '100px' }}
    >
      {/* 真实代表作背景图 */}
      {heroImage && (
        <Box
          component="img"
          src={heroImage}
          alt=""
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.35,
            zIndex: 0,
            willChange: 'transform',
          }}
        />
      )}
      {/* 渐变遮罩 */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(5,5,5,0.6) 0%, rgba(5,5,5,0.4) 40%, rgba(5,5,5,0.8) 100%)',
          zIndex: 1,
        }}
      />
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Suspense fallback={<HeroFallback />}>
          <HeroCanvas visible={canvasVisible} />
        </Suspense>
      </Box>

      <Stack
        justifyContent="center"
        alignItems="center"
        sx={{ height: '100%', position: 'relative', zIndex: 10, pointerEvents: 'none', perspective: '800px' }}
      >
        {titleParts.length > 0 && (
          <Typography
            variant="h1"
            className="hero-title"
            sx={{
              textAlign: 'center',
              fontSize: { xs: '10vw', md: '8vw' },
              fontWeight: 700,
              lineHeight: 0.9,
              textShadow: '0 4px 30px rgba(0,0,0,0.8)',
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            }}
          >
            {titleParts.map((part, idx) => (
              <Box key={idx} component="span" sx={{ display: 'block' }}>{part}</Box>
            ))}
          </Typography>
        )}
        {subtitle && (
          <Typography
            className="hero-subtitle"
            sx={{
              mt: 4,
              letterSpacing: '0.2em',
              color: 'rgba(234,234,234,0.7)',
              textTransform: 'uppercase',
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
              willChange: 'transform',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default HeroSection;

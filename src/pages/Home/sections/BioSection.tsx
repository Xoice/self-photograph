import { Box, Typography, Container, Stack, Button } from '@mui/material';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/utils/gsap';
import { useRef, useEffect } from 'react';
import { useSiteConfig } from '@/hooks/useSiteConfig';

const BioSection = () => {
  const sectionRef = useRef(null);
  const { data: config } = useSiteConfig();
  const bioImage = config?.bioImage;

  const bioTitle = config?.bioTitle || '关于 Xoice';
  const bioParagraphs = config?.bioContent?.split('\n') || [
    '我是一名摄影师，专注于捕捉城市与星空的交汇点。每一张照片都是时间的切片，记录着光影的瞬间。',
    '从山川湖海到城市街角，我用镜头讲述那些被忽视的故事。摄影不仅是记录，更是对世界的重新诠释。',
  ];

  useGSAP(() => {
    gsap.fromTo('.bio-content',
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 90%' },
      },
    );
  }, { scope: sectionRef });

  // 异步数据加载后刷新 ScrollTrigger 位置
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [config]);

  return (
    <Box ref={sectionRef} component="section" id="bio" sx={{ minHeight: '100vh', py: 10, display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 6, md: 10 }, alignItems: 'center' }}>
          {bioImage && (
            <Box className="bio-content" sx={{ flex: { xs: '0 0 100%', md: '0 0 40%' }, maxWidth: { xs: '100%', md: '500px' }, position: 'relative' }}>
              <Box
                component="img"
                src={bioImage}
                alt={bioTitle}
                loading="lazy"
                sx={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: '4/5',
                  objectFit: 'cover',
                  borderRadius: 1,
                  filter: 'grayscale(20%)',
                  transition: 'filter 0.6s ease',
                  '&:hover': { filter: 'grayscale(0%)' },
                }}
              />
            </Box>
          )}
          <Stack spacing={4} sx={{ flex: 1 }}>
          <Typography className="bio-content" variant="h2" sx={{ fontSize: { xs: '3rem', md: '4rem' } }}>
            {bioTitle}
          </Typography>
          {bioParagraphs.map((para, idx) => (
            <Typography
              key={idx}
              className="bio-content"
              variant="body1"
              sx={{
                fontSize: { xs: idx === 0 ? '1.2rem' : '1rem', md: idx === 0 ? '1.5rem' : '1.2rem' },
                maxWidth: '800px',
                lineHeight: idx === 0 ? 1.8 : 1.6,
                color: idx === 0 ? 'inherit' : 'text.secondary',
              }}
            >
              {para}
            </Typography>
          ))}
          <Box className="bio-content" sx={{ mt: 4 }}>
            <Button variant="outlined" size="large" className="interactable" href="#gallery">
              浏览作品
            </Button>
          </Box>
        </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default BioSection;

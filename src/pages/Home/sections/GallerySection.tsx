import { useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Container, Skeleton, Button } from '@mui/material';
import { useGalleryWorks } from '@/hooks/useGalleryWorks';
import { useNavigate } from 'react-router-dom';

const GallerySection = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data, isLoading } = useGalleryWorks({ featured: true, pageSize: 8 });
  const works = data?.items ?? [];
  const rafRef = useRef<number>(0);

  const updateHorizontalScroll = useCallback(() => {
    const wrapper = wrapperRef.current;
    const scroller = scrollerRef.current;
    if (!wrapper || !scroller) return;

    const rect = wrapper.getBoundingClientRect();
    const wrapperHeight = wrapper.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollableDistance = wrapperHeight - viewportHeight;

    if (scrollableDistance <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));

    const maxTranslate = scroller.scrollWidth - window.innerWidth;
    if (maxTranslate <= 0) return;

    scroller.style.transform = `translateX(${-progress * maxTranslate}px)`;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateHorizontalScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateHorizontalScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [updateHorizontalScroll, works.length]);

  return (
    <>
      <Box id="gallery" sx={{ height: 0 }} />

      <Box ref={wrapperRef} sx={{ position: 'relative', height: '300vh' }}>
        <Box
          ref={viewportRef}
          sx={{
            height: '100vh',
            overflow: 'hidden',
            bgcolor: '#050505',
            position: 'sticky',
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Container maxWidth="xl" sx={{ mb: 4, flexShrink: 0 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, mb: 2 }}>画廊 Gallery</Typography>
            <Typography variant="body1" color="text.secondary">精选作品集。在这里，光影不再是物理现象，而是叙事的语言。</Typography>
          </Container>

          <Box
            ref={scrollerRef}
            sx={{
              display: 'flex',
              gap: { xs: '1rem', md: '2rem' },
              px: { xs: 2, md: 4 },
              width: 'max-content',
              willChange: 'transform',
            }}
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    sx={{
                      width: { xs: 280, md: 400 },
                      height: { xs: 420, md: 600 },
                      bgcolor: '#1a1a1a',
                      flexShrink: 0,
                    }}
                  />
                ))
              : works.map((work) => (
                  <Box
                    key={work.id}
                    className="interactable gallery-item"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate('/gallery')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/gallery'); } }}
                    sx={{
                      width: { xs: 280, md: 400 },
                      height: { xs: 420, md: 600 },
                      flexShrink: 0,
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 1,
                      bgcolor: '#111',
                      cursor: 'pointer',
                      transition: 'transform 0.5s cubic-bezier(0.165,0.84,0.44,1), box-shadow 0.5s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                      },
                      '&:hover img': { transform: 'scale(1.08)' },
                      '&:hover .gallery-info': { transform: 'translateY(0)' },
                    }}
                  >
                    <Box
                      component="img"
                      src={work.coverImage}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.7s cubic-bezier(0.165,0.84,0.44,1)',
                      }}
                    />
                    <Box
                      className="gallery-info"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        p: 3,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.6) 50%, transparent)',
                        transform: 'translateY(100%)',
                        transition: 'transform 0.4s cubic-bezier(0.165,0.84,0.44,1)',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mb: 1 }}>
                        {work.category?.name || ''}
                      </Typography>
                      <Typography variant="h5">{work.title}</Typography>
                    </Box>
                  </Box>
                ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8, bgcolor: '#050505' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/gallery')}
          className="interactable"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: '50px',
            borderColor: 'rgba(255,255,255,0.2)',
            color: 'text.primary',
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'rgba(255,255,255,0.05)',
            },
          }}
        >
          查看全部作品
        </Button>
      </Box>
    </>
  );
};

export default GallerySection;

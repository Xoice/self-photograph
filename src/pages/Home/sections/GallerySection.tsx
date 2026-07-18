import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Box, Typography, Container, Skeleton, Button } from '@mui/material';
import { useGalleryWorks } from '@/hooks/useGalleryWorks';
import { useNavigate } from 'react-router-dom';
import ResponsiveImage from '@/components/ui/ResponsiveImage';

const GallerySection = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data, isLoading } = useGalleryWorks({ featured: true, pageSize: 8 });
  // memo 化避免每次渲染都产生新数组引用，导致 effect 依赖无谓重跑
  const works = useMemo(() => data?.items ?? [], [data]);
  const rafRef = useRef<number>(0);

  // 桌面端 pin 横滚：wrapper 高度 = 1 屏 + 横向内容可滚距离，保证 1:1 映射
  const [wrapperHeight, setWrapperHeight] = useState<number | null>(null);

  const measure = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const maxTranslate = scroller.scrollWidth - window.innerWidth;
    const h = maxTranslate > 0 ? window.innerHeight + maxTranslate : window.innerHeight;
    setWrapperHeight(h);
  }, []);

  const updateHorizontalScroll = useCallback(() => {
    const wrapper = wrapperRef.current;
    const scroller = scrollerRef.current;
    if (!wrapper || !scroller) return;

    const rect = wrapper.getBoundingClientRect();
    // 避免与同名 state 变量遮蔽
    const wrapperHeightPx = wrapper.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollableDistance = wrapperHeightPx - viewportHeight;

    if (scrollableDistance <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));

    const maxTranslate = scroller.scrollWidth - window.innerWidth;
    if (maxTranslate <= 0) return;

    scroller.style.transform = `translateX(${-progress * maxTranslate}px)`;
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 横滚布局测量：挂载/works 变化后同步量取高度
    measure();

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateHorizontalScroll);
    };

    const onResize = () => {
      if (scrollerRef.current) scrollerRef.current.style.transform = '';
      measure();
      updateHorizontalScroll();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    const ro = new ResizeObserver(() => {
      measure();
      updateHorizontalScroll();
    });
    if (scrollerRef.current) ro.observe(scrollerRef.current);

    updateHorizontalScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [measure, updateHorizontalScroll, works.length]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 数据加载后重新量取横滚尺寸
    measure();
    updateHorizontalScroll();
  }, [works, measure, updateHorizontalScroll]);

  const handleWorkClick = (slug: string) => {
    navigate(`/gallery/${slug}`);
  };

  const cardSx = {
    width: { xs: '75vw', md: 400 },
    height: { xs: '50vh', md: 600 },
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 1,
    bgcolor: '#111',
    cursor: 'pointer',
    transition: 'transform 0.5s cubic-bezier(0.165,0.84,0.44,1), box-shadow 0.5s ease',
    scrollSnapAlign: 'center' as const,
    '&:hover': {
      transform: { xs: 'none', md: 'translateY(-8px)' },
      boxShadow: { xs: 'none', md: '0 20px 40px rgba(0,0,0,0.5)' },
    },
    '&:hover img': { transform: { xs: 'none', md: 'scale(1.08)' } },
    '&:hover .gallery-info': { transform: { xs: 'translateY(0)', md: 'translateY(0)' } },
  };

  return (
    <>
      <Box id="gallery" sx={{ height: 0 }} />

      {/* 移动端：原生横向 swipe + scroll-snap */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, bgcolor: '#050505', py: 6 }}>
        <Container maxWidth="xl" sx={{ mb: 4 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '2.5rem' }, mb: 2 }}>画廊 Gallery</Typography>
          <Typography variant="body1" color="text.secondary">精选作品集。在这里，光影不再是物理现象，而是叙事的语言。</Typography>
        </Container>
        <Box
          sx={{
            display: 'flex',
            gap: '1rem',
            px: '12.5vw',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            scrollPadding: '12.5vw',
            WebkitOverflowScrolling: 'touch',
            pb: 2,
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" sx={{ ...cardSx, bgcolor: '#1a1a1a' }} />
              ))
            : works.map((work) => (
                <Box
                  key={work.id}
                  className="interactable gallery-item"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleWorkClick(work.slug)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleWorkClick(work.slug); } }}
                  sx={cardSx}
                >
                 <ResponsiveImage src={work.coverImage} alt={work.title} sizes={"(min-width: 900px) 400px, 75vw"} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.7s cubic-bezier(0.165,0.84,0.44,1)' }} />
                 <Box className="gallery-info" sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', transform: 'translateY(0)', p: { xs: 2, md: 3 }, transition: 'transform 0.4s cubic-bezier(0.165,0.84,0.44,1)' }}>
                    <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mb: 1 }}>{work.category?.name || ''}</Typography>
                    <Typography variant="h5">{work.title}</Typography>
                  </Box>
                </Box>
              ))}
        </Box>
      </Box>

      {/* 桌面端：sticky pin 横滚 */}
      <Box ref={wrapperRef} sx={{ display: { xs: 'none', md: 'block' }, position: 'relative', height: wrapperHeight ?? '200vh' }}>
        <Box sx={{ height: '100vh', overflow: 'hidden', bgcolor: '#050505', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Container maxWidth="xl" sx={{ mb: 4, flexShrink: 0 }}>
            <Typography variant="h2" sx={{ fontSize: { md: '4rem' }, mb: 2 }}>画廊 Gallery</Typography>
            <Typography variant="body1" color="text.secondary">精选作品集。在这里，光影不再是物理现象，而是叙事的语言。</Typography>
          </Container>
          <Box ref={scrollerRef} sx={{ display: 'flex', gap: '2rem', px: 4, width: 'max-content', willChange: 'transform' }}>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" sx={{ ...cardSx, bgcolor: '#1a1a1a' }} />
                ))
              : works.map((work) => (
                  <Box
                    key={work.id}
                    className="interactable gallery-item"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleWorkClick(work.slug)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleWorkClick(work.slug); } }}
                    sx={cardSx}
                  >
                    <ResponsiveImage src={work.coverImage} alt={work.title} sizes={"(min-width: 900px) 400px, 75vw"} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.7s cubic-bezier(0.165,0.84,0.44,1)' }} />
                    <Box className="gallery-info" sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', p: 3, background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.6) 50%, transparent)', transform: 'translateY(100%)', transition: 'transform 0.4s cubic-bezier(0.165,0.84,0.44,1)' }}>
                      <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mb: 1 }}>{work.category?.name || ''}</Typography>
                      <Typography variant="h5">{work.title}</Typography>
                    </Box>
                  </Box>
                ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8, bgcolor: '#050505' }}>
        <Button variant="outlined" onClick={() => navigate('/gallery')} className="interactable" sx={{ px: 4, py: 1.5, borderRadius: '50px', borderColor: 'rgba(255,255,255,0.2)', color: 'text.primary', textTransform: 'none', fontSize: '1rem', '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(255,255,255,0.05)' } }}>
          查看全部作品
        </Button>
      </Box>
    </>
  );
};

export default GallerySection;

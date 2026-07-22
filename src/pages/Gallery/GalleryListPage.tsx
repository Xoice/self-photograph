import { useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Container, Grid, Skeleton, Chip, Stack, Button } from '@mui/material';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/utils/gsap';
import { useGalleryWorks } from '@/hooks/useGalleryWorks';
import { useGalleryCategories } from '@/hooks/useGalleryCategories';
import SEOHead from '@/components/ui/SEOHead';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { Home } from '@mui/icons-material';

const GalleryListPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const { data: categories = [] } = useGalleryCategories();
  const { data, isLoading, isFetching } = useGalleryWorks({ pageSize: 100, category: currentCategory || undefined });
  const works = data?.items ?? [];
  const categoryKey = currentCategory || 'all';

  const handleCategoryFilter = (slug: string) => {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  useGSAP(() => {
    gsap.fromTo('.gallery-grid-item',
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
      },
    );
  }, { scope: containerRef, dependencies: [categoryKey, works.length] });

  return (
    <Box ref={containerRef} sx={{ minHeight: '100vh', bgcolor: '#050505', pt: 12, pb: 10 }}>
      <SEOHead title="画廊" description="精选作品集。在这里，光影不再是物理现象，而是叙事的语言。" url="/gallery" />
      <Container maxWidth="xl">
        <Button
          onClick={() => navigate('/#gallery')}
          startIcon={<Home />}
          sx={{ mb: 4, color: '#EAEAEA', textTransform: 'none', fontSize: '0.9rem', '&:hover': { color: 'primary.main' } }}
        >
          返回首页
        </Button>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 700, mb: 2 }}>
            画廊
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.2rem', color: 'text.secondary', maxWidth: '600px' }}>
            精选作品集。在这里，光影不再是物理现象，而是叙事的语言。
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 6, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="全部"
            onClick={() => handleCategoryFilter('')}
            sx={{
              bgcolor: !currentCategory ? 'primary.main' : 'rgba(255,255,255,0.08)',
              color: !currentCategory ? '#000' : '#888',
              fontWeight: 600,
              '&:hover': { bgcolor: !currentCategory ? 'primary.main' : 'rgba(255,255,255,0.12)' },
            }}
          />
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              onClick={() => handleCategoryFilter(cat.slug)}
              sx={{
                bgcolor: currentCategory === cat.slug ? 'primary.main' : 'rgba(255,255,255,0.08)',
                color: currentCategory === cat.slug ? '#000' : '#888',
                fontWeight: 600,
                '&:hover': { bgcolor: currentCategory === cat.slug ? 'primary.main' : 'rgba(255,255,255,0.12)' },
              }}
            />
          ))}
        </Stack>

        {isLoading || isFetching ? (
          <Grid container spacing={3}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Skeleton variant="rectangular" height={400} sx={{ bgcolor: '#1a1a1a', borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {works.map((work) => (
              <Grid key={work.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Box
                  className="gallery-grid-item interactable"
                  onClick={() => navigate(`/gallery/${work.slug}`)}
                  sx={{
                    position: 'relative',
                    height: 400,
                    bgcolor: '#111',
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.5s ease',
                    '&:hover': {
                      transform: { xs: 'none', md: 'translateY(-8px)' },
                      boxShadow: { xs: 'none', md: '0 20px 40px rgba(0,0,0,0.5)' },
                    },
                    '&:hover img': { transform: { xs: 'none', md: 'scale(1.08)' } },
                    '&:hover .overlay': { opacity: { xs: 0, md: 1 } },
                    '&:hover .info': { transform: 'translateY(0)' },
                  }}
                >
                  <ResponsiveImage
                    src={work.coverImage}
                    alt={work.title}
                    sizes="(min-width: 1200px) 25vw, (min-width: 900px) 33vw, 100vw"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1)',
                    }}
                  />
                  <Box
                    className="overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      bgcolor: 'rgba(0,0,0,0.3)',
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                    }}
                  />
                  <Box
                    className="info"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      p: 3,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)',
                      transform: { xs: 'translateY(0)', md: 'translateY(100%)' },
                      transition: 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Chip
                        label={work.category?.name || '未分类'}
                        size="small"
                        sx={{ bgcolor: 'rgba(224,164,88,0.15)', color: 'primary.main', fontSize: '0.7rem' }}
                      />
                      {work.isFeatured && (
                        <Chip
                          label="精选"
                          size="small"
                          sx={{ bgcolor: 'rgba(224,164,88,0.15)', color: 'primary.main', fontSize: '0.7rem' }}
                        />
                      )}
                    </Stack>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                      {work.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.85rem' }}>
                      {work.summary}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {!isLoading && works.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              暂无作品
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default GalleryListPage;

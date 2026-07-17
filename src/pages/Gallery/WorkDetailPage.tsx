import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Chip, Button, Skeleton, Alert, Stack } from '@mui/material';
import { ArrowBack, CalendarToday, LocationOn, CameraAlt, Home } from '@mui/icons-material';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/utils/gsap';
import { useGalleryWork } from '@/hooks/useGalleryWork';
import SEOHead from '@/components/ui/SEOHead';
import ShareButton from '@/components/ui/ShareButton';
import Lightbox from '@/components/ui/Lightbox';
import ResponsiveImage from '@/components/ui/ResponsiveImage';

const WorkDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: work, isLoading, error } = useGalleryWork(slug || '');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useGSAP(() => {
    if (!work) return;
    gsap.fromTo('.work-header',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
    );
    gsap.fromTo('.work-section',
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
      },
    );
  }, { scope: containerRef, dependencies: [work] });

  if (isLoading) {
    return (
      <Box sx={{ bgcolor: '#050505', minHeight: '100vh', pt: 15, pb: 10 }}>
        <Container maxWidth="lg">
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 4, bgcolor: '#1a1a1a' }} />
          <Skeleton variant="text" width="60%" height={60} sx={{ mb: 2, bgcolor: '#1a1a1a' }} />
          <Skeleton variant="rectangular" width="100%" height={400} sx={{ mb: 4, bgcolor: '#1a1a1a' }} />
        </Container>
      </Box>
    );
  }

  if (error || !work) {
    return (
      <Box sx={{ bgcolor: '#050505', minHeight: '100vh', pt: 15, pb: 10 }}>
        <Container maxWidth="lg">
          <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
            <Button
              onClick={() => navigate('/gallery')}
              startIcon={<ArrowBack />}
              sx={{ color: '#EAEAEA', textTransform: 'none' }}
            >
              返回全部作品
            </Button>
            <Button
              onClick={() => navigate('/#gallery')}
              startIcon={<Home />}
              sx={{ color: '#EAEAEA', textTransform: 'none' }}
            >
              返回首页
            </Button>
          </Stack>
          <Alert severity="error" sx={{ bgcolor: '#1a1a1a', color: '#EAEAEA' }}>
            作品加载失败，请稍后重试
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box ref={containerRef} sx={{ bgcolor: '#050505', minHeight: '100vh', pt: 15, pb: 10 }}>
      <SEOHead
        title={work.title}
        description={work.summary}
        image={work.coverImage}
        url={`/gallery/${work.slug}`}
        type="article"
      />
      <Container maxWidth="lg">
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <Button
            onClick={() => navigate('/gallery')}
            startIcon={<ArrowBack />}
            sx={{ color: '#EAEAEA', textTransform: 'none', fontSize: '1rem', '&:hover': { color: 'primary.main' } }}
          >
            返回全部作品
          </Button>
          <Button
            onClick={() => navigate('/#gallery')}
            startIcon={<Home />}
            sx={{ color: '#EAEAEA', textTransform: 'none', fontSize: '1rem', '&:hover': { color: 'primary.main' } }}
          >
            返回首页
          </Button>
        </Stack>

        <Box className="work-header" sx={{ mb: 8 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Chip
              label={work.category?.name || '未分类'}
              sx={{
                bgcolor: 'rgba(224, 164, 88, 0.1)',
                color: 'primary.main',
                fontWeight: 500,
              }}
            />
            {work.tags.map((tag) => (
              <Chip key={tag} label={tag} sx={{ bgcolor: '#1a1a1a', color: '#888' }} />
            ))}
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 300, mb: 4, lineHeight: 1.2 }}>
              {work.title}
            </Typography>
            <ShareButton title={work.title} url={`/gallery/${work.slug}`} />
          </Box>

          <Typography variant="body1" sx={{ color: '#888', fontSize: '1.1rem', mb: 4, maxWidth: 800 }}>
            {work.summary}
          </Typography>

          <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap', gap: 2 }}>
            {work.location && (
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOn sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#888' }}>{work.location}</Typography>
              </Stack>
            )}
            {work.shootDate && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarToday sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#888' }}>
                  {new Date(work.shootDate).toLocaleDateString('zh-CN')}
                </Typography>
              </Stack>
            )}
            {work.cameraInfo && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CameraAlt sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#888' }}>{work.cameraInfo}</Typography>
              </Stack>
            )}
          </Stack>
        </Box>

        <Box className="work-section" sx={{ mb: 8 }}>
          <ResponsiveImage src={work.coverImage} alt={work.title} sizes="(min-width: 1200px) 1200px, 100vw"
           tabIndex={0}
           role="button"
          onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLightboxIndex(0); setLightboxOpen(true); } }}
           sx={{
            width: '100%',
            height: 'auto',
            display: 'block',
             cursor: 'pointer',
             transition: 'opacity 0.3s',
             '&:hover': { opacity: 0.85 },
            }}
          />
        </Box>

        {work.description && (
          <Box className="work-section" sx={{ mb: 8 }}>
            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: 'text.primary' }}>
              作品介绍
            </Typography>
            <Typography variant="body1" sx={{ color: '#aaa', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {work.description}
            </Typography>
          </Box>
        )}

        {work.images && work.images.length > 1 && (
          <Box className="work-section" sx={{ mb: 8 }}>
            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: 'text.primary' }}>
              更多图片
            </Typography>
            <Stack spacing={2}>
              {work.images.slice(1).map((img, idx) => (
                <ResponsiveImage
                  key={idx}

                  src={img}
                  alt={`${work.title} - ${idx + 2}`}
                   sizes="(min-width: 1200px) 1200px, 100vw"
                   tabIndex={0}
                   role="button"
                  onClick={() => { setLightboxIndex(idx + 1); setLightboxOpen(true); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLightboxIndex(idx + 1); setLightboxOpen(true); } }}
                   sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    cursor: 'pointer',
                    transition: 'opacity 0.3s',
                    '&:hover': { opacity: 0.85 },
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Container>

      <Lightbox
        open={lightboxOpen}
        images={work.images}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
        alt={work.title}
      />
    </Box>
  );
};

export default WorkDetailPage;

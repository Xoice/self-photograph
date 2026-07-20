import { Box, Typography, Container, Card, CardContent, Grid, Chip, Button, Skeleton } from '@mui/material';
import { PlayArrow, OpenInNew } from '@mui/icons-material';
import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/utils/gsap';
import { cardHoverSx } from '@/utils/theme';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { useVideos } from '@/hooks/useVideos';
import { useSiteConfig } from '@/hooks/useSiteConfig';

const VideoSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useVideos({ pageSize: 6, publishedOnly: true });
  const { data: config } = useSiteConfig();
  const videos = data?.items ?? [];

  useGSAP(() => {
    gsap.fromTo('.video-card',
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 90%' },
      },
    );
    gsap.fromTo('.section-title',
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 90%' },
      },
    );
  }, { scope: sectionRef });

  // 异步数据加载后刷新 ScrollTrigger 位置
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [data]);

  return (
    <Box component="section" ref={sectionRef} id="video" sx={{ minHeight: '100vh', py: 15, bgcolor: '#080808', scrollMarginTop: '100px' }}>
      <Container maxWidth="xl">
        <Box className="section-title" sx={{ mb: 10 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 300, mb: 3 }}>
            影视作品 VIDEO
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.2rem', color: 'text.secondary', maxWidth: '600px' }}>
            教学视频与摄影县城记录
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Skeleton variant="rectangular" height={350} sx={{ bgcolor: '#1a1a1a' }} />
              </Grid>
            ))
          ) : (
            videos.map((video) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={video.id}>
               <Card
                 className="video-card"
                 onClick={() => window.open(video.videoUrl, '_blank', 'noopener,noreferrer')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open(video.videoUrl, '_blank', 'noopener,noreferrer'); } }}
                  sx={{
                    bgcolor: '#111',
                    border: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    ...cardHoverSx,
                  }}
                >
                  <Box sx={{ position: 'relative', aspectRatio: '16/9' }}>
                    <ResponsiveImage
                      src={video.coverImage}
                      alt={video.title}
                      sizes="(min-width: 900px) 33vw, 100vw"
                      sx={{ height: '100%', objectFit: 'cover' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none',
                        '.video-card:hover &': { opacity: 1 },
                      }}
                    >
                      <PlayArrow sx={{ fontSize: 64, color: 'white' }} />
                    </Box>
                    <Chip
                      label={video.durationText}
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        fontSize: '0.75rem',
                      }}
                    />
                    <Chip
                      label={video.category}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        bgcolor: video.category === '教学视频' ? 'rgba(255,87,34,0.9)' : 'rgba(76,175,80,0.9)',
                        color: 'white',
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 1, fontWeight: 500 }}>
                      {video.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.5 }}>
                      {video.description}
                    </Typography>
                    <Button
                      startIcon={<OpenInNew />}
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        color: 'primary.main',
                        textTransform: 'none',
                        px: 0,
                        '&:hover': { bgcolor: 'transparent' },
                      }}
                    >
                      在B站观看
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        <Box sx={{ mt: 10, textAlign: 'center' }}>
          <Button
            variant="outlined"
            href={config?.socialLinks?.bilibili || 'https://space.bilibili.com/xxxxxx'}
            target="_blank"
            rel="noopener noreferrer"
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
            访问我的B站空间
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default VideoSection;

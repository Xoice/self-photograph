import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Grid, Skeleton, Chip, Stack, Button } from '@mui/material';
import { CalendarToday, LocationOn, People, ArrowBack } from '@mui/icons-material';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/utils/gsap';
import { useWorkshops } from '@/hooks/useWorkshops';
import SEOHead from '@/components/ui/SEOHead';
import type { WorkshopStatus } from '@/types/api';

const statusMap: Record<WorkshopStatus, string> = {
  draft: '草稿',
  published: '已发布',
  registration_open: '报名中',
  full: '已满员',
  closed: '已结束',
};

const WorkshopListPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data, isLoading } = useWorkshops({ pageSize: 100 });
  const workshops = data?.items ?? [];

  useGSAP(() => {
    gsap.fromTo('.workshop-grid-item',
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
  }, { scope: containerRef, dependencies: [workshops.length] });

  return (
    <Box ref={containerRef} sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', pt: 12, pb: 10 }}>
      <SEOHead title="摄影研学" description="深入自然与文化的摄影研学之旅。" url="/workshops" />
      <Container maxWidth="xl">
        <Button
          onClick={() => navigate('/#photographystudy')}
          startIcon={<ArrowBack />}
          sx={{
            mb: 4,
            color: '#EAEAEA',
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': { color: 'primary.main' },
          }}
        >
          返回首页
        </Button>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 700, mb: 2 }}>
            摄影研学
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.2rem', color: 'text.secondary', maxWidth: '600px' }}>
            深入自然与文化的摄影研学之旅。与志同道合的摄影爱好者一起，探索世界的美。
          </Typography>
        </Box>

        {isLoading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton variant="rectangular" height={360} sx={{ bgcolor: '#1a1a1a', borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {workshops.map((ws) => (
              <Grid key={ws.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box
                  className="workshop-grid-item interactable"
                  onClick={() => navigate(`/workshops/${ws.slug}`)}
                  sx={{
                    bgcolor: '#111',
                    border: ws.isFeatured ? '2px solid primary.main' : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: ws.isFeatured ? 'primary.main' : 'rgba(255,255,255,0.2)',
                      boxShadow: ws.isFeatured ? '0 20px 40px rgba(204, 255, 0, 0.2)' : '0 20px 40px rgba(0,0,0,0.4)',
                    },
                    '&:hover img': { transform: 'scale(1.08)' },
                  }}
                >
                  <Box sx={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                    <Box
                      component="img"
                      src={ws.coverImage}
                      loading="lazy"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1)',
                      }}
                    />
                    {ws.isFeatured && (
                      <Chip
                        label="重磅推出"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          bgcolor: 'primary.main',
                          color: '#000',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    )}
                    <Chip
                      label={statusMap[ws.status]}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: ws.status === 'registration_open' ? 'rgba(76,175,80,0.9)' : ws.status === 'full' ? 'rgba(244,67,54,0.9)' : 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>

                  <Stack spacing={1.5} sx={{ p: 3 }}>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                      {ws.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            bgcolor: ws.isFeatured ? 'rgba(204,255,0,0.2)' : 'rgba(255,255,255,0.05)',
                            color: ws.isFeatured ? 'primary.main' : 'text.secondary',
                            fontSize: '0.7rem',
                          }}
                        />
                      ))}
                    </Stack>

                    <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                      {ws.title}
                    </Typography>

                    {ws.summary && (
                      <Typography variant="body2" sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {ws.summary}
                      </Typography>
                    )}

                    <Stack spacing={0.5}>
                      {ws.startDate && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarToday sx={{ color: 'primary.main', fontSize: 16 }} />
                          <Typography variant="body2" sx={{ color: '#888', fontSize: '0.85rem' }}>
                            {new Date(ws.startDate).toLocaleDateString('zh-CN')}
                            {ws.endDate ? ` - ${new Date(ws.endDate).toLocaleDateString('zh-CN')}` : ''}
                          </Typography>
                        </Stack>
                      )}
                      {ws.location && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationOn sx={{ color: 'primary.main', fontSize: 16 }} />
                          <Typography variant="body2" sx={{ color: '#888', fontSize: '0.85rem' }}>{ws.location}</Typography>
                        </Stack>
                      )}
                      {ws.capacity && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <People sx={{ color: 'primary.main', fontSize: 16 }} />
                          <Typography variant="body2" sx={{ color: '#888', fontSize: '0.85rem' }}>
                            {ws.enrolledCount}/{ws.capacity}人
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        {ws.priceText}
                      </Typography>
                      <Chip
                        label={ws.level}
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#888' }}
                      />
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {!isLoading && workshops.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              暂无研学活动
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default WorkshopListPage;

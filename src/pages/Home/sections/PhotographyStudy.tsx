import { Box, Typography, Container, Card, CardContent, Chip, Button, Stack, Grid, Skeleton } from '@mui/material';
import { CalendarToday, LocationOn, People, ArrowForward } from '@mui/icons-material';
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/utils/gsap';
import { useWorkshops } from '@/hooks/useWorkshops';
import type { WorkshopStatus } from '@/types/api';

const statusMap: Record<WorkshopStatus, string> = {
  draft: '草稿',
  published: '已发布',
  registration_open: '报名中',
  full: '已满员',
  closed: '已结束',
};

const PhotographyStudy = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data, isLoading } = useWorkshops({ featured: true, pageSize: 2 });
  const workshops = data?.items ?? [];

  useGSAP(() => {
    if (!data?.items?.length) return;
    gsap.fromTo('.photography-study-card',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 90%' } },
    );
    gsap.fromTo('.section-title',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 90%' } },
    );
  }, { scope: sectionRef, dependencies: [data] });

  // 异步数据加载后刷新 ScrollTrigger 位置
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [data]);

  const handleCardClick = (slug: string) => {
    navigate(`/workshops/${slug}`);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '--';
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const isFull = (status: WorkshopStatus) => status === 'full';
  const isOpen = (status: WorkshopStatus) => status === 'registration_open';

  return (
    <Box component="section" ref={sectionRef} id="photographystudy" sx={{ minHeight: '100vh', '@supports (height: 100dvh)': { minHeight: '100dvh' }, py: { xs: 9, md: 15 }, bgcolor: '#0a0a0a', scrollMarginTop: '100px' }}>
      <Container maxWidth="xl">
        <Box className="section-title" sx={{ mb: { xs: 6, md: 10 } }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 300, mb: 3, overflowWrap: { xs: 'anywhere', md: 'normal' } }}>
            摄影研学 PHOTOGRAPHYSTUDY
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.2rem', color: 'text.secondary', maxWidth: '600px' }}>
            跟随Xoice探索摄影的无限可能
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Grid size={{ xs: 12, md: 6 }} key={i}>
                <Skeleton variant="rectangular" height={400} sx={{ bgcolor: '#1a1a1a' }} />
              </Grid>
            ))
          ) : (
            workshops.map((workshop) => (
              <Grid size={{ xs: 12, md: 6 }} key={workshop.id}>
               <Card
                 className="photography-study-card interactable"
                 onClick={() => handleCardClick(workshop.slug)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(workshop.slug); } }}
                  sx={{
                    bgcolor: '#111',
                    border: workshop.isFeatured ? '2px solid primary.main' : '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: workshop.isFeatured ? 'primary.main' : 'rgba(255,255,255,0.2)',
                      boxShadow: workshop.isFeatured ? '0 20px 40px rgba(224, 164, 88, 0.2)' : '0 20px 40px rgba(0,0,0,0.4)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                      {workshop.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            bgcolor: workshop.isFeatured ? 'rgba(224, 164, 88, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: workshop.isFeatured ? 'primary.main' : 'text.secondary',
                            fontSize: '0.75rem',
                            '&:hover': {
                              bgcolor: workshop.isFeatured ? 'rgba(224, 164, 88, 0.3)' : 'rgba(255,255,255,0.1)',
                            },
                          }}
                        />
                      ))}
                      <Chip
                        label={statusMap[workshop.status]}
                        size="small"
                        sx={{
                          bgcolor: workshop.status === 'registration_open' ? 'rgba(76,175,80,0.2)' : workshop.status === 'full' ? 'rgba(244,67,54,0.2)' : 'rgba(255,255,255,0.1)',
                          color: workshop.status === 'registration_open' ? '#4caf50' : workshop.status === 'full' ? '#f44336' : '#888',
                          fontSize: '0.75rem',
                        }}
                      />
                    </Stack>

                    <Typography variant="h5" sx={{ fontSize: '1.5rem', mb: 2, fontWeight: 500, color: workshop.isFeatured ? 'primary.main' : 'inherit' }}>
                      {workshop.title}
                    </Typography>

                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                      {workshop.summary}
                    </Typography>

                    <Stack spacing={2} sx={{ mb: 3 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                        <CalendarToday sx={{ fontSize: 18 }} />
                        <Typography variant="body2">{formatDate(workshop.startDate)}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                        <LocationOn sx={{ fontSize: 18 }} />
                        <Typography variant="body2">{workshop.location}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                        <People sx={{ fontSize: 18 }} />
                        <Typography variant="body2">
                          {workshop.enrolledCount}/{workshop.capacity} 人
                        </Typography>
                      </Stack>
                    </Stack>

                    <Box sx={{ mt: 'auto' }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {workshop.level} · {workshop.durationText}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" sx={{ color: workshop.isFeatured ? 'primary.main' : 'primary.main', fontWeight: 600 }}>
                          {workshop.priceText}
                        </Typography>
                        <Button
                          variant={isFull(workshop.status) ? 'outlined' : 'contained'}
                          disabled={isFull(workshop.status)}
                          endIcon={workshop.isFeatured ? <ArrowForward sx={{ color: 'inherit' }} /> : null}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(workshop.slug);
                          }}
                          sx={{
                            borderRadius: '50px',
                            px: 3,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: 'none',
                            bgcolor: isOpen(workshop.status) ? 'primary.main' : undefined,
                            color: isOpen(workshop.status) ? '#000000' : undefined,
                            '&:hover': {
                              bgcolor: isOpen(workshop.status) ? 'primary.main' : undefined,
                              opacity: isOpen(workshop.status) ? 0.9 : undefined,
                              boxShadow: isOpen(workshop.status) ? '0 0 25px rgba(224, 164, 88, 0.6)' : undefined,
                              transform: isOpen(workshop.status) ? 'translateY(-2px)' : undefined,
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {isFull(workshop.status) ? '已满员' : (workshop.isFeatured ? '查看详情' : '立即报名')}
                        </Button>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        <Box className="photography-study-card" sx={{ mt: 10, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/workshops')}
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
            查看更多课程
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default PhotographyStudy;

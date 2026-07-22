import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Card, CardContent, Grid, Button, Chip, Skeleton, Alert, Stack, Link } from '@mui/material';
import { CalendarToday, LocationOn, People, CheckCircle, ArrowBack, Phone, Email, Chat, ExpandMore, ExpandLess } from '@mui/icons-material';
import { LinearProgress, Collapse } from '@mui/material';
import { useRef, useState, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/utils/gsap';
import { useWorkshop } from '@/hooks/useWorkshop';
import SEOHead from '@/components/ui/SEOHead';
import ShareButton from '@/components/ui/ShareButton';
import EnrollmentDialog from '@/components/ui/EnrollmentDialog';

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '--';
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

const WorkshopDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: workshop, isLoading, error } = useWorkshop(slug || '');
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]));

  const toggleDay = useCallback((dayIndex: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayIndex)) next.delete(dayIndex);
      else next.add(dayIndex);
      return next;
    });
  }, []);

  useGSAP(() => {
    if (!workshop) return;
    gsap.fromTo('.expedition-header',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
    );
    gsap.fromTo('.expedition-section',
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
  }, { scope: containerRef, dependencies: [workshop] });

  if (isLoading) {
    return (
      <Box sx={{ bgcolor: '#050505', minHeight: '100vh', pt: 15, pb: 10 }}>
        <Container maxWidth="lg">
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 4, bgcolor: '#1a1a1a' }} />
          <Skeleton variant="text" width="70%" height={60} sx={{ mb: 2, bgcolor: '#1a1a1a' }} />
          <Skeleton variant="text" width="50%" height={40} sx={{ mb: 6, bgcolor: '#1a1a1a' }} />
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid key={i} size={{ xs: 12, md: 4 }}>
                <Skeleton variant="rectangular" height={100} sx={{ bgcolor: '#1a1a1a' }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error || !workshop) {
    return (
      <Box sx={{ bgcolor: '#050505', minHeight: '100vh', pt: 15, pb: 10 }}>
        <Container maxWidth="lg">
          <Button
            onClick={() => navigate('/workshops')}
            startIcon={<ArrowBack />}
            sx={{ mb: 4, color: '#EAEAEA', textTransform: 'none' }}
          >
            返回摄影研学
          </Button>
          <Alert severity="error" sx={{ bgcolor: '#1a1a1a', color: '#EAEAEA' }}>
            活动加载失败，请稍后重试
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box ref={containerRef} sx={{ bgcolor: '#050505', minHeight: '100vh', pt: 15, pb: 10 }}>
      <SEOHead
        title={workshop.title}
        description={workshop.summary}
        image={workshop.coverImage}
        url={`/workshops/${workshop.slug}`}
        type="article"
      />
      <Container maxWidth="lg">
        <Button
          onClick={() => navigate('/workshops')}
          startIcon={<ArrowBack />}
          sx={{
            mb: 4,
            color: '#EAEAEA',
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': { color: 'primary.main' },
          }}
        >
          返回课程列表
        </Button>

        <Box className="expedition-header" sx={{ mb: 8 }}>
          {workshop.isFeatured && (
            <Chip
              label="重磅推出"
              sx={{
                mb: 3,
                bgcolor: 'rgba(224, 164, 88, 0.1)',
                color: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 500,
                px: 2,
              }}
            />
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 300, mb: 4, lineHeight: 1.2 }}>
              {workshop.title}
            </Typography>
            <ShareButton title={workshop.title} url={`/workshops/${workshop.slug}`} />
          </Box>
          {workshop.subtitle && (
            <Typography variant="h2" sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 300, mb: 6, color: 'primary.main' }}>
              {workshop.subtitle}
            </Typography>
          )}

          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 234, 234, 0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CalendarToday sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#888' }}>出行时间</Typography>
                      <Typography variant="h6" sx={{ color: '#EAEAEA' }}>
                        {formatDate(workshop.startDate)} - {formatDate(workshop.endDate)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 234, 234, 0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <LocationOn sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#888' }}>拍摄地点</Typography>
                      <Typography variant="h6" sx={{ color: '#EAEAEA' }}>{workshop.location}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 234, 234, 0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <People sx={{ color: 'primary.main' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: '#888' }}>名额</Typography>
                      <Typography variant="h6" sx={{ color: '#EAEAEA', mb: 1 }}>
                        {workshop.capacity ? `仅限${workshop.capacity}人精品小团（已报名${workshop.enrolledCount}人）` : `已报名${workshop.enrolledCount}人`}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={workshop.capacity ? Math.min((workshop.enrolledCount / workshop.capacity) * 100, 100) : 0}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'primary.main',
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {workshop.tags.map((tag) => (
              <Chip key={tag} label={tag} sx={{ bgcolor: '#1a1a1a', color: '#888' }} />
            ))}
          </Stack>
        </Box>

        {workshop.content && (
          <Box className="expedition-section" sx={{ mb: 8 }}>
            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: 'primary.main' }}>
              活动介绍
            </Typography>
            <Typography variant="body1" sx={{ color: '#aaa', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {workshop.content}
            </Typography>
          </Box>
        )}

        {workshop.highlights && workshop.highlights.length > 0 && (
          <Box className="expedition-section" sx={{ mb: 8 }}>
            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: 'primary.main' }}>
              活动亮点
            </Typography>
            <Stack spacing={2}>
              {workshop.highlights.map((h, idx) => (
                <Card key={idx} sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 234, 234, 0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>{h.title}</Typography>
                    <Typography variant="body1" sx={{ color: '#aaa' }}>{h.content}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {workshop.itinerary && workshop.itinerary.length > 0 && (
          <Box className="expedition-section" sx={{ mb: 8 }}>
            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: 'primary.main' }}>
              行程安排
            </Typography>
            <Stack spacing={2}>
              {workshop.itinerary.map((day) => {
                const isExpanded = expandedDays.has(day.dayIndex);
                return (
                  <Card key={day.dayIndex} sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 234, 234, 0.1)' }}>
                    <CardContent
                      onClick={() => toggleDay(day.dayIndex)}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Chip label={`Day ${day.dayIndex + 1}`} size="small" sx={{ bgcolor: 'rgba(224,164,88,0.15)', color: 'primary.main', fontWeight: 600 }} />
                          <Typography variant="h6" sx={{ color: '#EAEAEA' }}>{day.title}</Typography>
                        </Stack>
                        {isExpanded ? <ExpandLess sx={{ color: 'text.secondary' }} /> : <ExpandMore sx={{ color: 'text.secondary' }} />}
                      </Stack>
                      <Collapse in={isExpanded}>
                        <Typography variant="body1" sx={{ color: '#aaa', mt: 2 }}>{day.content}</Typography>
                      </Collapse>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          </Box>
        )}

        {(workshop.feeIncludes?.length > 0 || workshop.feeExcludes?.length > 0) && (
          <Box className="expedition-section" sx={{ mb: 8 }}>
            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: 'primary.main' }}>
              费用说明
            </Typography>
            <Grid container spacing={3}>
              {workshop.feeIncludes?.length > 0 && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 255, 0, 0.2)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>费用包含</Typography>
                      <Stack spacing={1}>
                        {workshop.feeIncludes.map((item, idx) => (
                          <Stack key={idx} direction="row" spacing={1} alignItems="center">
                            <CheckCircle sx={{ color: 'primary.main', fontSize: 18 }} />
                            <Typography variant="body2" sx={{ color: '#aaa' }}>{item}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {workshop.feeExcludes?.length > 0 && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 234, 234, 0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#888', mb: 2 }}>费用不含</Typography>
                      <Stack spacing={1}>
                        {workshop.feeExcludes.map((item, idx) => (
                          <Typography key={idx} variant="body2" sx={{ color: '#888' }}>- {item}</Typography>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        <Box className="expedition-section" sx={{ mb: 8 }}>
          <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 255, 0, 0.2)' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
                <Box>
                  <Typography variant="h3" sx={{ color: 'primary.main', fontSize: '2rem', fontWeight: 600, mb: 1 }}>
                    {workshop.priceText}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#888' }}>
                    {workshop.level} · {workshop.durationText} · {workshop.status === 'registration_open' ? '报名中' : workshop.status === 'full' ? '已满员' : workshop.status === 'closed' ? '已结束' : workshop.status === 'draft' ? '草稿' : '已发布'}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  disabled={workshop.status !== 'registration_open'}
                  onClick={() => setEnrollOpen(true)}
                  sx={{
                    bgcolor: 'primary.main',
                    color: '#000',
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#b3e600' },
                    '&.Mui-disabled': { bgcolor: '#333', color: '#666' },
                  }}
                >
                  {workshop.status === 'registration_open' ? '立即报名' : '暂不可报名'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {workshop.contact && (
          <Box className="expedition-section" sx={{ mb: 4 }}>
            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: 'primary.main' }}>
              联系方式
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Phone sx={{ color: 'primary.main', fontSize: 20 }} />
                <Link
                  href={`tel:${workshop.contact.phone}`}
                  underline="none"
                  variant="body1"
                  sx={{ color: '#aaa', display: 'inline-block', py: { xs: 1.5, md: 0 } }}
                >
                  {workshop.contact.phone}
                </Link>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Email sx={{ color: 'primary.main', fontSize: 20 }} />
                <Link
                  href={`mailto:${workshop.contact.email}`}
                  underline="none"
                  variant="body1"
                  sx={{ color: '#aaa', display: 'inline-block', py: { xs: 1.5, md: 0 } }}
                >
                  {workshop.contact.email}
                </Link>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chat sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="body1" sx={{ color: '#aaa' }}>{workshop.contact.wechat}</Typography>
              </Stack>
            </Stack>
          </Box>
        )}
      </Container>

      {workshop && (
        <EnrollmentDialog
          open={enrollOpen}
          onClose={() => setEnrollOpen(false)}
          workshopSlug={workshop.slug}
          workshopTitle={workshop.title}
        />
      )}
    </Box>
  );
};

export default WorkshopDetailPage;

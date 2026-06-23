import { useEffect, useState } from 'react';
import { Box, Typography, Container, Card, CardContent, Grid, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/api/client';

interface Stats {
  works: number;
  videos: number;
  workshops: number;
  leads: number;
  enrollments: number;
  media: number;
}

interface StatCard {
  label: string;
  value: number;
  color: string;
  path: string;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadStats = () => {
    if (!user) return;
    setLoading(true);
    setError(false);
    const empty = { pagination: { total: 0 } };
    Promise.all([
      apiClient.get('/admin/gallery/works').catch(() => empty),
      apiClient.get('/admin/videos').catch(() => empty),
      apiClient.get('/admin/workshops').catch(() => empty),
      apiClient.get('/admin/leads/contact').catch(() => empty),
      apiClient.get('/admin/leads/workshop-enrollments').catch(() => empty),
      apiClient.get('/admin/media').catch(() => empty),
    ]).then(([works, videos, workshops, leads, enrollments, media]) => {
      setStats({
        works: (works as any)?.pagination?.total || 0,
        videos: (videos as any)?.pagination?.total || 0,
        workshops: (workshops as any)?.pagination?.total || 0,
        leads: (leads as any)?.pagination?.total || 0,
        enrollments: (enrollments as any)?.pagination?.total || 0,
        media: (media as any)?.pagination?.total || 0,
      });
      setLoading(false);
    }).catch(() => {
      setError(true);
      setLoading(false);
    });
  };

  useEffect(() => { loadStats(); }, [user]);

  const statCards: StatCard[] = stats ? [
    { label: '作品', value: stats.works, color: '#4caf50', path: '/admin/works' },
    { label: '视频', value: stats.videos, color: '#2196f3', path: '/admin/videos' },
    { label: '研学活动', value: stats.workshops, color: '#ff9800', path: '/admin/workshops' },
    { label: '联系线索', value: stats.leads, color: '#e91e63', path: '/admin/leads' },
    { label: '报名记录', value: stats.enrollments, color: '#9c27b0', path: '/admin/leads' },
    { label: '媒体文件', value: stats.media, color: '#00bcd4', path: '/admin/media' },
  ] : [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        欢迎回来，{user?.name}
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        数据概览
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            加载数据失败
          </Typography>
          <Button onClick={loadStats} sx={{ color: 'primary.main' }}>重试</Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {statCards.map((card) => (
            <Grid key={card.label} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                onClick={() => navigate(card.path)}
                sx={{
                  bgcolor: '#111',
                  border: '1px solid #222',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)',
                  '&:hover': {
                    borderColor: card.color,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${card.color}22`,
                  },
                }}
              >
                <CardContent>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    {card.label}
                  </Typography>
                  <Typography variant="h3" sx={{ color: card.color, fontWeight: 700 }}>
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default DashboardPage;

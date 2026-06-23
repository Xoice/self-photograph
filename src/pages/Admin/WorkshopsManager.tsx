import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, CircularProgress, Alert } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import apiClient from '@/api/client';
import type { WorkshopSummary, WorkshopStatus } from '@/types/api';

const statusMap: Record<WorkshopStatus, string> = {
  draft: '草稿',
  published: '已发布',
  registration_open: '报名中',
  full: '已满员',
  closed: '已结束',
};

const WorkshopsManager = () => {
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState<WorkshopSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWorkshops = () => {
    setLoading(true);
    setError('');
    apiClient.get('/admin/workshops')
      .then((res: any) => setWorkshops(res.items || []))
      .catch((err) => { setWorkshops([]); setError(err.message || '加载失败'); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadWorkshops(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？')) return;
    setError('');
    try {
      await apiClient.delete(`/admin/workshops/${id}`);
      loadWorkshops();
    } catch (err: any) {
      setError(err.message || '删除失败');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(244,67,54,0.1)', color: '#f44336' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>研学管理</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/workshops/new')}
          sx={{ bgcolor: 'primary.main', color: '#000', '&:hover': { bgcolor: 'primary.main', opacity: 0.9 } }}
        >
          新增活动
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress sx={{ color: 'primary.main' }} /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: '#111', border: '1px solid #222', overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary' }}>标题</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>状态</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>发布</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>名额</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>价格</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workshops.map((ws) => (
                <TableRow key={ws.id}>
                  <TableCell>{ws.title}</TableCell>
                  <TableCell>
                    <Chip label={statusMap[ws.status]} size="small" sx={{
                      bgcolor: ws.status === 'full' ? 'rgba(244,67,54,0.2)' : ws.status === 'registration_open' ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.1)',
                      color: ws.status === 'full' ? '#f44336' : ws.status === 'registration_open' ? '#4caf50' : '#888',
                    }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={ws.isPublished ? '已发布' : '草稿'} size="small" sx={{
                      bgcolor: ws.isPublished ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.1)',
                      color: ws.isPublished ? '#4caf50' : '#888',
                    }} />
                  </TableCell>
                  <TableCell>{ws.enrolledCount}/{ws.capacity}</TableCell>
                  <TableCell>{ws.priceText}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => navigate(`/admin/workshops/edit/${ws.id}`)} sx={{ color: 'text.secondary' }}><Edit /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(ws.id)} sx={{ color: '#f44336' }}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default WorkshopsManager;

import { useEffect, useState } from 'react';
import { Box, Typography, Container, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Switch, FormControlLabel } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import apiClient from '@/api/client';
import type { VideoItem, PaginatedData } from '@/types/api';
import { getErrorMessage } from '@/utils/error';
import ImageUploader from '@/components/ui/ImageUploader';

interface FormData {
  title: string;
  slug: string;
  description: string;
  videoUrl: string;
  coverImage: string;
  category: string;
  durationSeconds: number;
  isPublished: boolean;
  sortOrder: number;
}

const emptyForm: FormData = { title: '', slug: '', description: '', videoUrl: '', coverImage: '', category: '', durationSeconds: 0, isPublished: true, sortOrder: 0 };

const VideosManager = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<VideoItem | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadVideos = () => {
    setLoading(true);
    setError('');
    apiClient.get<PaginatedData<VideoItem>>('/admin/videos')
      .then((res) => setVideos(res.items || []))
      .catch((err) => { setVideos([]); setError(getErrorMessage(err, '加载失败')); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadVideos(); }, []);

  const handleEdit = (item: VideoItem) => {
    setEditItem(item);
    setFormData({
      title: item.title, slug: item.slug, description: item.description, videoUrl: item.videoUrl,
      coverImage: item.coverImage, category: item.category, durationSeconds: item.durationSeconds,
      isPublished: item.isPublished, sortOrder: item.sortOrder,
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditItem(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = { ...formData, platform: 'bilibili' };
      if (editItem) {
        await apiClient.patch(`/admin/videos/${editItem.id}`, payload);
      } else {
        await apiClient.post('/admin/videos', payload);
      }
      setDialogOpen(false);
      loadVideos();
    } catch (err: unknown) {
      setError(getErrorMessage(err, '保存失败'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？')) return;
    setError('');
    try {
      await apiClient.delete(`/admin/videos/${id}`);
      loadVideos();
    } catch (err: unknown) {
      setError(getErrorMessage(err, '删除失败'));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(244,67,54,0.1)', color: '#f44336' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>视频管理</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleNew}
        >
          新增视频
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
                <TableCell sx={{ color: 'text.secondary' }}>分类</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>时长</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>发布</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                  <TableCell>{video.title}</TableCell>
                  <TableCell>{video.category}</TableCell>
                  <TableCell>{video.durationText}</TableCell>
                  <TableCell>
                    <Chip label={video.isPublished ? '已发布' : '草稿'} size="small" sx={{
                      bgcolor: video.isPublished ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.1)',
                      color: video.isPublished ? '#4caf50' : '#888',
                    }} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(video)} sx={{ color: 'text.secondary' }}><Edit /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(video.id)} sx={{ color: '#f44336' }}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth >
        <DialogTitle>{editItem ? '编辑视频' : '新增视频'}</DialogTitle>
        <DialogContent data-lenis-prevent sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <TextField label="标题" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth sx={{ mb: 2, mt: 1 }} />
          <TextField label="URL标识（英文）" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} fullWidth sx={{ mb: 2 }} helperText="URL标识，英文，如 photo-basic" />
          <TextField label="描述" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth multiline rows={2} sx={{ mb: 2 }} />
          <TextField label="视频链接" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <Box sx={{ mb: 2 }}>
            <ImageUploader
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
              label="封面图"
              aspectRatio={16 / 9}
            />
          </Box>
          <TextField label="分类" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <TextField label="时长(秒)" type="number" value={formData.durationSeconds} onChange={(e) => setFormData({ ...formData, durationSeconds: parseInt(e.target.value) || 0 })} fullWidth sx={{ mb: 2 }} />
          <TextField label="排序" type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} fullWidth sx={{ mb: 2 }} />
          <FormControlLabel
            control={<Switch checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' } }} />}
            label="发布"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button onClick={handleSave} disabled={saving} sx={{ color: 'primary.main' }}>{saving ? '保存中...' : '保存'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VideosManager;

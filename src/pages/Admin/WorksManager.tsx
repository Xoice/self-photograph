import { useEffect, useState } from 'react';
import { Box, Typography, Container, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Switch, FormControlLabel, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import apiClient from '@/api/client';
import type { GalleryWorkItem, GalleryCategory } from '@/types/api';
import ImageUploader from '@/components/ui/ImageUploader';

interface FormData {
  title: string;
  slug: string;
  summary: string;
  description: string;
  coverImage: string;
  categoryId: string;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
}

const emptyForm: FormData = { title: '', slug: '', summary: '', description: '', coverImage: '', categoryId: '', isFeatured: false, isPublished: true, sortOrder: 0 };

const WorksManager = () => {
  const [works, setWorks] = useState<GalleryWorkItem[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<GalleryWorkItem | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadWorks = () => {
    setLoading(true);
    setError('');
    apiClient.get('/admin/gallery/works')
      .then((res: any) => setWorks(res.items || []))
      .catch((err) => { setWorks([]); setError(err.message || '加载失败'); })
      .finally(() => setLoading(false));
  };

  const loadCategories = () => {
    apiClient.get('/admin/gallery/categories')
      .then((res: any) => setCategories(res || []))
      .catch((err) => { setError(err.message || '加载分类失败'); });
  };

  useEffect(() => { loadWorks(); loadCategories(); }, []);

  const handleEdit = (item: GalleryWorkItem) => {
    setEditItem(item);
    setFormData({
      title: item.title, slug: item.slug, summary: item.summary, description: (item as any).description || '',
      coverImage: item.coverImage, categoryId: item.categoryId || '',
      isFeatured: item.isFeatured, isPublished: item.isPublished, sortOrder: item.sortOrder,
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
      const payload: any = { ...formData };
      if (!payload.categoryId) payload.categoryId = null;
      if (editItem) {
        await apiClient.patch(`/admin/gallery/works/${editItem.id}`, payload);
      } else {
        await apiClient.post('/admin/gallery/works', payload);
      }
      setDialogOpen(false);
      loadWorks();
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？')) return;
    setError('');
    try {
      await apiClient.delete(`/admin/gallery/works/${id}`);
      loadWorks();
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
        <Typography variant="h4" sx={{ fontWeight: 700 }}>作品管理</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleNew}
          sx={{ bgcolor: 'primary.main', color: '#000', '&:hover': { bgcolor: 'primary.main', opacity: 0.9 } }}
        >
          新增作品
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
                <TableCell sx={{ color: 'text.secondary' }}>精选</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>发布</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>排序</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {works.map((work) => (
                <TableRow key={work.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                  <TableCell>{work.title}</TableCell>
                  <TableCell>{work.category?.name || '-'}</TableCell>
                  <TableCell>
                    {work.isFeatured ? <Chip label="精选" size="small" sx={{ bgcolor: 'rgba(204,255,0,0.1)', color: 'primary.main' }} /> : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip label={work.isPublished ? '已发布' : '草稿'} size="small" sx={{
                      bgcolor: work.isPublished ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.1)',
                      color: work.isPublished ? '#4caf50' : '#888',
                    }} />
                  </TableCell>
                  <TableCell>{work.sortOrder}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(work)} sx={{ color: 'text.secondary' }}><Edit /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(work.id)} sx={{ color: '#f44336' }}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { maxHeight: '90vh', display: 'flex', flexDirection: 'column' } }}>
        <DialogTitle>{editItem ? '编辑作品' : '新增作品'}</DialogTitle>
        <DialogContent sx={{ overflowY: 'auto', flex: '1 1 auto' }}>
          <TextField label="标题" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth sx={{ mb: 2, mt: 1 }} />
          <TextField label="URL标识（英文）" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} fullWidth sx={{ mb: 2 }} helperText="URL标识，英文，如 silent-ridge" />
          <TextField label="摘要" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <TextField label="描述" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth multiline rows={3} sx={{ mb: 2 }} />
          <Box sx={{ mb: 2 }}>
            <ImageUploader
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
              label="封面图"
              aspectRatio={4 / 3}
            />
          </Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>分类</InputLabel>
            <Select
              value={formData.categoryId}
              label="分类"
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <MenuItem value="">无分类</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id} sx={{ fontWeight: 600 }}>
                  {cat.name}
                </MenuItem>
              ))}
              {categories.flatMap((cat) =>
                (cat.children || []).map((child) => (
                  <MenuItem key={child.id} value={child.id} sx={{ pl: 4 }}>
                    {'  '}{child.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <TextField label="排序" type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} fullWidth sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 4 }}>
            <FormControlLabel
              control={<Switch checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' } }} />}
              label="精选"
            />
            <FormControlLabel
              control={<Switch checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' } }} />}
              label="发布"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button onClick={handleSave} disabled={saving} sx={{ color: 'primary.main' }}>{saving ? '保存中...' : '保存'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WorksManager;

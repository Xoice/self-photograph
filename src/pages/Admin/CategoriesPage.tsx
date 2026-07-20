import { useEffect, useState } from 'react';
import { Box, Typography, Container, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Switch, FormControlLabel, Select, InputLabel, FormControl, MenuItem } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import apiClient from '@/api/client';
import type { GalleryCategory, FlatGalleryCategory } from '@/types/api';
import { getErrorMessage } from '@/utils/error';

interface CategoryFormData {
  name: string;
  slug: string;
  parentId: string;
  sortOrder: number;
  isVisible: boolean;
}

const emptyForm: CategoryFormData = { name: '', slug: '', parentId: '', sortOrder: 0, isVisible: true };

const CategoriesPage = () => {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<GalleryCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadCategories = () => {
    setLoading(true);
    setError('');
    apiClient.get<GalleryCategory[]>('/admin/gallery/categories')
      .then((res) => setCategories(res || []))
      .catch((err) => { setCategories([]); setError(getErrorMessage(err, '加载失败')); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCategories(); }, []);

  const handleEdit = (item: GalleryCategory) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      slug: item.slug,
      parentId: item.parentId || '',
      sortOrder: item.sortOrder || 0,
      isVisible: item.isVisible !== false,
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
      const payload: Record<string, unknown> = { ...formData };
      if (!payload.parentId) payload.parentId = null;
      if (editItem) {
        await apiClient.patch(`/admin/gallery/categories/${editItem.id}`, payload);
      } else {
        await apiClient.post('/admin/gallery/categories', payload);
      }
      setDialogOpen(false);
      loadCategories();
    } catch (err: unknown) {
      setError(getErrorMessage(err, '保存失败'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定删除分类"${name}"？`)) return;
    setError('');
    try {
      await apiClient.delete(`/admin/gallery/categories/${id}`);
      loadCategories();
    } catch (err: unknown) {
      setError(getErrorMessage(err, '删除失败'));
    }
  };

  const flatCategories: FlatGalleryCategory[] = categories.flatMap((cat) => [
    cat,
    ...(cat.children || []).map((child) => ({ ...child, _parent: cat.name })),
  ]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(244,67,54,0.1)', color: '#f44336' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>分类管理</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleNew}
        >
          新增分类
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress sx={{ color: 'primary.main' }} /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: '#111', border: '1px solid #222', overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary' }}>名称</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Slug</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>父分类</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>排序</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>可见</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flatCategories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {'_parent' in cat && <Box sx={{ width: 16 }} />}
                      <Typography sx={{ fontWeight: '_parent' in cat ? 400 : 600 }}>
                        {cat.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{cat.slug}</TableCell>
                  <TableCell>{('_parent' in cat) ? cat._parent : '-'}</TableCell>
                  <TableCell>{cat.sortOrder || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={cat.isVisible !== false ? '可见' : '隐藏'}
                      size="small"
                      sx={{
                        bgcolor: cat.isVisible !== false ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.1)',
                        color: cat.isVisible !== false ? '#4caf50' : '#888',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(cat)} sx={{ color: 'text.secondary' }}><Edit /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(cat.id, cat.name)} sx={{ color: '#f44336' }}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? '编辑分类' : '新增分类'}</DialogTitle>
        <DialogContent data-lenis-prevent sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <TextField label="名称" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth sx={{ mb: 2, mt: 1 }} />
          <TextField label="URL标识（英文）" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} fullWidth sx={{ mb: 2 }} helperText="URL标识，英文，如 landscape" />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>父分类（可选）</InputLabel>
            <Select
              value={formData.parentId}
              label="父分类（可选）"
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
            >
              <MenuItem value="">无（顶级分类）</MenuItem>
              {categories
                .filter((cat) => cat.id !== editItem?.id)
                .map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
          <TextField label="排序" type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} fullWidth sx={{ mb: 2 }} />
          <FormControlLabel
            control={<Switch checked={formData.isVisible} onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' } }} />}
            label="在公开站点显示"
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

export default CategoriesPage;

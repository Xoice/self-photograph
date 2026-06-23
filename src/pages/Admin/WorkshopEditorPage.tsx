import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, TextField, Button, Card, CardContent, Grid, Switch, FormControlLabel, Select, InputLabel, FormControl, MenuItem, Alert, Stack, IconButton, Divider, Chip, CircularProgress } from '@mui/material';
import { Add, Delete, ArrowBack, Save } from '@mui/icons-material';
import apiClient from '@/api/client';
import {
  getWorkshopById,
  addWorkshopHighlight, updateWorkshopHighlight, deleteWorkshopHighlight,
  addWorkshopItinerary, updateWorkshopItinerary, deleteWorkshopItinerary,
  addWorkshopFeeItem, updateWorkshopFeeItem, deleteWorkshopFeeItem,
} from '@/api/workshops';
import ImageUploader from '@/components/ui/ImageUploader';
import type { WorkshopStatus } from '@/types/api';

const statusMap: Record<WorkshopStatus, string> = {
  draft: '草稿',
  published: '已发布',
  registration_open: '报名中',
  full: '已满员',
  closed: '已结束',
};

interface HighlightItem { id?: string; title: string; content: string; sortOrder: number; }
interface ItineraryItem { id?: string; dayIndex: number; title: string; content: string; sortOrder: number; }
interface FeeItem { id?: string; type: string; content: string; sortOrder: number; }

interface WorkshopData {
  title: string;
  slug: string;
  subtitle: string;
  summary: string;
  content: string;
  coverImage: string;
  priceText: string;
  location: string;
  level: string;
  durationText: string;
  status: WorkshopStatus;
  capacity: number;
  enrolledCount: number;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  startDate: string;
  endDate: string;
  highlights: HighlightItem[];
  itinerary: ItineraryItem[];
  feeItems: FeeItem[];
}

const emptyWorkshop: WorkshopData = {
  title: '', slug: '', subtitle: '', summary: '', content: '', coverImage: '',
  priceText: '', location: '', level: '', durationText: '', status: 'draft',
  capacity: 0, enrolledCount: 0, isFeatured: false, isPublished: true, sortOrder: 0,
  startDate: '', endDate: '', highlights: [], itinerary: [], feeItems: [],
};

const WorkshopEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const [data, setData] = useState<WorkshopData>(emptyWorkshop);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isNew && id) {
      getWorkshopById(id)
        .then((res: any) => {
          setData({
            ...res,
            startDate: res.startDate ? res.startDate.split('T')[0] : '',
            endDate: res.endDate ? res.endDate.split('T')[0] : '',
            highlights: res.highlights || [],
            itinerary: res.itinerary || [],
            feeItems: res.feeItems || [],
          });
        })
        .catch((err) => setError(err.message || '加载失败'))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const update = useCallback((patch: Partial<WorkshopData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload: any = {
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle,
        summary: data.summary,
        content: data.content,
        coverImage: data.coverImage,
        priceText: data.priceText,
        location: data.location,
        level: data.level,
        durationText: data.durationText,
        status: data.status,
        capacity: data.capacity || undefined,
        enrolledCount: data.enrolledCount,
        isFeatured: data.isFeatured,
        isPublished: data.isPublished,
        sortOrder: data.sortOrder,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      };
      if (isNew) {
        const res: any = await apiClient.post('/admin/workshops', payload);
        setSuccess('创建成功，正在跳转...');
        navigate(`/admin/workshops/edit/${res.id}`, { replace: true });
      } else {
        await apiClient.patch(`/admin/workshops/${id}`, payload);
        setSuccess('保存成功');
      }
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const addHighlight = async () => {
    if (!id) { setError('请先保存活动再添加亮点'); return; }
    try {
      const item = await addWorkshopHighlight(id, { title: '新亮点', content: '', sortOrder: data.highlights.length });
      setData((prev) => ({ ...prev, highlights: [...prev.highlights, item as any] }));
    } catch (err: any) { setError(err.message); }
  };

  const updateHighlight = async (idx: number, patch: Partial<HighlightItem>) => {
    const item = data.highlights[idx];
    setData((prev) => {
      const next = [...prev.highlights];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, highlights: next };
    });
    if (item.id && id) {
      try { await updateWorkshopHighlight(id, item.id, patch); } catch {}
    }
  };

  const removeHighlight = async (idx: number) => {
    const item = data.highlights[idx];
    if (item.id && id) {
      try { await deleteWorkshopHighlight(id, item.id); } catch {}
    }
    setData((prev) => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== idx) }));
  };

  const addItinerary = async () => {
    if (!id) { setError('请先保存活动再添加行程'); return; }
    const dayIndex = data.itinerary.length;
    try {
      const item = await addWorkshopItinerary(id, { dayIndex, title: `Day ${dayIndex + 1}`, content: '', sortOrder: dayIndex });
      setData((prev) => ({ ...prev, itinerary: [...prev.itinerary, item as any] }));
    } catch (err: any) { setError(err.message); }
  };

  const updateItinerary = async (idx: number, patch: Partial<ItineraryItem>) => {
    const item = data.itinerary[idx];
    setData((prev) => {
      const next = [...prev.itinerary];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, itinerary: next };
    });
    if (item.id && id) {
      try { await updateWorkshopItinerary(id, item.id, patch); } catch {}
    }
  };

  const removeItinerary = async (idx: number) => {
    const item = data.itinerary[idx];
    if (item.id && id) {
      try { await deleteWorkshopItinerary(id, item.id); } catch {}
    }
    setData((prev) => ({ ...prev, itinerary: prev.itinerary.filter((_, i) => i !== idx) }));
  };

  const addFeeItem = async (type: string) => {
    if (!id) { setError('请先保存活动再添加费用项'); return; }
    try {
      const item = await addWorkshopFeeItem(id, { type, content: '', sortOrder: data.feeItems.filter((f) => f.type === type).length });
      setData((prev) => ({ ...prev, feeItems: [...prev.feeItems, item as any] }));
    } catch (err: any) { setError(err.message); }
  };

  const updateFeeItem = async (idx: number, patch: Partial<FeeItem>) => {
    const item = data.feeItems[idx];
    setData((prev) => {
      const next = [...prev.feeItems];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, feeItems: next };
    });
    if (item.id && id) {
      try { await updateWorkshopFeeItem(id, item.id, patch); } catch {}
    }
  };

  const removeFeeItem = async (idx: number) => {
    const item = data.feeItems[idx];
    if (item.id && id) {
      try { await deleteWorkshopFeeItem(id, item.id); } catch {}
    }
    setData((prev) => ({ ...prev, feeItems: prev.feeItems.filter((_, i) => i !== idx) }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Container>
    );
  }

  const sectionSx = { mb: 6 };
  const sectionTitle = { fontSize: '1.2rem', fontWeight: 700, color: 'primary.main', mb: 3 };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={() => navigate('/admin/workshops')} sx={{ color: 'text.secondary' }}><ArrowBack /></IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{isNew ? '新增研学活动' : '编辑研学活动'}</Typography>
        </Stack>
        <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={saving}
          sx={{ bgcolor: 'primary.main', color: '#000', '&:hover': { bgcolor: 'primary.main', opacity: 0.9 } }}>
          {saving ? '保存中...' : '保存'}
        </Button>
      </Box>

      <Box sx={sectionSx}>
        <Typography sx={sectionTitle}>基本信息</Typography>
        <Card sx={{ bgcolor: '#111', border: '1px solid #222' }}>
          <CardContent>
            <Stack spacing={2}>
              <TextField label="标题" value={data.title} onChange={(e) => update({ title: e.target.value })} fullWidth required />
              <TextField label="URL标识" value={data.slug} onChange={(e) => update({ slug: e.target.value })} fullWidth required helperText="英文，如 kenya-expedition" />
              <TextField label="副标题" value={data.subtitle} onChange={(e) => update({ subtitle: e.target.value })} fullWidth />
              <TextField label="摘要" value={data.summary} onChange={(e) => update({ summary: e.target.value })} fullWidth multiline rows={2} />
              <TextField label="活动介绍" value={data.content} onChange={(e) => update({ content: e.target.value })} fullWidth multiline rows={6} />
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box sx={sectionSx}>
        <Typography sx={sectionTitle}>封面图</Typography>
        <Card sx={{ bgcolor: '#111', border: '1px solid #222' }}>
          <CardContent>
            <ImageUploader value={data.coverImage} onChange={(url) => update({ coverImage: url })} label="封面图" aspectRatio={16 / 9} />
          </CardContent>
        </Card>
      </Box>

      <Box sx={sectionSx}>
        <Typography sx={sectionTitle}>关键信息</Typography>
        <Card sx={{ bgcolor: '#111', border: '1px solid #222' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="价格" value={data.priceText} onChange={(e) => update({ priceText: e.target.value })} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="地点" value={data.location} onChange={(e) => update({ location: e.target.value })} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="等级" value={data.level} onChange={(e) => update({ level: e.target.value })} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="时长" value={data.durationText} onChange={(e) => update({ durationText: e.target.value })} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="名额" type="number" value={data.capacity} onChange={(e) => update({ capacity: parseInt(e.target.value) || 0 })} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="已报名" type="number" value={data.enrolledCount} onChange={(e) => update({ enrolledCount: parseInt(e.target.value) || 0 })} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="开始日期" type="date" value={data.startDate} onChange={(e) => update({ startDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="结束日期" type="date" value={data.endDate} onChange={(e) => update({ endDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <Box sx={sectionSx}>
        <Typography sx={sectionTitle}>活动亮点</Typography>
        <Stack spacing={2}>
          {data.highlights.map((h, idx) => (
            <Card key={idx} sx={{ bgcolor: '#111', border: '1px solid #222' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <IconButton onClick={() => removeHighlight(idx)} sx={{ color: '#f44336', mt: 0.5 }}><Delete /></IconButton>
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <TextField label="标题" value={h.title} onChange={(e) => updateHighlight(idx, { title: e.target.value })} fullWidth size="small" />
                    <TextField label="内容" value={h.content} onChange={(e) => updateHighlight(idx, { content: e.target.value })} fullWidth multiline rows={2} size="small" />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
          <Button startIcon={<Add />} onClick={addHighlight} sx={{ color: 'primary.main', alignSelf: 'flex-start' }}>添加亮点</Button>
        </Stack>
      </Box>

      <Box sx={sectionSx}>
        <Typography sx={sectionTitle}>行程安排</Typography>
        <Stack spacing={2}>
          {data.itinerary.map((d, idx) => (
            <Card key={idx} sx={{ bgcolor: '#111', border: '1px solid #222' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <IconButton onClick={() => removeItinerary(idx)} sx={{ color: '#f44336', mt: 0.5 }}><Delete /></IconButton>
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={2}>
                      <Chip label={`Day ${d.dayIndex + 1}`} sx={{ bgcolor: 'rgba(204,255,0,0.15)', color: 'primary.main' }} />
                      <TextField label="标题" value={d.title} onChange={(e) => updateItinerary(idx, { title: e.target.value })} fullWidth size="small" />
                    </Stack>
                    <TextField label="内容" value={d.content} onChange={(e) => updateItinerary(idx, { content: e.target.value })} fullWidth multiline rows={2} size="small" />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
          <Button startIcon={<Add />} onClick={addItinerary} sx={{ color: 'primary.main', alignSelf: 'flex-start' }}>添加行程</Button>
        </Stack>
      </Box>

      <Box sx={sectionSx}>
        <Typography sx={sectionTitle}>费用说明</Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>费用包含</Typography>
            <Stack spacing={1}>
              {data.feeItems.map((f, idx) => {
                if (f.type !== 'included') return null;
                return (
                  <Stack key={idx} direction="row" spacing={1} alignItems="center">
                    <IconButton onClick={() => removeFeeItem(idx)} sx={{ color: '#f44336' }} size="small"><Delete fontSize="small" /></IconButton>
                    <TextField value={f.content} onChange={(e) => updateFeeItem(idx, { content: e.target.value })} fullWidth size="small" placeholder="费用包含项目" />
                  </Stack>
                );
              })}
              <Button startIcon={<Add />} onClick={() => addFeeItem('included')} size="small" sx={{ color: 'primary.main' }}>添加</Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, color: '#888', fontWeight: 600 }}>费用不含</Typography>
            <Stack spacing={1}>
              {data.feeItems.map((f, idx) => {
                if (f.type !== 'excluded') return null;
                return (
                  <Stack key={idx} direction="row" spacing={1} alignItems="center">
                    <IconButton onClick={() => removeFeeItem(idx)} sx={{ color: '#f44336' }} size="small"><Delete fontSize="small" /></IconButton>
                    <TextField value={f.content} onChange={(e) => updateFeeItem(idx, { content: e.target.value })} fullWidth size="small" placeholder="费用不含项目" />
                  </Stack>
                );
              })}
              <Button startIcon={<Add />} onClick={() => addFeeItem('excluded')} size="small" sx={{ color: '#888' }}>添加</Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ borderColor: '#222', my: 4 }} />

      <Box sx={sectionSx}>
        <Typography sx={sectionTitle}>设置</Typography>
        <Card sx={{ bgcolor: '#111', border: '1px solid #222' }}>
          <CardContent>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>状态</InputLabel>
                <Select value={data.status} label="状态" onChange={(e) => update({ status: e.target.value as WorkshopStatus })}>
                  {Object.entries(statusMap).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="排序" type="number" value={data.sortOrder} onChange={(e) => update({ sortOrder: parseInt(e.target.value) || 0 })} fullWidth />
              <Stack direction="row" spacing={4}>
                <FormControlLabel control={<Switch checked={data.isFeatured} onChange={(e) => update({ isFeatured: e.target.checked })} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' } }} />} label="精选" />
                <FormControlLabel control={<Switch checked={data.isPublished} onChange={(e) => update({ isPublished: e.target.checked })} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' } }} />} label="发布" />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default WorkshopEditorPage;

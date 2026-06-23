import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Container, Grid, IconButton, CircularProgress, Pagination, Stack, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Delete, ContentCopy, Check } from '@mui/icons-material';
import { getMediaList, deleteMedia, type MediaItem } from '@/api/media';
import ImageUploader from '@/components/ui/ImageUploader';

const MediaPage = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadMedia = useCallback(() => {
    setLoading(true);
    setError('');
    getMediaList({ page, pageSize: 20 })
      .then((res) => {
        setItems(res.items || []);
        setTotalPages(res.pagination?.totalPages || 1);
      })
      .catch((err) => {
        setItems([]);
        setError(err.message || '加载失败');
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { loadMedia(); }, [loadMedia]);

  const handleCopyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMedia(deleteTarget.id);
      setDeleteTarget(null);
      loadMedia();
    } catch (err: any) {
      setError(err.message || '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  const handleUploadSuccess = () => {
    loadMedia();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(244,67,54,0.1)', color: '#f44336' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>媒体库</Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>上传新图片</Typography>
        <Box sx={{ maxWidth: 400 }}>
          <ImageUploader
            value=""
            onChange={handleUploadSuccess}
            enableCrop={false}
          />
        </Box>
      </Box>

      <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
        已上传 ({items.length})
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
      ) : items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>暂无已上传的图片</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {items.map((item) => (
              <Grid key={item.id} size={{ xs: 6, sm: 4, md: 3 }}>
                <Box
                  sx={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid #333',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <Box
                    component="img"
                    src={item.url}
                    alt={item.fileName}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleCopyUrl(item.url, item.id)}
                      sx={{ bgcolor: 'rgba(0,0,0,0.7)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' } }}
                    >
                      {copiedId === item.id ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(item)}
                      sx={{ bgcolor: 'rgba(0,0,0,0.7)', color: '#f44336', '&:hover': { bgcolor: 'rgba(244,67,54,0.3)' } }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 1, bgcolor: 'rgba(0,0,0,0.7)' }}>
                    <Typography variant="caption" sx={{ color: '#aaa', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.fileName}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
          {totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                sx={{ '& .MuiPaginationItem-root': { color: 'text.secondary' } }}
              />
            </Stack>
          )}
        </>
      )}

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>确定要删除 "{deleteTarget?.fileName}" 吗？此操作不可撤销。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>取消</Button>
          <Button onClick={handleDelete} disabled={deleting} sx={{ color: '#f44336' }}>
            {deleting ? '删除中...' : '删除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MediaPage;

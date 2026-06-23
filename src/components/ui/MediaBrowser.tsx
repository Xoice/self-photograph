import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Dialog, DialogTitle, DialogContent, Grid, IconButton, CircularProgress, Pagination, Stack, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { Close, ContentCopy, Check } from '@mui/icons-material';
import { getMediaList, type MediaItem } from '@/api/media';

interface MediaBrowserProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

const MediaBrowser = ({ open, onClose, onSelect }: MediaBrowserProps) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadMedia = useCallback(() => {
    setLoading(true);
    getMediaList({ page, pageSize: 20, type: undefined })
      .then((res) => {
        setItems(res.items || []);
        setTotalPages(res.pagination?.totalPages || 1);
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    if (open) {
      loadMedia();
    }
  }, [open, loadMedia]);

  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  const handleCopyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        媒体库
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              暂无已上传的图片
            </Typography>
          </Box>
        ) : (
          <>
            <TextField
              size="small"
              placeholder="搜索文件名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Grid container spacing={2}>
              {items.filter((item) => !searchQuery || item.fileName.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                <Grid key={item.id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Box
                    onClick={() => handleSelect(item.url)}
                    sx={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        '& .overlay': { opacity: 1 },
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={item.url}
                      alt={item.fileName}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Box
                      className="overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'white' }}>选择</Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(item.url, item.id);
                      }}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
                      }}
                    >
                      {copiedId === item.id ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
                    </IconButton>
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
      </DialogContent>
    </Dialog>
  );
};

export default MediaBrowser;

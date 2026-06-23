import { useState, useRef, useCallback } from 'react';
import { Box, Typography, IconButton, LinearProgress, Stack, Button } from '@mui/material';
import { Delete, AddPhotoAlternate, PhotoLibrary } from '@mui/icons-material';
import { uploadMedia, type UploadResult } from '@/api/media';
import ImageCropper from './ImageCropper';
import MediaBrowser from './MediaBrowser';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: number;
  enableCrop?: boolean;
}

const ImageUploader = ({ value, onChange, label = '上传图片', aspectRatio = 16 / 9, enableCrop = true }: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [browserOpen, setBrowserOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const doUpload = useCallback(async (file: File) => {
    setUploading(true);
    setError('');
    setProgress(0);
    try {
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 200);
      const result: UploadResult = await uploadMedia(file);
      clearInterval(interval);
      setProgress(100);
      onChange(result.url);
    } catch (err: any) {
      setError(err.message || '上传失败');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  }, [onChange]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('仅支持图片文件');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB');
      return;
    }
    if (enableCrop) {
      setCropFile(file);
    } else {
      doUpload(file);
    }
  }, [enableCrop, doUpload]);

  const handleCropDone = useCallback((croppedFile: File) => {
    setCropFile(null);
    doUpload(croppedFile);
  }, [doUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    onChange('');
    setError('');
  }, [onChange]);

  const handleBrowserSelect = useCallback((url: string) => {
    onChange(url);
    setBrowserOpen(false);
  }, [onChange]);

  return (
    <>
      {value ? (
        <Box>
          {label && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{label}</Typography>
          )}
          <Box sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', border: '1px solid #333' }}>
            <Box
              component="img"
              src={value}
              alt="预览"
              sx={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
            />
            <IconButton
              onClick={handleRemove}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.7)',
                color: '#f44336',
                '&:hover': { bgcolor: 'rgba(244,67,54,0.2)' },
              }}
              size="small"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Typography
              variant="body2"
              onClick={() => fileInputRef.current?.click()}
              sx={{ color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
            >
              重新上传
            </Typography>
            <Typography variant="body2" sx={{ color: '#555' }}>|</Typography>
            <Typography
              variant="body2"
              onClick={() => setBrowserOpen(true)}
              sx={{ color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
            >
              从媒体库选择
            </Typography>
          </Stack>
        </Box>
      ) : (
        <Box>
          {label && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{label}</Typography>
          )}
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            sx={{
              border: '2px dashed',
              borderColor: dragOver ? 'primary.main' : '#333',
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              transition: 'all 0.3s',
              bgcolor: dragOver ? 'rgba(204,255,0,0.05)' : 'transparent',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(204,255,0,0.05)' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 100,
            }}
          >
            {uploading ? (
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>上传中...</Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }} />
              </Box>
            ) : (
              <Stack spacing={1.5} alignItems="center">
                <AddPhotoAlternate sx={{ fontSize: 40, color: 'text.secondary' }} />
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    startIcon={<AddPhotoAlternate />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ textTransform: 'none', color: 'text.secondary' }}
                  >
                    上传新图
                  </Button>
                  <Button
                    size="small"
                    startIcon={<PhotoLibrary />}
                    onClick={() => setBrowserOpen(true)}
                    sx={{ textTransform: 'none', color: 'text.secondary' }}
                  >
                    从媒体库选择
                  </Button>
                </Stack>
                <Typography variant="caption" sx={{ color: '#555' }}>
                  支持拖拽上传，JPG/PNG/WebP，最大 10MB
                </Typography>
              </Stack>
            )}
          </Box>
          {error && (
            <Typography variant="caption" sx={{ color: '#f44336', mt: 1, display: 'block' }}>{error}</Typography>
          )}
        </Box>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      <ImageCropper
        file={cropFile}
        onCrop={handleCropDone}
        onCancel={() => setCropFile(null)}
        aspectRatio={aspectRatio}
      />

      <MediaBrowser
        open={browserOpen}
        onClose={() => setBrowserOpen(false)}
        onSelect={handleBrowserSelect}
      />
    </>
  );
};

export default ImageUploader;

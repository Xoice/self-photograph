import { useEffect, useCallback } from 'react';
import { Dialog, IconButton, Box, Typography } from '@mui/material';
import { Close, ChevronLeft, ChevronRight } from '@mui/icons-material';

interface LightboxProps {
  open: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  alt?: string;
}

export default function Lightbox({ open, images, currentIndex, onClose, onNavigate, alt }: LightboxProps) {
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(currentIndex - 1);
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) onNavigate(currentIndex + 1);
  }, [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    if (!open || images.length === 0) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, images.length, handlePrev, handleNext, onClose]);

  if (images.length === 0) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{ sx: { bgcolor: 'rgba(0,0,0,0.95)', boxShadow: 'none' } }}
    >
      <IconButton
        onClick={onClose}
        aria-label="关闭"
        autoFocus
        sx={{ position: 'absolute', top: 16, right: 16, color: 'white', zIndex: 1 }}
      >
        <Close />
      </IconButton>

      {images.length > 1 && (
        <>
          <IconButton
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="上一张"
            sx={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              color: 'white', zIndex: 1,
              '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' },
            }}
          >
            <ChevronLeft sx={{ fontSize: 48 }} />
          </IconButton>
          <IconButton
            onClick={handleNext}
            disabled={currentIndex === images.length - 1}
            aria-label="下一张"
            sx={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              color: 'white', zIndex: 1,
              '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' },
            }}
          >
            <ChevronRight sx={{ fontSize: 48 }} />
          </IconButton>
        </>
      )}

      <Box
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', height: '100%', p: 8,
        }}
      >
        <Box
          component="img"
          src={images[currentIndex]}
          alt={alt ? `${alt} ${currentIndex + 1}` : ''}
          tabIndex={0}
          role="img"
          sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </Box>

      {images.length > 1 && (
        <Box sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {currentIndex + 1} / {images.length}
          </Typography>
        </Box>
      )}
    </Dialog>
  );
}

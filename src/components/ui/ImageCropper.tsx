import { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

interface ImageCropperProps {
  file: File | null;
  onCrop: (file: File) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

const presetRatios = [
  { label: '自由', value: 0 },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
];

interface ImageBounds {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

function getImageBounds(img: HTMLImageElement, containerWidth: number, containerHeight: number): ImageBounds {
  const imgRatio = img.width / img.height;
  const containerRatio = containerWidth / containerHeight;

  let displayWidth: number;
  let displayHeight: number;

  if (imgRatio > containerRatio) {
    displayWidth = containerWidth;
    displayHeight = containerWidth / imgRatio;
  } else {
    displayHeight = containerHeight;
    displayWidth = containerHeight * imgRatio;
  }

  return {
    offsetX: (containerWidth - displayWidth) / 2,
    offsetY: (containerHeight - displayHeight) / 2,
    width: displayWidth,
    height: displayHeight,
  };
}

const ImageCropper = ({ file, onCrop, onCancel, aspectRatio = 0 }: ImageCropperProps) => {
  const [imageSrc, setImageSrc] = useState('');
  const [ratio, setRatio] = useState(aspectRatio);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<ImageBounds>({ offsetX: 0, offsetY: 0, width: 0, height: 0 });

  // aspectRatio prop 变化时同步内部 ratio（如切换不同上传场景）
  useEffect(() => {
    setRatio(aspectRatio);
  }, [aspectRatio]);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImageSrc(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, [file]);

  // imageSrc 加载后计算图片显示区域和初始裁剪框
  useEffect(() => {
    if (!imageSrc || !containerRef.current) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const container = containerRef.current;
      if (!container) return;

      const bounds = getImageBounds(img, container.clientWidth, container.clientHeight);
      boundsRef.current = bounds;

      const cropW = ratio > 0 ? bounds.height * ratio : bounds.width * 0.8;
      const cropH = ratio > 0 ? bounds.height : bounds.height * 0.8;

      setCropArea({
        x: bounds.offsetX + (bounds.width - cropW) / 2,
        y: bounds.offsetY + (bounds.height - cropH) / 2,
        width: cropW,
        height: cropH,
      });
    };
    img.src = imageSrc;
  }, [imageSrc, ratio]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: clientX - rect.left - cropArea.x,
      y: clientY - rect.top - cropArea.y,
    });
  }, [cropArea]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const bounds = boundsRef.current;

    const posX = clientX - rect.left;
    const posY = clientY - rect.top;

    const newX = Math.max(bounds.offsetX, Math.min(posX - dragStart.x, bounds.offsetX + bounds.width - cropArea.width));
    const newY = Math.max(bounds.offsetY, Math.min(posY - dragStart.y, bounds.offsetY + bounds.height - cropArea.height));

    setCropArea((prev) => ({ ...prev, x: newX, y: newY }));
  }, [isDragging, dragStart, cropArea]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCrop = useCallback(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bounds = getImageBounds(img, container.clientWidth, container.clientHeight);

    const scaleX = img.width / bounds.width;
    const scaleY = img.height / bounds.height;

    const sx = (cropArea.x - bounds.offsetX) * scaleX;
    const sy = (cropArea.y - bounds.offsetY) * scaleY;
    const sw = cropArea.width * scaleX;
    const sh = cropArea.height * scaleY;

    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    const isPng = file?.type === 'image/png';
    canvas.toBlob((blob) => {
      if (blob) {
        const outType = isPng ? 'image/png' : 'image/jpeg';
        const outName = file?.name || (isPng ? 'cropped.png' : 'cropped.jpg');
        const croppedFile = new File([blob], outName, { type: outType });
        onCrop(croppedFile);
      }
    }, isPng ? 'image/png' : 'image/jpeg', isPng ? undefined : 0.92);
  }, [cropArea, file, onCrop]);

  if (!file) return null;

  return (
    <Dialog open={!!file} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>裁剪图片</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1}>
            {presetRatios.map((preset) => (
              <Button
                key={preset.label}
                size="small"
                variant={ratio === preset.value ? 'contained' : 'outlined'}
                onClick={() => setRatio(preset.value)}
                sx={{
                  textTransform: 'none',
                  bgcolor: ratio === preset.value ? 'primary.main' : undefined,
                  color: ratio === preset.value ? '#000' : undefined,
                }}
              >
                {preset.label}
              </Button>
            ))}
          </Stack>

          <Box
            ref={containerRef}
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={(e) => { e.preventDefault(); const t = e.touches[0]; if (t) handleStart(t.clientX, t.clientY); }}
            onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; if (t) handleMove(t.clientX, t.clientY); }}
            onTouchEnd={handleEnd}
            sx={{
              position: 'relative',
              width: '100%',
              height: 400,
              bgcolor: '#000',
              borderRadius: 1,
              overflow: 'hidden',
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
          >
            {imageSrc && (
              <Box
                component="img"
                src={imageSrc}
                sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', userSelect: 'none' }}
                draggable={false}
              />
            )}
            <Box
              sx={{
                position: 'absolute',
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height,
                border: '2px solid #E0A458',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
                pointerEvents: 'none',
              }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>取消</Button>
        <Button onClick={handleCrop} sx={{ color: 'primary.main' }}>确认裁剪</Button>
      </DialogActions>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Dialog>
  );
};

export default ImageCropper;

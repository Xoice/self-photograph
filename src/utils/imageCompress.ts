/**
 * 前端图片压缩工具。
 * 使用 Canvas API，不需要外部依赖。
 * 当图片超过指定大小时，逐步降低质量和尺寸直到达标。
 * 现代浏览器（Chrome 81+/Firefox 77+）已自动处理 EXIF 方向，
 * 无需手动交换宽高或应用旋转变换。
 */

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/** 将 File 加载为 HTMLImageElement */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片加载失败')); };
    img.src = url;
  });
}

/** 用 Canvas 将图片绘制并导出 */
function canvasToBlob(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number,
  type: 'image/jpeg' | 'image/png' = 'image/jpeg',
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) { reject(new Error('Canvas 不可用')); return; }
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob(
      (blob) => { if (blob) resolve(blob); else reject(new Error('Canvas 导出失败')); },
      type,
      type === 'image/png' ? undefined : quality,
    );
  });
}

/**
 * 压缩图片文件。
 * @param file 原始图片文件
 * @param maxSize 最大字节数，默认 10MB
 * @returns 压缩后的 File（如果未超限则返回原文件）
 */
export async function compressImage(
  file: File,
  maxSize: number = MAX_SIZE,
): Promise<File> {
  if (file.size <= maxSize) return file;
  if (!file.type.startsWith('image/')) return file;

  const img = await loadImage(file);
  const outWidth = img.naturalWidth;
  const outHeight = img.naturalHeight;

  const isPng = file.type === 'image/png';
  const outType: 'image/jpeg' | 'image/png' = isPng ? 'image/png' : 'image/jpeg';
  const outExt = isPng ? '.png' : '.jpg';

  const qualities = [0.85, 0.7, 0.5, 0.3];
  for (const quality of qualities) {
    const blob = await canvasToBlob(img, outWidth, outHeight, quality, outType);
    if (blob.size <= maxSize) {
      return new File([blob], file.name.replace(/\.\w+$/, outExt), {
        type: outType, lastModified: Date.now(),
      });
    }
  }

  let scale = 0.8;
  while (scale > 0.1) {
    const sw = Math.round(outWidth * scale);
    const sh = Math.round(outHeight * scale);
    const blob = await canvasToBlob(img, sw, sh, 0.5, outType);
    if (blob.size <= maxSize) {
      return new File([blob], file.name.replace(/\.\w+$/, outExt), {
        type: outType, lastModified: Date.now(),
      });
    }
    scale -= 0.2;
  }

  const blob = await canvasToBlob(img, Math.round(outWidth * 0.1), Math.round(outHeight * 0.1), 0.3, outType);
  return new File([blob], file.name.replace(/\.\w+$/, outExt), {
    type: outType, lastModified: Date.now(),
  });
}

/** 格式化文件大小为可读字符串 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
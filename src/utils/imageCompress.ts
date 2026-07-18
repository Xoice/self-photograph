/**
 * 前端图片压缩工具。
 * 使用 Canvas API，不需要外部依赖。
 * 当图片超过指定大小时，逐步降低质量和尺寸直到达标。
 */

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * 将 File 加载为 HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };
    img.src = url;
  });
}

/**
 * 用 Canvas 将图片绘制并导出为指定质量的 JPEG Blob
 */
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
    if (!ctx) {
      reject(new Error('Canvas 不可用'));
      return;
    }
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas 导出失败'));
      },
      type,
      type === 'image/png' ? undefined : quality,
    );
  });
}

/**
 * 压缩图片文件。
 * 如果文件小于 maxSize，直接返回原文件。
 * 否则逐步降低质量（0.85 -> 0.7 -> 0.5）和尺寸（每次缩小 20%）直到达标。
 *
 * @param file 原始图片文件
 * @param maxSize 最大字节数，默认 10MB
 * @returns 压缩后的 File（如果未超限则返回原文件）
 */
export async function compressImage(
  file: File,
  maxSize: number = MAX_SIZE,
): Promise<File> {
  // 小于限制，直接返回
  if (file.size <= maxSize) {
    return file;
  }

  // 非图片类型不压缩
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const img = await loadImage(file);

  const width = img.naturalWidth;
  const height = img.naturalHeight;
  // PNG 保留透明度：无损缩尺寸，不走 JPEG 质量梯度
  const isPng = file.type === 'image/png';
  const outType: 'image/jpeg' | 'image/png' = isPng ? 'image/png' : 'image/jpeg';
  const outExt = isPng ? '.png' : '.jpg';

// 质量梯度：逐步降低
  const qualities = [0.85, 0.7, 0.5, 0.3];

  for (const quality of qualities) {
    const blob = await canvasToBlob(img, width, height, quality, outType);
    if (blob.size <= maxSize) {
      return new File([blob], file.name.replace(/\.\w+$/, outExt), {
        type: outType,
        lastModified: Date.now(),
      });
    }
  }

  // 质量已到最低仍超限，开始缩小尺寸
  let scale = 0.8;
  while (scale > 0.1) {
    const scaledWidth = Math.round(width * scale);
    const scaledHeight = Math.round(height * scale);
    const blob = await canvasToBlob(img, scaledWidth, scaledHeight, 0.5, outType);
    if (blob.size <= maxSize) {
      return new File([blob], file.name.replace(/\.\w+$/, outExt), {
        type: outType,
        lastModified: Date.now(),
      });
    }
    scale -= 0.2;
  }

  // 极端情况：缩到很小仍然超限，返回最后的结果
  const blob = await canvasToBlob(img, Math.round(width * 0.1), Math.round(height * 0.1), 0.3, outType);
  return new File([blob], file.name.replace(/\.\w+$/, outExt), {
    type: outType,
    lastModified: Date.now(),
  });
}

/**
 * 格式化文件大小为可读字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

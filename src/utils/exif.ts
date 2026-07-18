/**
 * JPEG EXIF Orientation 解析器。
 * 从 JPEG 文件的 APP1 段读取 Orientation 标签值，
 * 用于 Canvas 处理时修正手机竖拍等场景的方向。
 *
 * Orientation 值含义：
 *   1 = 正常, 2 = 水平翻转, 3 = 180° 旋转,
 *   4 = 垂直翻转, 5 = 顺时针 90° + 水平翻转,
 *   6 = 顺时针 90°, 7 = 逆时针 90° + 水平翻转,
 *   8 = 逆时针 90°
 */

function readOrientationFromExif(view: DataView, start: number): number {
  const exif = String.fromCharCode(
    view.getUint8(start),
    view.getUint8(start + 1),
    view.getUint8(start + 2),
    view.getUint8(start + 3),
  );
  if (exif !== 'Exif') return 1;

  const littleEndian = view.getUint16(start + 6, false) === 0x4949;
  const ifdOffset = view.getUint32(start + 10, littleEndian) + start + 6;
  const entries = view.getUint16(ifdOffset, littleEndian);

  for (let i = 0; i < entries; i++) {
    const off = ifdOffset + 2 + i * 12;
    if (view.getUint16(off, littleEndian) === 0x0112) {
      return view.getUint16(off + 8, littleEndian);
    }
  }
  return 1;
}

export function readExifOrientation(file: File): Promise<number> {
  if (!file.type.startsWith('image/')) return Promise.resolve(1);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const view = new DataView(e.target!.result as ArrayBuffer);
        if (view.getUint16(0, false) !== 0xffd8) { resolve(1); return; }
        let offset = 2;
        const len = view.byteLength;
        while (offset < len - 2) {
          if (view.getUint8(offset) !== 0xff) { resolve(1); return; }
          const marker = view.getUint8(offset + 1);
          if (marker === 0xe1) {
            resolve(readOrientationFromExif(view, offset + 4));
            return;
          }
          offset += 2 + view.getUint16(offset + 2, false);
        }
      } catch { /* ignore corrupt EXIF */ }
      resolve(1);
    };
    reader.onerror = () => resolve(1);
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
}
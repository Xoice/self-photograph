import { Box } from '@mui/material';
import type { BoxProps } from '@mui/material';

interface ResponsiveImageProps extends Omit<BoxProps, 'component'> {
  src: string;
  alt: string;
  /** 图片在视口中的大致宽度，用于 sizes 属性。默认 '100vw' */
  sizes?: string;
  /**
   * srcset 候选项，格式 { url, width }[]。
   * 后端支持多尺寸后可传入；当前留空时只输出原 src。
   */
  srcSet?: { url: string; width: number }[];
  /** 是否懒加载，默认 true */
  lazy?: boolean;
}

/**
 * 统一的图片渲染组件。
 * - 自动添加 loading="lazy" + decoding="async"
 * - 支持 sizes 属性让浏览器更好地做下载决策
 * - 预留 srcset 接口，后端出多尺寸后零改即可启用
 * - 非装饰性图片必须有 alt（通过组件签名强制）
 */
const ResponsiveImage = ({
  src,
  alt,
  sizes = '100vw',
  srcSet,
  lazy = true,
  sx,
  ...rest
}: ResponsiveImageProps) => {
  const srcSetStr = srcSet
    ? srcSet.map((s) => `${s.url} ${s.width}w`).join(', ')
    : undefined;

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sizes={sizes}
      {...(srcSetStr ? { srcSet: srcSetStr } : {})}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      sx={sx}
      {...rest}
    />
  );
};

export default ResponsiveImage;

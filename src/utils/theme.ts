import type { SxProps } from '@mui/material/styles';
import type { Theme } from '@mui/material';

/**
 * 卡片悬停交互的共享样式。
 * 各 section 的 Card hover 逻辑高度重复，集中到一处。
 */
export const cardHoverSx: SxProps<Theme> = {
  transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    borderColor: 'rgba(255,255,255,0.2)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  },
};

/**
 * GSAP 入场动画的共享配置。
 * 从下方淡入，配合 scrollTrigger。
 */
export const fadeUpFrom = {
  y: 50,
  opacity: 0,
};

export const fadeUpTo = {
  y: 0,
  opacity: 1,
  duration: 0.8,
  stagger: 0.15,
  ease: 'power3.out',
};

export const sectionTitleFrom = {
  y: 30,
  opacity: 0,
};

export const sectionTitleTo = {
  y: 0,
  opacity: 1,
  duration: 1,
  ease: 'power3.out',
};

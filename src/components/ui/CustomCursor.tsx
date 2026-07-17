import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import gsap from 'gsap';

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.2,
        ease: 'power2.out',
      });
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select')) {
        cursorRef.current?.classList.add('text-input');
      } else if (target.closest('a, button, .interactable')) {
        cursorRef.current?.classList.add('hovered');
      }
    };

    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select')) {
        cursorRef.current?.classList.remove('text-input');
      } else if (target.closest('a, button, .interactable')) {
        cursorRef.current?.classList.remove('hovered');
      }
    };

    const onDown = () => {
      cursorRef.current?.classList.remove('hovered');
      cursorRef.current?.classList.remove('text-input');
      cursorRef.current?.classList.add('pressed');
    };
    const onUp = () => {
      cursorRef.current?.classList.remove('pressed');
    };

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <Box
      ref={cursorRef}
      sx={{
        display: { xs: 'none', md: 'block' },
        position: 'fixed',
        top: 0,
        left: 0,
        width: '20px',
        height: '20px',
        border: '1px solid #EAEAEA',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
        mixBlendMode: 'difference',
        transition: 'width 0.3s, height 0.3s, background-color 0.3s, border-radius 0.3s',
        '&.hovered': {
          width: '50px',
          height: '50px',
          backgroundColor: 'rgba(224, 164, 88, 0.3)',
          borderColor: 'primary.main',
        },
        '&.pressed': {
          width: '12px',
          height: '12px',
          backgroundColor: 'primary.main',
          borderColor: 'transparent',
        },
        '&.text-input': {
          width: '2px',
          height: '24px',
          borderRadius: 0,
          backgroundColor: 'primary.main',
          borderColor: 'transparent',
        },
      }}
    />
  );
};

export default CustomCursor;

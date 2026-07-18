import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isFirstRender = useRef(true);
  const [transitionStage, setTransitionStage] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 路由切换时触发退场动画，属外部状态同步
    setTransitionStage('exit');
    const timer = setTimeout(() => {
      setTransitionStage('enter');
    }, 150);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <Box
      sx={{
        opacity: transitionStage === 'enter' ? 1 : 0,
        transform: transitionStage === 'enter' ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
    >
      {children}
    </Box>
  );
}

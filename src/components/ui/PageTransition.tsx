import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isFirstRender = useRef(true);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 路由切换时触发入场动画，属外部状态同步
    setFadeKey((k) => k + 1);
  }, [location.pathname]);

  return (
    <Box
      key={fadeKey}
      sx={{
        animation: 'pageEnter 0.3s ease',
        '@keyframes pageEnter': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {children}
    </Box>
  );
}

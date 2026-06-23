import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home } from '@mui/icons-material';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#050505', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Typography variant="h1" sx={{ fontSize: '8rem', fontWeight: 900, color: 'primary.main', lineHeight: 1 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ color: 'text.secondary', mb: 1 }}>
          页面不存在
        </Typography>
        <Typography variant="body2" sx={{ color: '#555', mb: 4 }}>
          你访问的页面可能已被移除或地址有误
        </Typography>
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => navigate('/')}
          sx={{
            bgcolor: 'primary.main',
            color: '#000',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            '&:hover': { bgcolor: 'primary.main', opacity: 0.9 },
          }}
        >
          返回首页
        </Button>
      </Container>
    </Box>
  );
}

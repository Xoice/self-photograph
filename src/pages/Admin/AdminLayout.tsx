import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Divider, CircularProgress } from '@mui/material';
import { Dashboard, Image, OndemandVideo, School, Logout, Menu as MenuIcon, Close, PhotoLibrary, Category, Mail, Settings, AccountCircle } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile } from '@/api/auth';

const menuItems = [
  { label: '概览', path: '/admin', icon: <Dashboard /> },
  { label: '作品管理', path: '/admin/works', icon: <Image /> },
  { label: '视频管理', path: '/admin/videos', icon: <OndemandVideo /> },
  { label: '研学管理', path: '/admin/workshops', icon: <School /> },
  { label: '分类管理', path: '/admin/categories', icon: <Category /> },
  { label: '线索管理', path: '/admin/leads', icon: <Mail /> },
  { label: '站点配置', path: '/admin/site-config', icon: <Settings /> },
  { label: '媒体库', path: '/admin/media', icon: <PhotoLibrary /> },
  { label: '账号设置', path: '/admin/account', icon: <AccountCircle /> },
];

const AdminLayout = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 路由变更后关闭侧栏，属外部状态同步
    setSidebarOpen(false);
  }, [location]);

  if (loading || !isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#050505', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const sidebarWidth = 240;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#050505', display: 'flex' }}>
      {/* Mobile header */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'calc(56px + env(safe-area-inset-top))',
          pt: 'env(safe-area-inset-top)',
          bgcolor: '#0a0a0a',
          borderBottom: '1px solid #222',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          zIndex: 1100,
        }}
      >
        <IconButton onClick={() => setSidebarOpen(true)} sx={{ color: 'inherit' }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          XOICE Admin
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      {/* Sidebar */}
      <Box
        sx={{
          width: { xs: 'min(86vw, 320px)', sm: sidebarWidth },
          flexShrink: 0,
          bgcolor: '#0a0a0a',
          borderRight: '1px solid #222',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        <SidebarContent user={user} location={location} onLogout={handleLogout} onNavigate={(path) => navigate(path)} />
      </Box>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            zIndex: 1100,
            display: { xs: 'block', md: 'none' },
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: sidebarWidth,
          bgcolor: '#0a0a0a',
          borderRight: '1px solid #222',
          zIndex: 1200,
          display: { xs: sidebarOpen ? 'flex' : 'none', md: 'none' },
          flexDirection: 'column',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, pt: 'calc(0.5rem + env(safe-area-inset-top))' }}>
          <IconButton onClick={() => setSidebarOpen(false)} sx={{ color: 'inherit' }}>
            <Close />
          </IconButton>
        </Box>
        <SidebarContent user={user} location={location} onLogout={handleLogout} onNavigate={(path) => navigate(path)} />
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: { xs: 0, md: `${sidebarWidth}px` },
          mt: { xs: 'calc(60px + env(safe-area-inset-top))', md: '48px' },
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

function SidebarContent({ user, location, onLogout, onNavigate }: { user: UserProfile | null; location: { pathname: string }; onLogout: () => void; onNavigate: (path: string) => void }) {
  return (
    <>
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '0.05em' }}>
          XOICE
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          管理后台
        </Typography>
      </Box>

      <Divider sx={{ borderColor: '#222' }} />

      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = item.path === '/admin/workshops'
            ? location.pathname.startsWith('/admin/workshops')
            : location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.path);
                }}
                sx={{
                  borderRadius: 1,
                  bgcolor: isActive ? 'rgba(224,164,88,0.1)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    color: isActive ? 'primary.main' : 'text.primary',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: '#222' }} />

      <Box sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontSize: '0.8rem' }}>
          {user?.name}
        </Typography>
        <ListItemButton
          onClick={onLogout}
          sx={{ borderRadius: 1, px: 2 }}
        >
          <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="退出登录" primaryTypographyProps={{ fontSize: '0.9rem' }} />
        </ListItemButton>
      </Box>
    </>
  );
}

export default AdminLayout;

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Stack, Fade, Paper, Drawer, IconButton, Divider, Collapse } from '@mui/material';
import { ExpandMore, Menu as MenuIcon, Close, ExpandLess } from '@mui/icons-material';
import { handleNavigation } from '../../utils/navigation';
import { useGalleryCategories } from '../../hooks/useGalleryCategories';

const navItems = [
  { label: '首页', id: 'hero' },
  { label: '画廊', id: 'gallery', hasSubmenu: true },
  { label: '影视', id: 'video' },
  { label: '摄影研学', id: 'photographystudy' },
  { label: '联系Xoice', id: 'connect' },
];

const Navbar = () => {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandMenu, setMobileExpandMenu] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: categories = [] } = useGalleryCategories();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 路由变更后关闭移动端抽屉，属外部状态同步
    setMobileOpen(false);
  }, [location]);

  const handleNavClick = (targetId: string) => {
    handleNavigation(targetId, navigate, location);
  };

  const handleMobileNavClick = (targetId: string) => {
    setMobileOpen(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => handleNavClick(targetId), 100);
  };

  const handleCategoryClick = (slug: string) => {
    setHoveredMenu(null);
    setMobileOpen(false);
    navigate(`/gallery?category=${slug}`);
  };

  const handleAllWorksClick = () => {
    setHoveredMenu(null);
    setMobileOpen(false);
    navigate('/gallery');
  };

  return (
    <>
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          top: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          px: { xs: 2, md: 4 },
          py: 2,
          pt: 'calc(1rem + env(safe-area-inset-top))',
          zIndex: 100,
          mixBlendMode: 'difference',
        }}
      >
        <IconButton
          className="interactable"
          aria-label="打开菜单"
          onClick={() => setMobileOpen(true)}
          sx={{
            display: { xs: 'flex', md: 'none' },
            color: 'inherit',
            p: 1,
          }}
        >
          <MenuIcon sx={{ fontSize: 28 }} />
        </IconButton>

        <Box sx={{ position: 'relative', display: { xs: 'none', md: 'flex' } }}>
          <Stack direction="row" spacing={4}>
            {navItems.map((item) => (
              <Box
                key={item.label}
                onMouseEnter={() => {
                  if (timerRef.current) clearTimeout(timerRef.current);
                  if (item.hasSubmenu) setHoveredMenu(item.label);
                }}
                onMouseLeave={() => {
                  if (item.hasSubmenu) {
                    timerRef.current = setTimeout(() => setHoveredMenu(null), 200);
                  }
                }}
                sx={{ position: 'relative' }}
              >
                <Typography
                  className="interactable"
                  component="a"
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.hasSubmenu) {
                      setHoveredMenu(hoveredMenu === item.label ? null : item.label);
                      handleNavClick(item.id);
                    } else {
                      handleNavClick(item.id);
                    }
                  }}
                  sx={{
                    fontSize: '0.9rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'inherit',
                    textDecoration: 'none',
                    cursor: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    position: 'relative',
                    pb: 0.5,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: hoveredMenu === item.label || !item.hasSubmenu ? '100%' : '0%',
                      height: '1px',
                      bgcolor: 'primary.main',
                      transition: 'width 0.3s ease',
                    },
                    '&:hover': { color: 'primary.main' },
                    '&:hover::after': { width: '100%' },
                  }}
                >
                  {item.label}
                  {item.hasSubmenu && <ExpandMore sx={{ fontSize: '1rem', transition: 'transform 0.3s', transform: hoveredMenu === item.label ? 'rotate(180deg)' : 'none' }} />}
                </Typography>

                {item.hasSubmenu && hoveredMenu === item.label && (
                  <Fade in={hoveredMenu === item.label}>
                    <Paper
                      elevation={0}
                      onMouseEnter={() => {
                        if (timerRef.current) clearTimeout(timerRef.current);
                        setHoveredMenu(item.label);
                      }}
                      onMouseLeave={() => {
                        timerRef.current = setTimeout(() => setHoveredMenu(null), 200);
                      }}
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        mt: 2,
                        p: 3,
                        minWidth: '400px',
                        bgcolor: 'rgba(5, 5, 5, 0.95)',
                        border: '1px solid #222',
                        backdropFilter: 'blur(10px)',
                        zIndex: 1000,
                      }}
                    >
                      <Stack spacing={3}>
                        <Typography
                          className="interactable"
                          component="a"
                          href="/gallery"
                          onClick={(e) => { e.preventDefault(); handleAllWorksClick(); }}
                          sx={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: 'primary.main',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            textDecoration: 'none',
                            cursor: 'none',
                            '&:hover': { opacity: 0.8 },
                          }}
                        >
                          全部作品
                        </Typography>
                        <Stack direction="row" spacing={6}>
                          {categories.map((category) => (
                            <Box key={category.id} sx={{ minWidth: '120px' }}>
                              <Typography
                                className="interactable"
                                component="a"
                                href={`/gallery?category=${category.slug}`}
                                onClick={(e) => { e.preventDefault(); handleCategoryClick(category.slug); }}
                                sx={{
                                  fontSize: '1rem',
                                  fontWeight: 700,
                                  mb: 1.5,
                                  color: 'primary.main',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.1em',
                                  textDecoration: 'none',
                                  cursor: 'none',
                                  display: 'block',
                                  '&:hover': { opacity: 0.8 },
                                }}
                              >
                                {category.name}
                              </Typography>
                              {category.children && category.children.length > 0 && (
                                <Stack spacing={0.5}>
                                  {category.children.map((sub) => (
                                    <Typography
                                      key={sub.id}
                                      className="interactable"
                                      component="a"
                                      href={`/gallery?category=${sub.slug}`}
                                      onClick={(e) => { e.preventDefault(); handleCategoryClick(sub.slug); }}
                                      sx={{
                                        fontSize: '0.85rem',
                                        color: '#EAEAEA',
                                        textDecoration: 'none',
                                        cursor: 'none',
                                        transition: 'all 0.3s',
                                        '&:hover': { color: 'primary.main', pl: 1 },
                                      }}
                                    >
                                      {sub.name}
                                    </Typography>
                                  ))}
                                </Stack>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      </Stack>
                    </Paper>
                  </Fade>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: 'min(86vw, 360px)', sm: 320 },
            maxWidth: '100%',
            bgcolor: '#050505',
            color: '#EAEAEA',
            pt: 'env(safe-area-inset-top)',
            pb: 'env(safe-area-inset-bottom)',
          },
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.1em' }}>
            XOICE
          </Typography>
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: 'inherit' }}>
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: '#222' }} />

        <Stack sx={{ p: { xs: 1, sm: 2 } }}>
          {navItems.map((item) => (
            <Box key={item.label}>
              <Box
                onClick={() => {
                  if (item.hasSubmenu) {
                    setMobileExpandMenu(mobileExpandMenu === item.label ? null : item.label);
                  } else {
                    handleMobileNavClick(item.id);
                  }
                }}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 2,
                  px: 2,
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                }}
              >
                <Typography sx={{ fontSize: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {item.label}
                </Typography>
                {item.hasSubmenu && (
                  mobileExpandMenu === item.label ? <ExpandLess /> : <ExpandMore />
                )}
              </Box>

              {item.hasSubmenu && (
                <Collapse in={mobileExpandMenu === item.label}>
                  <Stack sx={{ pl: 3, pb: 1 }}>
                    <Typography
                      onClick={handleAllWorksClick}
                      sx={{
                        fontSize: '0.9rem',
                        color: 'primary.main',
                        fontWeight: 600,
                        py: 1,
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 },
                      }}
                    >
                      全部作品
                    </Typography>
                    {categories.map((category) => (
                      <Box key={category.id} sx={{ py: 1 }}>
                        <Typography
                          onClick={() => handleCategoryClick(category.slug)}
                          sx={{
                            fontSize: '0.8rem',
                            color: 'primary.main',
                            fontWeight: 600,
                            mb: 0.5,
                            py: 0.5,
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 },
                          }}
                        >
                          {category.name}
                        </Typography>
                        {category.children && category.children.length > 0 && (
                          <Stack direction="row" flexWrap="wrap" gap={1}>
                            {category.children.map((sub) => (
                              <Typography
                                key={sub.id}
                                onClick={() => handleCategoryClick(sub.slug)}
                                sx={{
                                  fontSize: '0.85rem',
                                  color: '#888',
                                  cursor: 'pointer',
                                  py: 1,
                                  '&:hover': { color: 'primary.main' },
                                }}
                              >
                                {sub.name}
                              </Typography>
                            ))}
                          </Stack>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Collapse>
              )}
            </Box>
          ))}
        </Stack>
      </Drawer>
    </>
  );
};

export default Navbar;

import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import xoiceTheme from './theme';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import { setLenisInstance } from './utils/lenis';
import CustomCursor from './components/ui/CustomCursor';
import NoiseOverlay from './components/ui/NoiseOverlay';
import Navbar from './components/layout/Navbar';
import PageTransition from './components/ui/PageTransition';
import HeroSection from './pages/Home/sections/HeroSection';
import BioSection from './pages/Home/sections/BioSection';
import GallerySection from './pages/Home/sections/GallerySection';
import VideoSection from './pages/Home/sections/VideoSection';
import PhotographyStudy from './pages/Home/sections/PhotographyStudy';
import ContactSection from './pages/Home/sections/ContactSection';
import { useSiteConfig } from './hooks/useSiteConfig';
import { AuthProvider } from './contexts/AuthContext';

const KenyaExpedition = lazy(() => import('./pages/KenyaExpedition'));
const GalleryListPage = lazy(() => import('./pages/Gallery/GalleryListPage'));
const WorkDetailPage = lazy(() => import('./pages/Gallery/WorkDetailPage'));
const WorkshopDetailPage = lazy(() => import('./pages/Workshops/WorkshopDetailPage'));
const WorkshopListPage = lazy(() => import('./pages/Workshops/WorkshopListPage'));
const LoginPage = lazy(() => import('./pages/Admin/LoginPage'));
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const DashboardPage = lazy(() => import('./pages/Admin/DashboardPage'));
const WorksManager = lazy(() => import('./pages/Admin/WorksManager'));
const VideosManager = lazy(() => import('./pages/Admin/VideosManager'));
const WorkshopsManager = lazy(() => import('./pages/Admin/WorkshopsManager'));
const WorkshopEditorPage = lazy(() => import('./pages/Admin/WorkshopEditorPage'));
const CategoriesPage = lazy(() => import('./pages/Admin/CategoriesPage'));
const LeadsPage = lazy(() => import('./pages/Admin/LeadsPage'));
const SiteConfigPage = lazy(() => import('./pages/Admin/SiteConfigPage'));
const MediaPage = lazy(() => import('./pages/Admin/MediaPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#050505' }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress sx={{ color: 'primary.main', mb: 2 }} />
        <Box sx={{ color: '#555', fontSize: '0.85rem' }}>加载中...</Box>
      </Box>
    </Box>
  );
}

function Footer() {
  const { data: config } = useSiteConfig();
  const year = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ p: 4, borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-between', color: '#444' }}>
      <Box>&copy; {year} {config?.brandName || 'Xoice'} Photography.</Box>
      <Box>{config?.footerText || `Designed with`} <Box component="span" sx={{ color: 'primary.main' }}>♥</Box> by React 19.</Box>
    </Box>
  );
}

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    setLenisInstance(lenis);

    lenis.on('scroll', ScrollTrigger.update);

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <ThemeProvider theme={xoiceTheme}>
      <CssBaseline />
      <HelmetProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <CustomCursor />
          <NoiseOverlay />

          <Navbar />

          <ErrorBoundary>
          <PageTransition>
          <Routes>
          <Route path="/" element={
            <main>
              <HeroSection />
              <BioSection />
              <GallerySection />
              <VideoSection />
              <PhotographyStudy />
              <ContactSection />
            </main>
          } />
          <Route path="/gallery" element={<Suspense fallback={<PageLoader />}><GalleryListPage /></Suspense>} />
          <Route path="/gallery/:slug" element={<Suspense fallback={<PageLoader />}><WorkDetailPage /></Suspense>} />
          <Route path="/workshops" element={<Suspense fallback={<PageLoader />}><WorkshopListPage /></Suspense>} />
          <Route path="/workshops/:slug" element={<Suspense fallback={<PageLoader />}><WorkshopDetailPage /></Suspense>} />
          <Route path="/photographystudy/kenya-expedition" element={<Suspense fallback={<PageLoader />}><KenyaExpedition /></Suspense>} />
          <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
          <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminLayout /></Suspense>}>
            <Route index element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
            <Route path="works" element={<Suspense fallback={<PageLoader />}><WorksManager /></Suspense>} />
            <Route path="videos" element={<Suspense fallback={<PageLoader />}><VideosManager /></Suspense>} />
            <Route path="workshops" element={<Suspense fallback={<PageLoader />}><WorkshopsManager /></Suspense>} />
            <Route path="workshops/new" element={<Suspense fallback={<PageLoader />}><WorkshopEditorPage /></Suspense>} />
            <Route path="workshops/edit/:id" element={<Suspense fallback={<PageLoader />}><WorkshopEditorPage /></Suspense>} />
            <Route path="categories" element={<Suspense fallback={<PageLoader />}><CategoriesPage /></Suspense>} />
            <Route path="leads" element={<Suspense fallback={<PageLoader />}><LeadsPage /></Suspense>} />
            <Route path="site-config" element={<Suspense fallback={<PageLoader />}><SiteConfigPage /></Suspense>} />
            <Route path="media" element={<Suspense fallback={<PageLoader />}><MediaPage /></Suspense>} />
          </Route>
          <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
          </Routes>
          </PageTransition>
          </ErrorBoundary>

          <Footer />
        </Router>
      </AuthProvider>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;

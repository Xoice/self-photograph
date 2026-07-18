import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography, Container, TextField, Button, CircularProgress, Alert, Divider } from '@mui/material';
import apiClient from '@/api/client';
import ImageUploader from '@/components/ui/ImageUploader';
import { getErrorMessage } from '@/utils/error';

interface SiteConfig {
  brandName: string;
  heroTitle: string;
  heroSubtitle: string;
  bioTitle: string;
  bioContent: string;
  bioImage?: string;
  contact: { phone: string; email: string; wechat: string; location: string };
  socialLinks: { bilibili: string };
  footerText: string;
}

const SiteConfigPage = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const initialConfigRef = useRef<SiteConfig | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!config) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty, config]);

  useEffect(() => {
    apiClient.get<SiteConfig>('/admin/site/config')
      .then((res) => {
        setConfig(res);
        initialConfigRef.current = res;
      })
      .catch((err) => setError(getErrorMessage(err, '加载失败')))
      .finally(() => setLoading(false));
  }, []);

  const updateConfig = useCallback((patch: Partial<SiteConfig>) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      setIsDirty(JSON.stringify(next) !== JSON.stringify(initialConfigRef.current));
      return next;
    });
  }, []);

  const updateContact = useCallback((patch: Partial<SiteConfig['contact']>) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const next = { ...prev, contact: { ...prev.contact, ...patch } };
      setIsDirty(JSON.stringify(next) !== JSON.stringify(initialConfigRef.current));
      return next;
    });
  }, []);

  const updateSocial = useCallback((patch: Partial<SiteConfig['socialLinks']>) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const next = { ...prev, socialLinks: { ...prev.socialLinks, ...patch } };
      setIsDirty(JSON.stringify(next) !== JSON.stringify(initialConfigRef.current));
      return next;
    });
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.put('/admin/site/config', {
        brandName: config.brandName,
        heroTitle: config.heroTitle,
        heroSubtitle: config.heroSubtitle,
        bioTitle: config.bioTitle,
        bioContent: config.bioContent,
        bioImage: config.bioImage || '',
        contactPhone: config.contact.phone,
        contactEmail: config.contact.email,
        contactWechat: config.contact.wechat,
        locationText: config.contact.location,
        bilibiliUrl: config.socialLinks.bilibili,
        footerText: config.footerText,
      });
      initialConfigRef.current = config;
      setIsDirty(false);
      setSuccess('保存成功');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, '保存失败'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Container>
    );
  }

  if (!config) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">无法加载站点配置</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(244,67,54,0.1)', color: '#f44336' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, bgcolor: 'rgba(76,175,80,0.1)', color: '#4caf50' }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>站点配置</Typography>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{ bgcolor: 'primary.main', color: '#000', '&:hover': { bgcolor: 'primary.main', opacity: 0.9 } }}
        >
          {saving ? '保存中...' : isDirty ? '保存 *' : '保存'}
        </Button>
      </Box>

      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>品牌信息</Typography>
      <Box sx={{ display: 'grid', gap: 2, mb: 4 }}>
        <TextField label="品牌名称" value={config.brandName} onChange={(e) => updateConfig({ brandName: e.target.value })} fullWidth />
        <TextField label="Hero 标题" value={config.heroTitle} onChange={(e) => updateConfig({ heroTitle: e.target.value })} fullWidth helperText="空格分割为两行，如 XOICE PHOTOGRAPH" />
        <TextField label="Hero 副标题" value={config.heroSubtitle} onChange={(e) => updateConfig({ heroSubtitle: e.target.value })} fullWidth />
        <TextField label="页脚文字" value={config.footerText} onChange={(e) => updateConfig({ footerText: e.target.value })} fullWidth />
      </Box>

      <Divider sx={{ borderColor: '#222', my: 4 }} />

      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>关于信息</Typography>
      <Box sx={{ display: 'grid', gap: 2, mb: 4 }}>
        <TextField label="关于标题" value={config.bioTitle} onChange={(e) => updateConfig({ bioTitle: e.target.value })} fullWidth />
        <TextField label="关于内容" value={config.bioContent} onChange={(e) => updateConfig({ bioContent: e.target.value })} fullWidth multiline rows={4} />
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>关于照片（肖像照）</Typography>
          <ImageUploader
            value={config.bioImage || ''}
            onChange={(url) => updateConfig({ bioImage: url })}
            label="肖像照"
            aspectRatio={4 / 5}
            enableCrop={true}
          />
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#222', my: 4 }} />

      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>联系方式</Typography>
      <Box sx={{ display: 'grid', gap: 2, mb: 4 }}>
        <TextField label="电话" value={config.contact.phone} onChange={(e) => updateContact({ phone: e.target.value })} fullWidth />
        <TextField label="邮箱" value={config.contact.email} onChange={(e) => updateContact({ email: e.target.value })} fullWidth />
        <TextField label="微信" value={config.contact.wechat} onChange={(e) => updateContact({ wechat: e.target.value })} fullWidth />
        <TextField label="位置" value={config.contact.location} onChange={(e) => updateContact({ location: e.target.value })} fullWidth helperText="具体到省市区，如 广东省深圳市南山区" />
      </Box>

      <Divider sx={{ borderColor: '#222', my: 4 }} />

      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>社交媒体</Typography>
      <Box sx={{ display: 'grid', gap: 2, mb: 4 }}>
        <TextField label="B站空间链接" value={config.socialLinks.bilibili} onChange={(e) => updateSocial({ bilibili: e.target.value })} fullWidth />
      </Box>
    </Container>
  );
};

export default SiteConfigPage;

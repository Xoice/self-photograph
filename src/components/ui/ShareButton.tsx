import { useState, useRef, useEffect } from 'react';
import { Typography, IconButton, Popover, Stack, Button } from '@mui/material';
import { Share, ContentCopy, Check, Chat, Public, Tag } from '@mui/icons-material';

interface ShareButtonProps {
  title: string;
  url?: string;
}

export default function ShareButton({ title, url }: ShareButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://xoice.com';
  const BRAND_NAME = import.meta.env.VITE_BRAND_NAME || 'XOICE Photography';
  const shareUrl = url ? `${SITE_URL}${url}` : window.location.href;
  const shareText = `${title} - ${BRAND_NAME}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWeibo = () => {
    const text = encodeURIComponent(`${shareText} ${shareUrl}`);
    window.open(`https://service.weibo.com/share/share.php?title=${text}`, '_blank');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(shareText);
    const urlEncoded = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${urlEncoded}`, '_blank');
  };

  const handleWeChat = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
    window.open(qrUrl, '_blank');
  };

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          color: 'primary.main',
          '&:hover': { bgcolor: 'rgba(224,164,88,0.1)' },
        }}
      >
        <Share />
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { bgcolor: '#111', border: '1px solid rgba(224,164,88,0.2)', p: 2, minWidth: 200 } } }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: 'primary.main' }}>
          分享到
        </Typography>
        <Stack spacing={1}>
          <Button
            fullWidth
            startIcon={copied ? <Check sx={{ color: 'primary.main' }} /> : <ContentCopy sx={{ color: 'primary.main' }} />}
            onClick={handleCopy}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              color: copied ? 'primary.main' : '#EAEAEA',
              bgcolor: copied ? 'rgba(224,164,88,0.1)' : 'rgba(255,255,255,0.05)',
              '&:hover': { bgcolor: 'rgba(224,164,88,0.1)' },
            }}
          >
            {copied ? '已复制链接' : '复制链接'}
          </Button>
          <Button
            fullWidth
            onClick={handleWeChat}
            startIcon={<Chat sx={{ color: 'primary.main' }} />}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              color: '#EAEAEA',
              bgcolor: 'rgba(255,255,255,0.05)',
              '&:hover': { bgcolor: 'rgba(224,164,88,0.1)' },
            }}
          >
            微信（扫码）
          </Button>
          <Button
            fullWidth
            onClick={handleWeibo}
            startIcon={<Public sx={{ color: 'primary.main' }} />}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              color: '#EAEAEA',
              bgcolor: 'rgba(255,255,255,0.05)',
              '&:hover': { bgcolor: 'rgba(224,164,88,0.1)' },
            }}
          >
            微博
          </Button>
          <Button
            fullWidth
            onClick={handleTwitter}
            startIcon={<Tag sx={{ color: 'primary.main' }} />}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              color: '#EAEAEA',
              bgcolor: 'rgba(255,255,255,0.05)',
              '&:hover': { bgcolor: 'rgba(224,164,88,0.1)' },
            }}
          >
            Twitter
          </Button>
        </Stack>
      </Popover>
    </>
  );
}

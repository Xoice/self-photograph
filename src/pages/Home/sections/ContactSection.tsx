import { useRef, useState, useEffect } from 'react';
import { Box, Typography, Container, Button, Card, CardContent, Grid, Stack, IconButton, Tooltip, Fade, TextField, Alert } from '@mui/material';
import { Phone, Email, LocationOn, Send, ContentCopy, Check, Chat } from '@mui/icons-material';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useForm } from 'react-hook-form';

gsap.registerPlugin(ScrollTrigger);
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useSubmitContact } from '@/hooks/useSubmitContact';

const contactSchema = z.object({
  name: z.string().min(1, '请输入姓名'),
  email: z.string().email('请输入有效邮箱'),
  message: z.string().min(10, '消息至少10个字符'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { data: config } = useSiteConfig();
  const { mutate: submitContact, isPending, isSuccess, error } = useSubmitContact();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const onSubmit = (data: ContactFormData) => {
    submitContact(
      { ...data, sourcePage: '/' },
      { onSuccess: () => reset() },
    );
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const contact = config?.contact;

  useGSAP(() => {
    gsap.fromTo('.contact-item',
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 90%' },
      },
    );
    gsap.fromTo('.section-title',
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 90%' },
      },
    );
  }, { scope: sectionRef });

  const contactItems = contact ? [
    { icon: <Phone sx={{ fontSize: 24, color: 'primary.main' }} />, label: '电话', value: contact.phone, copyValue: contact.phone, field: 'phone' },
    { icon: <Email sx={{ fontSize: 24, color: 'primary.main' }} />, label: '邮箱', value: contact.email, copyValue: contact.email, field: 'email' },
    { icon: <Chat sx={{ fontSize: 24, color: 'primary.main' }} />, label: '微信', value: contact.wechat, copyValue: contact.wechat, field: 'wechat' },
    { icon: <LocationOn sx={{ fontSize: 24, color: 'primary.main' }} />, label: '位置', value: contact.location, copyValue: null, field: null },
  ] : [];

  return (
    <Box component="section" ref={sectionRef} id="connect" sx={{ minHeight: '100vh', py: 15, bgcolor: '#080808', scrollMarginTop: '100px' }}>
      <Container maxWidth="xl">
        <Box className="section-title" sx={{ mb: 10 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 300, mb: 3 }}>
            联系Xoice CONTACT
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.2rem', color: 'text.secondary', maxWidth: '600px' }}>
            有合作意向或想要了解更多？欢迎随时联系我
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 10 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              className="contact-item"
              sx={{
                bgcolor: '#111',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)',
                height: '100%',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  borderColor: 'rgba(255,255,255,0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                },
              }}
            >
              <CardContent sx={{ p: 5 }}>
                <Stack spacing={4}>
                  {contactItems.map((item) => (
                    <Stack key={item.label} direction="row" spacing={3} alignItems="flex-start">
                      <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                        {item.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          {item.label}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="h6" sx={{ fontSize: '1.3rem', fontWeight: 500, wordBreak: 'break-all' }}>
                            {item.value}
                          </Typography>
                          {item.copyValue && item.field && (
                            <Tooltip
                              title={copiedField === item.field ? "已复制!" : "点击复制"}
                              placement="top"
                              TransitionComponent={Fade}
                            >
                              <IconButton
                                onClick={() => handleCopy(item.copyValue!, item.field!)}
                                size="small"
                                sx={{
                                  color: copiedField === item.field ? 'primary.main' : 'rgba(255,255,255,0.3)',
                                  '&:hover': { color: 'primary.main', bgcolor: 'rgba(204, 255, 0, 0.1)' }
                                }}
                              >
                                {copiedField === item.field ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              className="contact-item"
              sx={{
                bgcolor: '#111',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)',
                height: '100%',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  borderColor: 'rgba(255,255,255,0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                },
              }}
            >
              <CardContent sx={{ p: 5 }}>
                <Typography variant="h5" sx={{ mb: 4, fontWeight: 500 }}>
                  发送消息
                </Typography>

                {showSuccess && (
                  <Alert severity="success" sx={{ mb: 3, bgcolor: 'rgba(76,175,80,0.1)', color: '#4caf50' }}>
                    消息已发送成功！
                  </Alert>
                )}
                {error && (
                  <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(244,67,54,0.1)', color: '#f44336' }}>
                    发送失败，请稍后重试
                  </Alert>
                )}

                <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={3}>
                  <TextField
                    {...register('name')}
                    label="您的姓名"
                    placeholder="请输入您的姓名"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.05)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                      },
                      '& .MuiInputLabel-root': { color: 'text.secondary' },
                      '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' },
                    }}
                  />
                  <TextField
                    {...register('email')}
                    label="您的邮箱"
                    type="email"
                    placeholder="请输入您的邮箱"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.05)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                      },
                      '& .MuiInputLabel-root': { color: 'text.secondary' },
                      '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' },
                    }}
                  />
                  <TextField
                    {...register('message')}
                    label="消息内容"
                    placeholder="请输入您的消息"
                    multiline
                    rows={4}
                    error={!!errors.message}
                    helperText={errors.message?.message}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.05)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                      },
                      '& .MuiInputLabel-root': { color: 'text.secondary' },
                      '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isPending}
                    endIcon={<Send sx={{ color: 'inherit' }} />}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: '50px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      bgcolor: 'primary.main',
                      color: '#000000',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        opacity: 0.9,
                        boxShadow: '0 0 25px rgba(204, 255, 0, 0.6)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)',
                      '&.Mui-disabled': { bgcolor: '#333', color: '#666' },
                    }}
                  >
                    {isPending ? '发送中...' : '发送消息'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box className="contact-item" sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            感谢您的关注，期待与您的合作
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ContactSection;

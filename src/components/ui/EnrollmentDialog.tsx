import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, Stack } from '@mui/material';
import { useSubmitEnrollment } from '@/hooks/useSubmitEnrollment';

interface EnrollmentDialogProps {
  open: boolean;
  onClose: () => void;
  workshopSlug: string;
  workshopTitle: string;
}

export default function EnrollmentDialog({ open, onClose, workshopSlug, workshopTitle }: EnrollmentDialogProps) {
  const { mutate: submitEnrollment, isPending, isSuccess, error, reset } = useSubmitEnrollment();
  const [form, setForm] = useState({ name: '', phone: '', wechat: '', email: '', message: '' });
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!open) return;
    reset();
  }, [open, reset]);

  const handleSubmit = () => {
    submitEnrollment(
      { ...form, workshopSlug },
      {
        onSuccess: () => {
          setForm({ name: '', phone: '', wechat: '', email: '', message: '' });
          timerRef.current = setTimeout(() => onClose(), 2000);
        },
      },
    );
  };

  const handleClose = () => {
    if (!isPending) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setForm({ name: '', phone: '', wechat: '', email: '', message: '' });
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        报名 — {workshopTitle}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {isSuccess && (
            <Alert severity="success">报名成功！我们会尽快与您联系。</Alert>
          )}
          {error && (
            <Alert severity="error">{(error as Error).message || '报名失败，请稍后重试'}</Alert>
          )}
          <TextField
            label="姓名"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="电话"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            fullWidth
          />
          <TextField
            label="微信"
            value={form.wechat}
            onChange={(e) => setForm({ ...form, wechat: e.target.value })}
            fullWidth
          />
          <TextField
            label="邮箱"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            fullWidth
          />
          <TextField
            label="留言"
            multiline
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>取消</Button>
        <Button
          onClick={handleSubmit}
          disabled={isPending || !form.name || !form.phone || (form.email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))}
          sx={{ color: 'primary.main' }}
        >
          {isPending ? '提交中...' : '提交报名'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

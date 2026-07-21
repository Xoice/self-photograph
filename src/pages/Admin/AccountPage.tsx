import { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Alert, Paper, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import { changePassword } from '@/api/auth';
import { getErrorMessage } from '@/utils/error';
import { useAuth } from '@/contexts/AuthContext';

const AccountPage = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword.length < 6) {
      setError('新密码长度不能少于6位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setError(getErrorMessage(err, '修改失败'));
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255,255,255,0.05)',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' },
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>账号设置</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
        当前账号：{user?.email}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(244,67,54,0.1)', color: '#f44336' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, bgcolor: 'rgba(76,175,80,0.1)', color: '#4caf50' }} onClose={() => setSuccess(false)}>
          密码修改成功，下次登录请使用新密码。
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 4, bgcolor: '#111', border: '1px solid #222' }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="当前密码"
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            required
            sx={{ mb: 3, ...inputSx }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end" sx={{ color: 'text.secondary' }}>
                    {showCurrent ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="新密码"
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            required
            helperText="至少 6 位"
            sx={{ mb: 3, ...inputSx }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNew(!showNew)} edge="end" sx={{ color: 'text.secondary' }}>
                    {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="确认新密码"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            required
            sx={{ mb: 4, ...inputSx }}
            error={!!confirmPassword && newPassword !== confirmPassword}
            helperText={confirmPassword && newPassword !== confirmPassword ? '两次输入不一致' : ' '}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" sx={{ color: 'text.secondary' }}>
                    {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              sx={{ py: 1.5, bgcolor: 'primary.main', color: '#000', fontWeight: 600, '&:hover': { bgcolor: 'primary.main', opacity: 0.9 } }}
            >
              {loading ? '保存中...' : '修改密码'}
            </Button>
            <Button
              onClick={handleReset}
              disabled={loading}
              sx={{ py: 1.5, color: 'text.secondary' }}
            >
              重置
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AccountPage;

import { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Alert, Paper, InputAdornment, IconButton, Divider } from '@mui/material';
import { Visibility, VisibilityOff, Lock, Email } from '@mui/icons-material';
import { changePassword, changeEmail } from '@/api/auth';
import { getErrorMessage } from '@/utils/error';
import { useAuth } from '@/contexts/AuthContext';

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

const AccountPage = () => {
  const { user, updateUser } = useAuth();

  // --- 修改邮箱 ---
  const [emailPassword, setEmailPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showEmailPwd, setShowEmailPwd] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess(false);
    if (!newEmail || !emailPassword) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailError('邮箱格式不正确');
      return;
    }
    if (newEmail.toLowerCase() === (user?.email || '').toLowerCase()) {
      setEmailError('新邮箱不能与当前邮箱相同');
      return;
    }
    setEmailLoading(true);
    try {
      const res = await changeEmail({ currentPassword: emailPassword, newEmail });
      updateUser({ email: res.email });
      setEmailSuccess(true);
      setEmailPassword('');
      setNewEmail('');
    } catch (err: unknown) {
      setEmailError(getErrorMessage(err, '修改失败'));
    } finally {
      setEmailLoading(false);
    }
  };

  // --- 修改密码 ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const handlePwdReset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPwdError('');
    setPwdSuccess(false);
  };

  const handlePwdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess(false);
    if (newPassword.length < 6) {
      setPwdError('新密码长度不能少于6位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('两次输入的新密码不一致');
      return;
    }
    setPwdLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPwdSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPwdError(getErrorMessage(err, '修改失败'));
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>账号设置</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
        当前账号：{user?.email}
      </Typography>

      {/* 修改邮箱 */}
      <Paper elevation={0} sx={{ p: 4, bgcolor: '#111', border: '1px solid #222', mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>修改邮箱</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
          部署到云端后建议及时修改默认邮箱，避免源码泄露导致账号暴露
        </Typography>

        {emailError && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(244,67,54,0.1)', color: '#f44336' }} onClose={() => setEmailError('')}>
            {emailError}
          </Alert>
        )}
        {emailSuccess && (
          <Alert severity="success" sx={{ mb: 3, bgcolor: 'rgba(76,175,80,0.1)', color: '#4caf50' }} onClose={() => setEmailSuccess(false)}>
            邮箱修改成功，下次登录请使用新邮箱。
          </Alert>
        )}

        <Box component="form" onSubmit={handleEmailSubmit}>
          <TextField
            label="新邮箱"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            fullWidth
            required
            sx={{ mb: 3, ...inputSx }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
            }}
          />
          <TextField
            label="当前密码"
            type={showEmailPwd ? 'text' : 'password'}
            value={emailPassword}
            onChange={(e) => setEmailPassword(e.target.value)}
            fullWidth
            required
            helperText="验证当前密码以确认操作"
            sx={{ mb: 4, ...inputSx }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowEmailPwd(!showEmailPwd)} edge="end" sx={{ color: 'text.secondary' }}>
                    {showEmailPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={emailLoading || !newEmail || !emailPassword}
            sx={{ py: 1.5, bgcolor: 'primary.main', color: '#000', fontWeight: 600, '&:hover': { bgcolor: 'primary.main', opacity: 0.9 } }}
          >
            {emailLoading ? '保存中...' : '修改邮箱'}
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ borderColor: '#222', mb: 4 }} />

      {/* 修改密码 */}
      <Paper elevation={0} sx={{ p: 4, bgcolor: '#111', border: '1px solid #222' }}>
        <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>修改密码</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
          部署到云端后建议及时修改默认密码
        </Typography>

        {pwdError && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(244,67,54,0.1)', color: '#f44336' }} onClose={() => setPwdError('')}>
            {pwdError}
          </Alert>
        )}
        {pwdSuccess && (
          <Alert severity="success" sx={{ mb: 3, bgcolor: 'rgba(76,175,80,0.1)', color: '#4caf50' }} onClose={() => setPwdSuccess(false)}>
            密码修改成功，下次登录请使用新密码。
          </Alert>
        )}

        <Box component="form" onSubmit={handlePwdSubmit}>
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
              disabled={pwdLoading || !currentPassword || !newPassword || !confirmPassword}
              sx={{ py: 1.5, bgcolor: 'primary.main', color: '#000', fontWeight: 600, '&:hover': { bgcolor: 'primary.main', opacity: 0.9 } }}
            >
              {pwdLoading ? '保存中...' : '修改密码'}
            </Button>
            <Button
              onClick={handlePwdReset}
              disabled={pwdLoading}
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

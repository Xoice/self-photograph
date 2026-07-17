import { useEffect, useState } from 'react';
import { Box, Typography, Container, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress, Alert, Tabs, Tab, TextField, MenuItem, Select, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import apiClient from '@/api/client';

interface ContactLead {
  id: string;
  name: string;
  email: string;
  message: string;
  sourcePage: string | null;
  status: string;
  createdAt: string;
}

interface Enrollment {
  id: string;
  workshopId: string;
  name: string;
  phone: string;
  wechat: string | null;
  email: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

const statusMap: Record<string, string> = {
  new: '新消息',
  read: '已读',
  replied: '已回复',
  archived: '已归档',
};

const statusColors: Record<string, string> = {
  new: '#4caf50',
  read: '#2196f3',
  replied: '#888',
  archived: '#666',
};

const LeadsPage = () => {
  const [tab, setTab] = useState(0);
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<ContactLead | null>(null);

  const loadLeads = () => {
    setLoading(true);
    setError('');
    const params: any = { pageSize: 100 };
    if (statusFilter) params.status = statusFilter;
    if (keyword) params.keyword = keyword;
    apiClient.get('/admin/leads/contact', { params })
      .then((res: any) => setLeads(res.items || []))
      .catch((err) => { setLeads([]); setError(err.message || '加载失败'); })
      .finally(() => setLoading(false));
  };

  const loadEnrollments = () => {
    setLoading(true);
    setError('');
    apiClient.get('/admin/leads/workshop-enrollments', { params: { pageSize: 100 } })
      .then((res: any) => setEnrollments(res.items || []))
      .catch((err) => { setEnrollments([]); setError(err.message || '加载失败'); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === 0) loadLeads();
    else loadEnrollments();
  }, [tab, statusFilter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/admin/leads/contact/${id}/status`, { status });
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
    } catch (err: any) {
      setError(err.message || '更新失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该线索？')) return;
    try {
      await apiClient.delete(`/admin/leads/contact/${id}`);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      setError(err.message || '删除失败');
    }
  };

  const handleViewDetail = (lead: ContactLead) => {
    setDetailItem(lead);
    setDetailOpen(true);
    if (lead.status === 'new') {
      handleUpdateStatus(lead.id, 'read');
    }
  };

  const handleSearch = () => {
    loadLeads();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(244,67,54,0.1)', color: '#f44336' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>线索管理</Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => tab === 0 ? loadLeads() : loadEnrollments()}
          sx={{ bgcolor: 'primary.main', color: '#000', '&:hover': { bgcolor: 'primary.main', opacity: 0.9 } }}
        >
          刷新
        </Button>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
      >
        <Tab label={`联系线索 (${leads.length})`} />
        <Tab label={`研学报名 (${enrollments.length})`} />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="搜索姓名/邮箱/内容"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            size="small"
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>状态</InputLabel>
            <Select
              value={statusFilter}
              label="状态"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="new">新消息</MenuItem>
              <MenuItem value="read">已读</MenuItem>
              <MenuItem value="replied">已回复</MenuItem>
              <MenuItem value="archived">已归档</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={handleSearch} sx={{ borderColor: '#333', color: 'text.secondary' }}>
            搜索
          </Button>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress sx={{ color: 'primary.main' }} /></Box>
      ) : tab === 0 ? (
        <TableContainer component={Paper} sx={{ bgcolor: '#111', border: '1px solid #222', overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary' }}>姓名</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>邮箱</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>内容</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>来源</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>状态</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>时间</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                  <TableCell>{lead.name}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{lead.email}</TableCell>
                  <TableCell
                    sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                    onClick={() => handleViewDetail(lead)}
                  >
                    {lead.message}
                  </TableCell>
                  <TableCell>{lead.sourcePage || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={statusMap[lead.status] || lead.status}
                      size="small"
                      sx={{
                        bgcolor: `${statusColors[lead.status] || '#888'}22`,
                        color: statusColors[lead.status] || '#888',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                    {new Date(lead.createdAt).toLocaleDateString('zh-CN')}
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleViewDetail(lead)} sx={{ color: 'text.secondary', textTransform: 'none' }}>
                      查看
                    </Button>
                    <Button size="small" onClick={() => handleDelete(lead.id)} sx={{ color: '#f44336', textTransform: 'none' }}>
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    暂无联系线索
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: '#111', border: '1px solid #222', overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary' }}>姓名</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>电话</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>微信</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>邮箱</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>留言</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>状态</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>时间</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enrollments.map((enr) => (
                <TableRow key={enr.id}>
                  <TableCell>{enr.name}</TableCell>
                  <TableCell>{enr.phone}</TableCell>
                  <TableCell>{enr.wechat || '-'}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{enr.email || '-'}</TableCell>
                  <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {enr.message || '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusMap[enr.status] || enr.status}
                      size="small"
                      sx={{
                        bgcolor: `${statusColors[enr.status] || '#888'}22`,
                        color: statusColors[enr.status] || '#888',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                    {new Date(enr.createdAt).toLocaleDateString('zh-CN')}
                  </TableCell>
                </TableRow>
              ))}
              {enrollments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    暂无研学报名
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { maxHeight: "90vh", overflowY: "auto" } }}>
        <DialogTitle>线索详情</DialogTitle>
        <DialogContent>
          {detailItem && (
            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>姓名</Typography>
                <Typography>{detailItem.name}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>邮箱</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}>{detailItem.email}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>来源</Typography>
                <Typography>{detailItem.sourcePage || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>时间</Typography>
                <Typography>{new Date(detailItem.createdAt).toLocaleString('zh-CN')}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>留言内容</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{detailItem.message}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeadsPage;

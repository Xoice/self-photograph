import { Box, Typography, Container, Card, CardContent, Grid, Button, Chip, Divider, Stack } from '@mui/material';
import { CalendarToday, LocationOn, People, CameraAlt, CheckCircle, ArrowBack, ArrowForward } from '@mui/icons-material';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteConfig } from '@/hooks/useSiteConfig';

gsap.registerPlugin(ScrollTrigger);

const KenyaExpedition = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: config } = useSiteConfig();

  useGSAP(() => {
    gsap.fromTo('.expedition-header',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
    );
    gsap.fromTo('.expedition-section',
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 80%' },
      },
    );
  }, { scope: containerRef });

  return (
    <Box ref={containerRef} sx={{ bgcolor: '#050505', minHeight: '100vh', pt: 15, pb: 10 }}>
      <Container maxWidth="lg">
        <Button
          onClick={() => navigate('/#photographystudy')}
          startIcon={<ArrowBack />}
          sx={{
            mb: 4,
            color: '#EAEAEA',
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': {
              color: '#CCFF00',
            },
          }}
        >
          返回摄影研学
        </Button>

        <Box className="expedition-header" sx={{ mb: 8 }}>
          <Chip
            label="2025年重磅推出"
            sx={{
              mb: 3,
              bgcolor: 'rgba(204, 255, 0, 0.1)',
              color: '#CCFF00',
              fontSize: '0.875rem',
              fontWeight: 500,
              px: 2,
            }}
          />
          <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 300, mb: 4, lineHeight: 1.2 }}>
            肯尼亚"野生动物行为"摄影远征团
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 300, mb: 6, color: '#CCFF00' }}>
            Kenya "Wildlife Behavior" Photography Expedition
          </Typography>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 234, 234, 0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CalendarToday sx={{ color: '#CCFF00' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#888' }}>出行时间</Typography>
                      <Typography variant="h6" sx={{ color: '#EAEAEA' }}>2025年7月15日-25日</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 234, 234, 0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <LocationOn sx={{ color: '#CCFF00' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#888' }}>拍摄地点</Typography>
                      <Typography variant="h6" sx={{ color: '#EAEAEA' }}>马赛马拉国家保护区</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 234, 234, 0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <People sx={{ color: '#CCFF00' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#888' }}>招募人数</Typography>
                      <Typography variant="h6" sx={{ color: '#EAEAEA' }}>仅限8人精品小团</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ bgcolor: 'rgba(204, 255, 0, 0.05)', border: '2px solid #CCFF00' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 600, mb: 2, color: '#CCFF00' }}>
                ¥36,800/人
              </Typography>
              <Typography variant="body1" sx={{ color: '#EAEAEA' }}>
                包含全程住宿、餐饮、交通、门票、专业摄影指导及后期教学
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box className="expedition-section" sx={{ mb: 10 }}>
          <Typography variant="h3" sx={{ fontSize: '2rem', mb: 4, color: '#EAEAEA' }}>
            行程亮点
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 234, 234, 0.1)', height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <CameraAlt sx={{ fontSize: 40, color: '#CCFF00', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontSize: '1.5rem', mb: 2, color: '#EAEAEA' }}>
                    独家拍摄角度
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#999', lineHeight: 1.8 }}>
                    深入马赛马拉核心区域，避开常规旅游路线，捕捉野生动物最真实的行为瞬间。专业向导团队熟悉动物习性，带您找到最佳拍摄机位。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 234, 234, 0.1)', height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <CheckCircle sx={{ fontSize: 40, color: '#CCFF00', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontSize: '1.5rem', mb: 2, color: '#EAEAEA' }}>
                    专业摄影指导
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#999', lineHeight: 1.8 }}>
                    全程由Xoice亲自带队，提供一对一技术指导。从构图、光线到快门时机，现场教学，实时点评。每晚进行作品分享与后期处理教学。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Box className="expedition-section" sx={{ mb: 10 }}>
          <Typography variant="h3" sx={{ fontSize: '2rem', mb: 4, color: '#EAEAEA' }}>
            详细行程
          </Typography>
          <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 234, 234, 0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h5" sx={{ color: '#CCFF00', mb: 2 }}>第1天：抵达内罗毕</Typography>
                  <Typography variant="body1" sx={{ color: '#999', lineHeight: 1.8 }}>
                    抵达肯尼亚首都内罗毕，专车接机至酒店。晚上举行欢迎晚宴，介绍行程安排及摄影技巧要点。
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(234, 234, 234, 0.1)' }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#CCFF00', mb: 2 }}>第2-3天：马赛马拉国家保护区</Typography>
                  <Typography variant="body1" sx={{ color: '#999', lineHeight: 1.8 }}>
                    清晨出发前往马赛马拉，入住生态营地。两天时间深入保护区，追踪狮子、猎豹、大象等野生动物。重点拍摄动物捕猎、哺育等行为瞬间。
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(234, 234, 234, 0.1)' }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#CCFF00', mb: 2 }}>第4-6天：马拉河区域</Typography>
                  <Typography variant="body1" sx={{ color: '#999', lineHeight: 1.8 }}>
                    转移至马拉河区域，拍摄角马大迁徙的壮观场面（视季节而定）。夜间拍摄星空银河，白天追踪河马、鳄鱼等水生动物。
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(234, 234, 234, 0.1)' }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#CCFF00', mb: 2 }}>第7-8天：纳库鲁湖国家公园</Typography>
                  <Typography variant="body1" sx={{ color: '#999', lineHeight: 1.8 }}>
                    前往纳库鲁湖，拍摄火烈鸟群飞的震撼场景。同时寻找犀牛、长颈鹿等珍稀动物。学习鸟类摄影的特殊技巧。
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(234, 234, 234, 0.1)' }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#CCFF00', mb: 2 }}>第9-10天：安博塞利国家公园</Typography>
                  <Typography variant="body1" sx={{ color: '#999', lineHeight: 1.8 }}>
                    前往安博塞利，拍摄乞力马扎罗山下的象群。这是拍摄大象与雪山同框的绝佳地点。同时拍摄斑马、羚羊等草原动物。
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(234, 234, 234, 0.1)' }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#CCFF00', mb: 2 }}>第11天：返程</Typography>
                  <Typography variant="body1" sx={{ color: '#999', lineHeight: 1.8 }}>
                    早餐后返回内罗毕，下午送机。结束难忘的肯尼亚摄影之旅。
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box className="expedition-section" sx={{ mb: 10 }}>
          <Typography variant="h3" sx={{ fontSize: '2rem', mb: 4, color: '#EAEAEA' }}>
            费用包含
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 234, 234, 0.1)', height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontSize: '1.25rem', mb: 3, color: '#EAEAEA' }}>
                    包含项目
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <CheckCircle sx={{ color: '#CCFF00', fontSize: 20, mt: 0.5 }} />
                      <Typography variant="body1" sx={{ color: '#999' }}>全程10晚高品质住宿（生态营地+特色酒店）</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <CheckCircle sx={{ color: '#CCFF00', fontSize: 20, mt: 0.5 }} />
                      <Typography variant="body1" sx={{ color: '#999' }}>每日三餐（含特色肯尼亚美食）</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <CheckCircle sx={{ color: '#CCFF00', fontSize: 20, mt: 0.5 }} />
                      <Typography variant="body1" sx={{ color: '#999' }}>专业越野车及司机（每车4人，保证拍摄空间）</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <CheckCircle sx={{ color: '#CCFF00', fontSize: 20, mt: 0.5 }} />
                      <Typography variant="body1" sx={{ color: '#999' }}>所有国家公园门票及保护区费用</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <CheckCircle sx={{ color: '#CCFF00', fontSize: 20, mt: 0.5 }} />
                      <Typography variant="body1" sx={{ color: '#999' }}>专业摄影指导及后期教学</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <CheckCircle sx={{ color: '#CCFF00', fontSize: 20, mt: 0.5 }} />
                      <Typography variant="body1" sx={{ color: '#999' }}>旅游意外保险</Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 234, 234, 0.1)', height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontSize: '1.25rem', mb: 3, color: '#EAEAEA' }}>
                    不含项目
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Typography sx={{ color: '#888', mt: 0.5 }}>•</Typography>
                      <Typography variant="body1" sx={{ color: '#999' }}>往返国际机票（可协助代订）</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Typography sx={{ color: '#888', mt: 0.5 }}>•</Typography>
                      <Typography variant="body1" sx={{ color: '#999' }}>肯尼亚签证费用</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Typography sx={{ color: '#888', mt: 0.5 }}>•</Typography>
                      <Typography variant="body1" sx={{ color: '#999' }}>个人消费及小费</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Typography sx={{ color: '#888', mt: 0.5 }}>•</Typography>
                      <Typography variant="body1" sx={{ color: '#999' }}>额外活动项目（如热气球等）</Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Box className="expedition-section" sx={{ mb: 10 }}>
          <Typography variant="h3" sx={{ fontSize: '2rem', mb: 4, color: '#EAEAEA' }}>
            报名须知
          </Typography>
          <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid rgba(234, 234, 234, 0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5" sx={{ color: '#CCFF00', mb: 2 }}>报名条件</Typography>
                  <Typography variant="body1" sx={{ color: '#999', lineHeight: 1.8 }}>
                    需具备一定摄影基础，拥有单反或微单相机（建议配备长焦镜头200mm以上）。身体健康，能够适应户外拍摄环境。
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(234, 234, 234, 0.1)' }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#CCFF00', mb: 2 }}>报名方式</Typography>
                  <Typography variant="body1" sx={{ color: '#999', lineHeight: 1.8 }}>
                    请通过下方联系方式咨询详情。报名需支付定金¥10,000确认名额，出发前30天支付尾款。如因个人原因取消，定金不退。
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(234, 234, 234, 0.1)' }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#CCFF00', mb: 2 }}>联系方式</Typography>
                  <Stack spacing={2}>
                    {config?.contact?.phone && (
                      <Typography variant="body1" sx={{ color: '#999' }}>
                        电话：{config.contact.phone}
                      </Typography>
                    )}
                    {config?.contact?.email && (
                      <Typography variant="body1" sx={{ color: '#999' }}>
                        邮箱：{config.contact.email}
                      </Typography>
                    )}
                    {config?.contact?.wechat && (
                      <Typography variant="body1" sx={{ color: '#999' }}>
                        微信：{config.contact.wechat}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box className="expedition-section" sx={{ textAlign: 'center', mt: 8 }}>
          <Button
            onClick={() => navigate('/#connect')}
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            sx={{
              px: 6,
              py: 2,
              borderRadius: '50px',
              bgcolor: '#CCFF00',
              color: '#050505',
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#b3e600',
                transform: 'translateY(-2px)',
              },
            }}
          >
            立即咨询报名
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default KenyaExpedition;

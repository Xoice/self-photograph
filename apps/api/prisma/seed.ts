import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@xoice.com' },
    update: {},
    create: {
      email: 'admin@xoice.com',
      passwordHash,
      name: 'Xoice',
      role: 'admin',
    },
  });
  console.log('Created admin user');

  // Create site config
  await prisma.siteConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      brandName: 'XOICE',
      heroTitle: 'XOICE PHOTOGRAPH',
      heroSubtitle: 'Capturing the soul of the county & stars.',
      bioTitle: '关于 Xoice',
      bioContent: '我是一名摄影师，专注于捕捉城市与星空的交汇点。每一张照片都是时间的切片，记录着光影的瞬间。\n从山川湖海到城市街角，我用镜头讲述那些被忽视的故事。摄影不仅是记录，更是对世界的重新诠释。',
      contactPhone: '18470532623',
      contactEmail: 'lionlyx@163.com',
      contactWechat: 'StephenLeeYee',
      locationText: '中国',
      bilibiliUrl: 'https://space.bilibili.com/xxxxxx',
      footerText: 'Designed for XOICE',
    },
  });
  console.log('Created site config');

  // Create gallery categories
  const portraitCat = await prisma.galleryCategory.upsert({
    where: { slug: 'portrait' },
    update: {},
    create: { name: '人像', slug: 'portrait', sortOrder: 1 },
  });
  const landscapeCat = await prisma.galleryCategory.upsert({
    where: { slug: 'landscape' },
    update: {},
    create: { name: '风景', slug: 'landscape', sortOrder: 2 },
  });
  const countyCat = await prisma.galleryCategory.upsert({
    where: { slug: 'county' },
    update: {},
    create: { name: '县城', slug: 'county', sortOrder: 3 },
  });
  const starsCat = await prisma.galleryCategory.upsert({
    where: { slug: 'stars' },
    update: {},
    create: { name: '星空', slug: 'stars', sortOrder: 4 },
  });
  console.log('Created gallery categories');

  // Create gallery works
  const works = [
    { slug: 'silent-ridge', title: '寂静的山脊', summary: '精选风景作品', coverImage: 'https://picsum.photos/seed/mountains/600/900.jpg', categoryId: landscapeCat.id, isFeatured: true },
    { slug: 'afternoon-light', title: '午后微光', summary: '人像摄影作品', coverImage: 'https://picsum.photos/seed/portrait/600/900.jpg', categoryId: portraitCat.id, isFeatured: true },
    { slug: 'unplaced-youth', title: '无处安放的青春', summary: '县城纪实作品', coverImage: 'https://picsum.photos/seed/town/600/900.jpg', categoryId: countyCat.id, isFeatured: false },
    { slug: 'echo-of-ages', title: '亿万年的回响', summary: '星空摄影作品', coverImage: 'https://picsum.photos/seed/stars/600/900.jpg', categoryId: starsCat.id, isFeatured: true },
  ];

  for (const work of works) {
    await prisma.galleryWork.upsert({
      where: { slug: work.slug },
      update: {},
      create: {
        ...work,
        isPublished: true,
        sortOrder: works.indexOf(work),
      },
    });
  }
  console.log('Created gallery works');

  // Create videos
  const videos = [
    { slug: 'photo-basic', title: '摄影基础入门', description: '从零开始学习摄影基础知识', platform: 'bilibili', videoUrl: 'https://www.bilibili.com/video/BV1xx411c7mD', coverImage: 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=摄影基础入门', durationSeconds: 930, category: '教学视频' },
    { slug: 'portrait-tips', title: '人像摄影技巧', description: '掌握人像摄影的构图、光线和姿势指导', platform: 'bilibili', videoUrl: 'https://www.bilibili.com/video/BV1xx411c7mD', coverImage: 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=人像摄影技巧', durationSeconds: 1215, category: '教学视频' },
    { slug: 'landscape-practice', title: '风景摄影实战', description: '探索风景摄影的拍摄技巧和后期处理方法', platform: 'bilibili', videoUrl: 'https://www.bilibili.com/video/BV1xx411c7mD', coverImage: 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=风景摄影实战', durationSeconds: 1125, category: '教学视频' },
    { slug: 'county-record', title: '县城摄影记录', description: '记录县城的日常生活和人文风情', platform: 'bilibili', videoUrl: 'https://www.bilibili.com/video/BV1xx411c7mD', coverImage: 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=县城摄影记录', durationSeconds: 740, category: '摄影县城' },
    { slug: 'boudoir-art', title: '私房摄影艺术', description: '私房摄影的艺术表达与创作思路', platform: 'bilibili', videoUrl: 'https://www.bilibili.com/video/BV1xx411c7mD', coverImage: 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=私房摄影艺术', durationSeconds: 1000, category: '摄影县城' },
    { slug: 'post-processing', title: '后期处理教程', description: 'Lightroom和Photoshop后期处理技巧分享', platform: 'bilibili', videoUrl: 'https://www.bilibili.com/video/BV1xx411c7mD', coverImage: 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=后期处理教程', durationSeconds: 1330, category: '教学视频' },
  ];

  for (const video of videos) {
    await prisma.video.upsert({
      where: { slug: video.slug },
      update: {},
      create: { ...video, isPublished: true, sortOrder: videos.indexOf(video) },
    });
  }
  console.log('Created videos');

  // Create workshops
  const workshops = [
    { slug: 'portrait-practice', title: '人像摄影实战班', subtitle: 'Portrait Photography Practice', summary: '深入学习人像摄影的构图技巧', coverImage: 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=人像摄影实战班', priceText: '¥1,280', location: '县城摄影基地', level: '中级', durationText: '3天2晚', status: 'registration_open', capacity: 12, enrolledCount: 8 },
    { slug: 'landscape-camp', title: '风景摄影创作营', subtitle: 'Landscape Photography Camp', summary: '探索自然风光的拍摄技巧', coverImage: 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=风景摄影创作营', priceText: '¥1,580', location: '山峦风景区', level: '高级', durationText: '4天3晚', status: 'registration_open', capacity: 8, enrolledCount: 5 },
    { slug: 'county-record-class', title: '县城摄影记录班', subtitle: 'County Documentary Photography', summary: '记录县城的日常生活和人文风情', coverImage: 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=县城摄影记录班', priceText: '¥980', location: '县城老街', level: '初级', durationText: '2天', status: 'full', capacity: 15, enrolledCount: 15 },
    { slug: 'advanced-postprocessing', title: '后期处理进阶班', subtitle: 'Advanced Post-Processing', summary: '深入学习Lightroom和Photoshop的高级调色技巧', coverImage: 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=后期处理进阶班', priceText: '¥680', location: '线上直播', level: '中级', durationText: '3周', status: 'registration_open', capacity: 20, enrolledCount: 12 },
    { slug: 'kenya-wildlife-expedition', title: '肯尼亚"野生动物行为"摄影远征团', subtitle: 'Kenya Wildlife Expedition', summary: '深入马赛马拉国家保护区', coverImage: 'https://picsum.photos/seed/kenya/600/900.jpg', priceText: '¥36,800/人', location: '马赛马拉国家保护区', level: '高级', durationText: '11天', status: 'registration_open', capacity: 8, enrolledCount: 3, isFeatured: true },
  ];

  for (const ws of workshops) {
    const workshop = await prisma.workshop.upsert({
      where: { slug: ws.slug },
      update: {},
      create: {
        ...ws,
        isPublished: true,
        sortOrder: workshops.indexOf(ws),
      },
    });

    // Add highlights for Kenya expedition
    if (ws.slug === 'kenya-wildlife-expedition') {
      await prisma.workshopHighlight.deleteMany({ where: { workshopId: workshop.id } });
      await prisma.workshopItinerary.deleteMany({ where: { workshopId: workshop.id } });
      await prisma.workshopFeeItem.deleteMany({ where: { workshopId: workshop.id } });

      await prisma.workshopHighlight.createMany({
        data: [
          { workshopId: workshop.id, title: '独家拍摄角度', content: '深入马赛马拉核心区域', sortOrder: 0 },
          { workshopId: workshop.id, title: '专业指导', content: '全程由资深野生动物摄影师指导', sortOrder: 1 },
          { workshopId: workshop.id, title: '精品小团', content: '仅限8人', sortOrder: 2 },
        ],
      });

      await prisma.workshopItinerary.createMany({
        data: [
          { workshopId: workshop.id, dayIndex: 1, title: '第1天：抵达内罗毕', content: '抵达后入住酒店', sortOrder: 0 },
          { workshopId: workshop.id, dayIndex: 2, title: '第2天：内罗毕 → 马赛马拉', content: '搭乘小型飞机前往马赛马拉', sortOrder: 1 },
          { workshopId: workshop.id, dayIndex: 3, title: '第3-9天：马赛马拉深度拍摄', content: '每天早晚两次Safari', sortOrder: 2 },
          { workshopId: workshop.id, dayIndex: 4, title: '第10天：马赛马拉 → 内罗毕', content: '上午最后一次Safari', sortOrder: 3 },
          { workshopId: workshop.id, dayIndex: 5, title: '第11天：离开内罗毕', content: '送机', sortOrder: 4 },
        ],
      });

      await prisma.workshopFeeItem.createMany({
        data: [
          { workshopId: workshop.id, type: 'included', content: '全程住宿', sortOrder: 0 },
          { workshopId: workshop.id, type: 'included', content: '所有餐饮', sortOrder: 1 },
          { workshopId: workshop.id, type: 'included', content: '国家保护区门票', sortOrder: 2 },
          { workshopId: workshop.id, type: 'excluded', content: '国际机票', sortOrder: 3 },
          { workshopId: workshop.id, type: 'excluded', content: '签证费用', sortOrder: 4 },
        ],
      });
    }
  }
  console.log('Created workshops');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  console.log('--- 当前用户列表 ---');
  console.log(JSON.stringify(users, null, 2));

  const admin = users.find((u) => u.email === 'admin@xoice.com');
  if (admin) {
    const newHash = await bcrypt.hash('admin123', 10);
    await prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash: newHash },
    });
    console.log('--- 已重置 admin@xoice.com 密码为 admin123 ---');
  } else {
    console.log('--- 数据库中无 admin@xoice.com，正在创建 ---');
    const newHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@xoice.com',
        passwordHash: newHash,
        name: 'Xoice',
        role: 'admin',
      },
    });
    console.log('--- 已创建 admin@xoice.com / admin123 ---');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

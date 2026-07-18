import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function main() {
  console.log('process.env.JWT_SECRET =', JSON.stringify(process.env.JWT_SECRET));

  // Login to get a fresh token
  const user = await prisma.user.findUnique({ where: { email: 'admin@xoice.com' } });
  if (!user) throw new Error('No admin user');

  const valid = await bcrypt.compare('admin123', user.passwordHash);
  console.log('password check (admin123):', valid);

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET || 'dev-secret-key',
    { expiresIn: '7d' },
  );
  console.log('signed token with env secret, length:', token.length);

  // Try verifying with both secrets
  for (const secret of [process.env.JWT_SECRET, 'dev-secret-key', 'dev-secret-key-change-in-production']) {
    if (!secret) continue;
    try {
      const decoded = jwt.verify(token, secret);
      console.log(`verify with "${secret.slice(0, 20)}...": OK ->`, JSON.stringify(decoded));
    } catch (e: unknown) {
      console.log(`verify with "${secret.slice(0, 20)}...": FAIL ->`, e instanceof Error ? e.message : String(e));
    }
  }

  // Also verify the response from real /login
  const res = await fetch('http://localhost:3000/api/v1/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@xoice.com', password: 'admin123' }),
  });
  const body = await res.json();
  const realToken = body.data.accessToken;
  console.log('\nreal /login token length:', realToken.length);

  for (const secret of [process.env.JWT_SECRET, 'dev-secret-key', 'dev-secret-key-change-in-production']) {
    if (!secret) continue;
    try {
      jwt.verify(realToken, secret);
      console.log(`real verify with "${secret.slice(0, 20)}...": OK`);
    } catch (e: unknown) {
      console.log(`real verify with "${secret.slice(0, 20)}...": FAIL ->`, e instanceof Error ? e.message : String(e));
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

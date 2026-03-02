import { PrismaClient } from '@prisma/client';

// Singleton — bot faqat bitta connection ishlatadi
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['warn', 'error']
    : ['error'],
});

export default prisma;

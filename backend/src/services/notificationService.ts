import prisma from '../utils/db';

export const createNotification = async (userId: string, title: string, message: string, type: string = 'info') => {
  // 1. Store in DB
  const notification = await prisma.notification.create({
    data: { userId, title, message, type }
  });

  // 2. Mock Email Trigger
  console.log(`[MOCK EMAIL] To: user@example.com, Subject: ${title}, Body: ${message}`);

  return notification;
};

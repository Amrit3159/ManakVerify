import { prisma } from '../lib/prisma';
import { AuthUserPayload } from '../types';

export class NotificationService {
  static async getUserNotifications(user: AuthUserPayload) {
    return await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async markAsRead(id: string, user: AuthUserPayload) {
    const notif = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notif || notif.userId !== user.id) {
      const error: any = new Error('Notification not found.');
      error.statusCode = 404;
      throw error;
    }

    return await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(user: AuthUserPayload) {
    return await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  static async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    link?: string;
  }) {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        link: data.link || null,
      },
    });
  }
}

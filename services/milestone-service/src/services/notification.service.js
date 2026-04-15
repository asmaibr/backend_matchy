import notificationRepository from '../repositories/notification.repository.js';

class NotificationService {
  async createNotification(notificationData) {
    try {
      const notificationId = await notificationRepository.create(notificationData);
      return notificationId;
    } catch (error) {
      console.error('Error creating notification:', error);
      // Don't throw error - notifications are not critical
      return null;
    }
  }

  async getNotifications(userId, userType) {
    return await notificationRepository.findByUser(userId, userType);
  }

  async getUnreadCount(userId, userType) {
    const count = await notificationRepository.getUnreadCount(userId, userType);
    return { count };
  }

  async markAsRead(id) {
    await notificationRepository.markAsRead(id);
    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId, userType) {
    await notificationRepository.markAllAsRead(userId, userType);
    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(id) {
    await notificationRepository.delete(id);
    return { message: 'Notification deleted' };
  }
}

export default new NotificationService();

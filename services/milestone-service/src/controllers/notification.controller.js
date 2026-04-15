import notificationService from '../services/notification.service.js';

class NotificationController {
  async getNotifications(req, res) {
    try {
      const { userType, userId } = req.params;
      const notifications = await notificationService.getNotifications(userId, userType);
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const { userType, userId } = req.params;
      const result = await notificationService.getUnreadCount(userId, userType);
      res.json(result);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  }

  async markAsRead(req, res) {
    try {
      const result = await notificationService.markAsRead(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const { userType, userId } = req.params;
      const result = await notificationService.markAllAsRead(userId, userType);
      res.json(result);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  }

  async deleteNotification(req, res) {
    try {
      const result = await notificationService.deleteNotification(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  }
}

export default new NotificationController();

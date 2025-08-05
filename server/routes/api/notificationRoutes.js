const express = require('express');
const router = express.Router();
const Notification = require('../../models/Notification');
const { authenticateToken } = require('../../config/passportConfig');

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Get unread count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.user.id, 
      read: false 
    });
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread count', error: error.message });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, userId: req.user.id },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications', error: error.message });
  }
});

// Create notification (internal use)
const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data
    });
    
    await notification.save();
    
    // Send real-time notification via Socket.io
    const io = require('../../index').get('io');
    if (io) {
      io.to(`user-${userId}`).emit('notification', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Export for use in other routes
module.exports = { router, createNotification }; 
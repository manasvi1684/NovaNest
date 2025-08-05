import io from 'socket.io-client';

const API_BASE_URL = 'http://localhost:3001/api/notifications';
let socket = null;

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// Initialize Socket.io connection
export const initializeSocket = (userId) => {
  if (!socket) {
    socket = io('http://localhost:3001');
    socket.emit('join-user', userId);
  }
  return socket;
};

// Disconnect Socket.io
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Get user notifications
export const getNotifications = async () => {
  const response = await fetch(API_BASE_URL, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse(response);
};

// Get unread count
export const getUnreadCount = async () => {
  const response = await fetch(`${API_BASE_URL}/unread-count`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse(response);
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  const response = await fetch(`${API_BASE_URL}/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse(response);
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await fetch(`${API_BASE_URL}/mark-all-read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse(response);
};

// Listen for real-time notifications
export const onNotification = (callback) => {
  if (socket) {
    socket.on('notification', callback);
  }
};

// Remove notification listener
export const offNotification = (callback) => {
  if (socket) {
    socket.off('notification', callback);
  }
}; 
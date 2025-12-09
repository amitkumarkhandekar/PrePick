import { useState, useEffect } from 'react';
import { showBrowserNotification, playNotificationSound } from '../services/notificationService';
import '../styles/Notification.css';

const NotificationToast = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification-toast ${notification.type}`}>
      <div className="notification-icon">
        {notification.type === 'order' && '🛍️'}
        {notification.type === 'ready' && '✅'}
        {notification.type === 'confirmed' && '👍'}
        {notification.type === 'completed' && '🎉'}
      </div>
      <div className="notification-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
      </div>
      <button className="notification-close" onClick={onClose}>✕</button>
    </div>
  );
};

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Show browser notification
    showBrowserNotification(notification.title, {
      body: notification.message,
      tag: `notification-${id}`
    });
    
    // Play sound
    playNotificationSound();
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Expose addNotification globally
  useEffect(() => {
    window.showNotification = addNotification;
    return () => {
      delete window.showNotification;
    };
  }, []);

  return (
    <div className="notification-center">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationCenter;

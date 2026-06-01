import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationRead, getUnreadCount } from '../services/api';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        getNotifications(user.userId),
        getUnreadCount(user.userId),
      ]);
      setNotifications(notifRes.data);
      setUnread(countRes.data.unreadCount || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'TRANSACTION': return { icon: '💳', bg: 'rgba(16, 185, 129, 0.12)' };
      case 'LOAN': return { icon: '📋', bg: 'rgba(59, 130, 246, 0.12)' };
      case 'ACCOUNT': return { icon: '🏦', bg: 'rgba(99, 102, 241, 0.12)' };
      default: return { icon: '🔔', bg: 'rgba(245, 158, 11, 0.12)' };
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h2>Notifications</h2>
          <p>{unread > 0 ? `You have ${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}</p>
        </div>
        {unread > 0 && (
          <span className="badge badge-purple" style={{ fontSize: 14, padding: '6px 14px' }}>
            {unread} unread
          </span>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <h3>No notifications</h3>
            <p>You'll see notifications here when transactions or loan events occur</p>
          </div>
        ) : (
          notifications.map((n) => {
            const { icon, bg } = getIcon(n.type);
            return (
              <div
                key={n.id}
                className={`notification-item ${!n.read ? 'unread' : ''}`}
                onClick={() => !n.read && handleMarkRead(n.id)}
                style={{ cursor: !n.read ? 'pointer' : 'default' }}
              >
                <div className="notification-dot" style={{ background: bg }}>{icon}</div>
                <div className="notification-content" style={{ flex: 1 }}>
                  <h4>{n.subject}</h4>
                  <p>{n.message}</p>
                  <div className="notification-time">{formatTime(n.createdAt)}</div>
                </div>
                {!n.read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0, marginTop: 6 }} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

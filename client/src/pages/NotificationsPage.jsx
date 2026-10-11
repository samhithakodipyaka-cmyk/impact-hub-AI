import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import {
  IconBell,
  IconCheck,
  IconShieldCheck,
  IconUsers,
  IconCheckCircle,
} from '../components/common/Icons';

export default function NotificationsPage() {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge badge-category" style={{ marginBottom: '0.4rem' }}>
              <IconBell width={14} height={14} /> Alerts
            </div>
            <h1>Your Notifications</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Updates on participation status, verification reviews, and community interactions.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="btn btn-outline btn-sm"
            >
              <IconCheck width={15} height={15} /> Mark All as Read
            </button>
          )}
        </div>

        {notifications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  cursor: n.link ? 'pointer' : 'default',
                  borderLeft: !n.isRead ? '4px solid var(--forest-700)' : '1px solid var(--border-subtle)',
                  backgroundColor: !n.isRead ? '#FFFFFF' : 'var(--bg-subtle)',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: n.type === 'verification' ? 'var(--verified-bg)' : 'var(--sage-surface)',
                    color: n.type === 'verification' ? 'var(--verified-color)' : 'var(--forest-800)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconShieldCheck width={18} height={18} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <h4 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--forest-900)' }}>{n.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                    {n.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IconBell width={24} height={24} />
            </div>
            <h3 className="empty-state-title">No notifications yet</h3>
            <p className="empty-state-desc">
              When you register for initiatives or organizers verify your attendance, updates will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import WorkerLayout from '../components/WorkerLayout';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  return (
    <WorkerLayout title="Notifications & Alerts">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--tb-text)' }}>
            🔔 সাম্প্রতিক নোটিফিকেশন (Notifications)
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--tb-text-soft)' }}>
            মোট: {notifications.length} টি
          </span>
        </div>

        <div style={{
          background: 'var(--tb-surface)',
          border: '1px solid var(--tb-border)',
          borderRadius: 'var(--tb-radius-md)',
          padding: '20px',
          boxShadow: 'var(--tb-shadow)'
        }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--tb-text-soft)', padding: '20px' }}>
              নোটিফিকেশন লোড হচ্ছে...
            </p>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--tb-text-soft)', padding: '30px' }}>
              আপনার কোনো নতুন নোটিফিকেশন নেই।
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--tb-radius-sm)',
                    border: '1px solid var(--tb-border)',
                    background: item.is_read ? 'var(--tb-bg-soft)' : 'rgba(6, 182, 212, 0.08)',
                    borderLeft: item.is_read ? '1px solid var(--tb-border)' : '4px solid var(--tb-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: item.is_read ? '600' : '700', color: 'var(--tb-text)' }}>
                      {item.title || 'Notification Alert'}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--tb-text-muted)' }}>
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--tb-text-soft)', lineHeight: '1.4' }}>
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </WorkerLayout>
  );
}
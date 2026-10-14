import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function WorkerLayout({ children, title }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/worker-dashboard' },
    { name: 'Browse Tasks', path: '/worker/browse-tasks' },
    { name: 'My Tasks', path: '/worker/my-tasks' },
    { name: 'My Submissions', path: '/worker/submissions' },
    { name: 'Earnings & Wallet', path: '/worker/wallet' },
    { name: 'Withdraw Funds', path: '/worker/withdraw' },
    // নতুন সংযুক্ত ৩টি লিডারবোর্ড ও অপশন
    { name: 'সর্বাধিক রেফারকারী (Top Referrers)', path: '/worker/top-referrals' },
    { name: 'সর্বাধিক উপার্জনকারী (Top Earners)', path: '/worker/top-earners' },
    { name: 'সর্বাধিক টাস্ক সম্পন্নকারী (Top Task Completers)', path: '/worker/top-tasks' },
    
    { name: 'Notifications', path: '/worker/notifications' },
    { name: 'Messages / Support', path: '/worker/support' },
    { name: 'My Profile', path: '/worker/profile' },
    { name: 'Settings & Security', path: '/worker/settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--tb-bg)', color: 'var(--tb-text)' }}>
      {/* Sidebar for Desktop */}
      <aside style={{
        width: '270px',
        background: 'var(--tb-surface-solid)',
        borderRight: '1px solid var(--tb-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 50,
        overflowY: 'auto'
      }}>
        {/* Brand Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--tb-border)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--tb-text)' }}>
            TaskBang
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--tb-secondary)', fontWeight: '600', margin: '0' }}>
            Tasks. Talent. Trust. (Worker)
          </p>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--tb-radius-sm)',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? '#ffffff' : 'var(--tb-text-soft)',
                  background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--tb-secondary)' : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--tb-border)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              borderRadius: 'var(--tb-radius-sm)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            লগআউট (Logout)
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '270px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{
          height: '70px',
          background: 'var(--tb-surface)',
          borderBottom: '1px solid var(--tb-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(8px)'
        }}>
          <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--tb-text)' }}>
            {title || 'Worker Dashboard'}
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--tb-text-soft)' }}>
            Work • Earn • Grow
          </div>
        </header>

        {/* Page Body */}
        <main style={{ padding: '32px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
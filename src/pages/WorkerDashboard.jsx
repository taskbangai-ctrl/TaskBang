import React, { useState, useEffect } from 'react';
import WorkerLayout from '../components/WorkerLayout';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    balance: 0,
    completedTasks: 0,
    pendingSubmissions: 0,
    totalReferrals: 0,
  });

  const [recentTasks, setRecentTasks] = useState([]);
  const [topEarners, setTopEarners] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [topCompleters, setTopCompleters] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // ১. সাম্প্রতিক ওপেন টাস্কসমূহ ফেচ করা
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'active')
        .limit(5);

      if (tasksData) setRecentTasks(tasksData);

      // ২. লিডারবোর্ড ও স্ট্যাটিস্টিক্স ফেচিং (ডেমো/বাস্তব ডাটাবেস কোয়েরি স্ট্রাকচার)
      // নোট: প্রোডাকশন ডেটাবেসের ভিউ বা কোয়েরি অনুযায়ী এটি আপডেট হবে
      
    } catch (err) {
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkerLayout title="Worker Dashboard">
      {/* ১. ওভারভিউ স্ট্যাট কার্ডস (Summary Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={cardStyle}>
          <span style={cardTitleStyle}>মোট ব্যালেন্স (Balance)</span>
          <h3 style={{ ...cardValueStyle, color: 'var(--tb-secondary)' }}>৳ {stats.balance.toFixed(2)}</h3>
        </div>

        <div style={cardStyle}>
          <span style={cardTitleStyle}>সম্পন্নকৃত টাস্ক</span>
          <h3 style={cardValueStyle}>{stats.completedTasks} টি</h3>
        </div>

        <div style={cardStyle}>
          <span style={cardTitleStyle}>অপেক্ষমাণ জমা (Pending)</span>
          <h3 style={{ ...cardValueStyle, color: 'var(--tb-warning)' }}>{stats.pendingSubmissions} টি</h3>
        </div>

        <div style={cardStyle}>
          <span style={cardTitleStyle}>মোট রেফারেল</span>
          <h3 style={{ ...cardValueStyle, color: 'var(--tb-primary-hover)' }}>{stats.totalReferrals} জন</h3>
        </div>
      </div>

      {/* ২. নতুন ৩টি লিডারবোর্ড সেকশন (Top Performers Section) */}
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--tb-text)' }}>
        🏆 প্ল্যাটফর্ম লিডারবোর্ড (Top Performers)
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '36px'
      }}>
        {/* ১. সর্বাধিক রেফারকারী */}
        <div style={leaderboardCardStyle}>
          <div style={leaderboardHeaderStyle}>
            <span style={{ fontWeight: '700', fontSize: '14px' }}>🥇 সর্বাধিক রেফারকারী</span>
            <Link to="/worker/top-referrals" style={linkStyle}>সব দেখুন →</Link>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--tb-text-soft)', textAlign: 'center', padding: '16px 0' }}>
            এখনো ডাটা আপডেট হচ্ছে...
          </div>
        </div>

        {/* ২. সর্বাধিক উপার্জনকারী */}
        <div style={leaderboardCardStyle}>
          <div style={leaderboardHeaderStyle}>
            <span style={{ fontWeight: '700', fontSize: '14px' }}>💰 সর্বাধিক উপার্জনকারী</span>
            <Link to="/worker/top-earners" style={linkStyle}>সব দেখুন →</Link>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--tb-text-soft)', textAlign: 'center', padding: '16px 0' }}>
            এখনো ডাটা আপডেট হচ্ছে...
          </div>
        </div>

        {/* ৩. সর্বাধিক টাস্ক সম্পন্নকারী */}
        <div style={leaderboardCardStyle}>
          <div style={leaderboardHeaderStyle}>
            <span style={{ fontWeight: '700', fontSize: '14px' }}>✅ সর্বাধিক টাস্ক সম্পন্নকারী</span>
            <Link to="/worker/top-tasks" style={linkStyle}>সব দেখুন →</Link>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--tb-text-soft)', textAlign: 'center', padding: '16px 0' }}>
            এখনো ডাটা আপডেট হচ্ছে...
          </div>
        </div>
      </div>

      {/* ৩. সাম্প্রতিক উপলব্ধ কাজ (Recent Available Tasks) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--tb-text)' }}>
          নতুন কাজসমূহ (Recent Tasks)
        </h2>
        <Link to="/worker/browse-tasks" style={linkStyle}>সকল কাজ দেখুন →</Link>
      </div>

      <div style={cardStyle}>
        {recentTasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--tb-text-soft)', margin: '20px 0', fontSize: '14px' }}>
            বর্তমানে কোনো কাজ খালি নেই। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentTasks.map((task) => (
              <div key={task.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: 'var(--tb-bg-soft)',
                borderRadius: 'var(--tb-radius-sm)',
                border: '1px solid var(--tb-border)'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--tb-text)' }}>{task.title}</h4>
                  <span style={{ fontSize: '12px', color: 'var(--tb-text-soft)' }}>
                    রিওয়ার্ড: <strong style={{ color: 'var(--tb-secondary)' }}>৳ {task.reward_amount}</strong>
                  </span>
                </div>
                <Link to={`/worker/task/${task.id}`} style={{
                  padding: '8px 14px',
                  background: 'var(--tb-secondary)',
                  color: '#070b14',
                  borderRadius: 'var(--tb-radius-sm)',
                  fontSize: '12px',
                  fontWeight: '700',
                  textDecoration: 'none'
                }}>
                  কাজ দেখুন
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkerLayout>
  );
}

// Inline Styles for Clean Architecture
const cardStyle = {
  background: 'var(--tb-surface)',
  border: '1px solid var(--tb-border)',
  borderRadius: 'var(--tb-radius-md)',
  padding: '20px',
  boxShadow: 'var(--tb-shadow)'
};

const cardTitleStyle = {
  fontSize: '13px',
  color: 'var(--tb-text-soft)',
  fontWeight: '500'
};

const cardValueStyle = {
  fontSize: '24px',
  fontWeight: '800',
  margin: '8px 0 0 0',
  color: 'var(--tb-text)'
};

const leaderboardCardStyle = {
  background: 'var(--tb-surface)',
  border: '1px solid var(--tb-border)',
  borderRadius: 'var(--tb-radius-md)',
  padding: '16px'
};

const leaderboardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '12px',
  borderBottom: '1px solid var(--tb-border)',
  marginBottom: '12px',
  color: 'var(--tb-text)'
};

const linkStyle = {
  fontSize: '12px',
  color: 'var(--tb-secondary)',
  fontWeight: '600',
  textDecoration: 'none'
};
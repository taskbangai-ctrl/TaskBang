import React, { useState, useEffect } from 'react';
import WorkerLayout from '../components/WorkerLayout';
import { supabase } from '../supabaseClient';

export default function TopEarners() {
  const [topEarners, setTopEarners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopEarners();
  }, []);

  const fetchTopEarners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, balance')
        .order('balance', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTopEarners(data || []);
    } catch (err) {
      console.error('Error fetching top earners:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkerLayout title="Top Earners Leaderboard">
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--tb-text)' }}>
        💰 সর্বাধিক উপার্জনকারী (Top Earners Leaderboard)
      </h2>

      <div style={{
        background: 'var(--tb-surface)',
        border: '1px solid var(--tb-border)',
        borderRadius: 'var(--tb-radius-md)',
        padding: '20px',
        boxShadow: 'var(--tb-shadow)',
        overflowX: 'auto'
      }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--tb-text-soft)', padding: '20px' }}>
            লিডারবোর্ড লোড হচ্ছে...
          </p>
        ) : topEarners.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--tb-text-soft)', padding: '20px' }}>
            কোনো ডাটা পাওয়া যায়নি।
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--tb-border)', color: 'var(--tb-text-soft)' }}>
                <th style={{ padding: '12px' }}>র‍্যাঙ্ক</th>
                <th style={{ padding: '12px' }}>ওয়ার্কারের নাম</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>মোট ইনকাম (BDT)</th>
              </tr>
            </thead>
            <tbody>
              {topEarners.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid var(--tb-border)' }}>
                  <td style={{ padding: '12px', fontWeight: '800' }}>
                    {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                  </td>
                  <td style={{ padding: '12px', fontWeight: '600', color: 'var(--tb-text)' }}>
                    {item.full_name || 'Anonymous User'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '800', color: 'var(--tb-secondary)' }}>
                    ৳ {(item.balance || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </WorkerLayout>
  );
}
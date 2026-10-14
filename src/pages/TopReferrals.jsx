import React, { useState, useEffect } from 'react';
import WorkerLayout from '../components/WorkerLayout';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function TopReferrals() {
  const { user } = useAuth();
  const [topReferrers, setTopReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // ইউজারের রেফারেল লিংক
  const refCode = user?.id ? user.id.slice(0, 8) : 'TBWORKER';
  const referralLink = `${window.location.origin}/signup?ref=${refCode}`;

  useEffect(() => {
    fetchTopReferrers();
  }, []);

  const fetchTopReferrers = async () => {
    try {
      setLoading(true);
      // রেফারেল সংখ্যা অনুসারে প্রোফাইল লিস্ট আনা
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, total_referrals, email')
        .order('total_referrals', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTopReferrers(data || []);
    } catch (err) {
      console.error('Error fetching top referrers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <WorkerLayout title="Top Referrers & Referral Program">
      
      {/* ১. রেফারেল কার্ড ও শেয়ারিং অপশন */}
      <div style={{
        background: 'var(--tb-surface)',
        border: '1px solid var(--tb-border)',
        borderRadius: 'var(--tb-radius-md)',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: 'var(--tb-shadow)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--tb-text)' }}>
          🔗 আপনার রেফারেল লিংক (Your Referral Link)
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--tb-text-soft)', margin: '0 0 16px 0' }}>
          আপনার লিংকের মাধ্যমে বন্ধুদের আমন্ত্রণ জানান এবং তাদের কাজ থেকে রেফারেল বোনাস উপার্জন করুন।
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            readOnly
            value={referralLink}
            style={{
              flex: 1,
              minWidth: '260px',
              padding: '12px',
              background: 'var(--tb-bg-soft)',
              border: '1px solid var(--tb-border)',
              borderRadius: 'var(--tb-radius-sm)',
              color: 'var(--tb-secondary)',
              fontWeight: '600',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button
            onClick={handleCopy}
            style={{
              padding: '12px 24px',
              background: 'var(--tb-secondary)',
              color: '#070b14',
              fontWeight: '700',
              border: 'none',
              borderRadius: 'var(--tb-radius-sm)',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            {copied ? 'কপি হয়েছে! ✓' : 'লিংক কপি করুন'}
          </button>
        </div>
      </div>

      {/* ২. সর্বাধিক রেফারকারী লিডারবোর্ড টেবিল */}
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--tb-text)' }}>
        🥇 সর্বাধিক রেফারকারী (Top Referrers Leaderboard)
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
        ) : topReferrers.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--tb-text-soft)', padding: '20px' }}>
            এখনো কোনো রেফারেল তথ্য পাওয়া যায়নি।
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--tb-border)', color: 'var(--tb-text-soft)' }}>
                <th style={{ padding: '12px' }}>র‍্যাঙ্ক</th>
                <th style={{ padding: '12px' }}>ওয়ার্কারের নাম</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>মোট রেফারেল</th>
              </tr>
            </thead>
            <tbody>
              {topReferrers.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid var(--tb-border)' }}>
                  <td style={{ padding: '12px', fontWeight: '800' }}>
                    {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                  </td>
                  <td style={{ padding: '12px', fontWeight: '600', color: 'var(--tb-text)' }}>
                    {item.full_name || 'Anonymous User'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '800', color: 'var(--tb-secondary)' }}>
                    {item.total_referrals || 0} জন
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
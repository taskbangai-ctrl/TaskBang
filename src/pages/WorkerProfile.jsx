import React, { useState, useEffect } from 'react';
import WorkerLayout from '../components/WorkerLayout';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function WorkerProfile() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultMethod, setDefaultMethod] = useState('bkash');
  const [defaultAccount, setDefaultAccount] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setDefaultMethod(data.default_payout_method || 'bkash');
        setDefaultAccount(data.default_payout_account || '');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          default_payout_method: defaultMethod,
          default_payout_account: defaultAccount,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!' });
    } catch (err) {
      console.error('Profile update error:', err);
      setMessage({ type: 'error', text: err.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' });
      setNewPassword('');
    } catch (err) {
      console.error('Password update error:', err);
      setMessage({ type: 'error', text: err.message || 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে।' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkerLayout title="My Profile & Settings">
      
      {/* মেসেজ অ্যালার্ট */}
      {message.text && (
        <div style={{
          padding: '14px 16px',
          borderRadius: 'var(--tb-radius-sm)',
          marginBottom: '24px',
          fontSize: '14px',
          fontWeight: '500',
          background: message.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${message.type === 'success' ? 'var(--tb-success)' : 'var(--tb-danger)'}`,
          color: message.type === 'success' ? '#4ade80' : '#f87171'
        }}>
          {message.text}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {/* ব্যক্তিগত তথ্য আপডেট ফর্ম */}
        <div style={{
          background: 'var(--tb-surface)',
          border: '1px solid var(--tb-border)',
          borderRadius: 'var(--tb-radius-md)',
          padding: '24px',
          boxShadow: 'var(--tb-shadow)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0', color: 'var(--tb-text)' }}>
            👤 ব্যক্তিগত তথ্য (Personal Details)
          </h3>

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                ইমেইল (পরিবর্তনযোগ্য নয়)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--tb-border)',
                  borderRadius: 'var(--tb-radius-sm)',
                  color: 'var(--tb-text-muted)',
                  fontSize: '13px',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                পূর্ণ নাম
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--tb-bg-soft)',
                  border: '1px solid var(--tb-border)',
                  borderRadius: 'var(--tb-radius-sm)',
                  color: 'var(--tb-text)',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                মোবাইল নম্বর
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--tb-bg-soft)',
                  border: '1px solid var(--tb-border)',
                  borderRadius: 'var(--tb-radius-sm)',
                  color: 'var(--tb-text)',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--tb-border)', margin: '8px 0' }} />

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                ডিফল্ট পেমেন্ট মাধ্যম
              </label>
              <select
                value={defaultMethod}
                onChange={(e) => setDefaultMethod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--tb-bg-soft)',
                  border: '1px solid var(--tb-border)',
                  borderRadius: 'var(--tb-radius-sm)',
                  color: 'var(--tb-text)',
                  outline: 'none',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <option value="bkash">বিকাশ (bKash)</option>
                <option value="nagad">নগদ (Nagad)</option>
                <option value="rocket">রকেট (Rocket)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                ডিফল্ট অ্যাকাউন্ট নম্বর
              </label>
              <input
                type="text"
                value={defaultAccount}
                onChange={(e) => setDefaultAccount(e.target.value)}
                placeholder="01XXXXXXXXX"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--tb-bg-soft)',
                  border: '1px solid var(--tb-border)',
                  borderRadius: 'var(--tb-radius-sm)',
                  color: 'var(--tb-text)',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px',
                padding: '12px',
                background: 'var(--tb-secondary)',
                color: '#070b14',
                fontWeight: '700',
                border: 'none',
                borderRadius: 'var(--tb-radius-sm)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontSize: '13px'
              }}
            >
              {loading ? 'সংরক্ষণ হচ্ছে...' : 'তথ্য সংরক্ষণ করুন'}
            </button>
          </form>
        </div>

        {/* সিকিউরিটি / পাসওয়ার্ড আপডেট ফর্ম */}
        <div style={{
          background: 'var(--tb-surface)',
          border: '1px solid var(--tb-border)',
          borderRadius: 'var(--tb-radius-md)',
          padding: '24px',
          boxShadow: 'var(--tb-shadow)',
          height: 'fit-content'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0', color: 'var(--tb-text)' }}>
            🔒 সিকিউরিটি ও পাসওয়ার্ড (Security)
          </h3>

          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                নতুন পাসওয়ার্ড (New Password)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="কমপক্ষে ৬টি অক্ষর লিখুন"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--tb-bg-soft)',
                  border: '1px solid var(--tb-border)',
                  borderRadius: 'var(--tb-radius-sm)',
                  color: 'var(--tb-text)',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px',
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid var(--tb-danger)',
                color: '#f87171',
                fontWeight: '700',
                borderRadius: 'var(--tb-radius-sm)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontSize: '13px'
              }}
            >
              {loading ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
            </button>
          </form>
        </div>
      </div>

    </WorkerLayout>
  );
}
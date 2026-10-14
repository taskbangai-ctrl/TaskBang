import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('worker'); // ডিফল্ট রোল worker
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // ১. সুপাবেস অথ দিয়ে সাইনআপ
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error('রেজিস্ট্রেশন সফল হয়নি। পুনরায় চেষ্টা করুন।');

      // ২. profiles টেবিলে ইউজারের রোল ও নাম সেভ করা (যদি ট্রিগার আগে থেকে না থাকে)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          { 
            id: user.id, 
            full_name: fullName, 
            role: role,
            email: email 
          }
        ]);

      if (profileError) {
        console.error('Profile creation warning:', profileError.message);
      }

      // ৩. রোল অনুযায়ী ড্যাশবোর্ডে রিডায়রেক্ট করা
      if (role === 'client') {
        navigate('/client-dashboard');
      } else {
        navigate('/worker-dashboard');
      }

    } catch (err) {
      setErrorMsg(err.message || 'রেজিস্ট্রেশন করার সময় একটি সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--tb-bg)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--tb-surface)',
        border: '1px solid var(--tb-border)',
        borderRadius: 'var(--tb-radius-xl)',
        padding: '36px 28px',
        boxShadow: 'var(--tb-shadow)',
        backdropFilter: 'blur(12px)'
      }}>
        {/* ব্র্যান্ড হেডার */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--tb-text)' }}>
            TaskBang
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--tb-secondary)', fontWeight: '600', margin: '0 0 4px 0' }}>
            Tasks. Talent. Trust.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--tb-text-soft)', margin: '0' }}>
            নতুন অ্যাকাউন্ট তৈরি করুন (Work • Earn • Grow)
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--tb-danger)',
            color: '#f87171',
            padding: '12px',
            borderRadius: 'var(--tb-radius-sm)',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
              পূর্ণ নাম
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="আপনার নাম লিখুন"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--tb-bg-soft)',
                border: '1px solid var(--tb-border)',
                borderRadius: 'var(--tb-radius-sm)',
                color: 'var(--tb-text)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
              ইমেইল অ্যাড্রেস
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--tb-bg-soft)',
                border: '1px solid var(--tb-border)',
                borderRadius: 'var(--tb-radius-sm)',
                color: 'var(--tb-text)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--tb-bg-soft)',
                border: '1px solid var(--tb-border)',
                borderRadius: 'var(--tb-radius-sm)',
                color: 'var(--tb-text)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
              অ্যাকাউন্টের ধরণ (Role)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--tb-bg-soft)',
                border: '1px solid var(--tb-border)',
                borderRadius: 'var(--tb-radius-sm)',
                color: 'var(--tb-text)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="worker">Worker (কাজ করে আয় করতে চাই)</option>
              <option value="client">Client (কাজ করাতে চাই)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '12px',
              background: 'var(--tb-secondary)',
              color: '#070b14',
              fontWeight: '700',
              border: 'none',
              borderRadius: 'var(--tb-radius-sm)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'সাইন আপ করুন'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--tb-text-soft)' }}>
          ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
          <Link to="/login" style={{ color: 'var(--tb-secondary)', fontWeight: '600', textDecoration: 'none' }}>
            লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
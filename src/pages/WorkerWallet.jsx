import React, { useState, useEffect } from 'react';
import WorkerLayout from '../components/WorkerLayout';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function WorkerWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [method, setMethod] = useState('bkash');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      fetchWalletData();
      fetchWithdrawalHistory();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        setBalance(data.balance || 0);
      }
    } catch (err) {
      console.error('Wallet fetch error:', err);
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setWithdrawals(data);
      }
    } catch (err) {
      console.error('Withdrawal history error:', err);
    }
  };

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'সঠিক উত্তোলনের পরিমাণ লিখুন।' });
      return;
    }

    if (amount > balance) {
      setMessage({ type: 'error', text: 'আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।' });
      return;
    }

    if (amount < 200) {
      setMessage({ type: 'error', text: 'সর্বনিম্ন ২০০ টাকা উত্তোলন করা সম্ভব।' });
      return;
    }

    if (!accountNumber.trim()) {
      setMessage({ type: 'error', text: 'আপনার পেমেন্ট অ্যাকাউন্ট নম্বরটি দিন।' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // উইথড্র রিকোয়েস্ট ইনসার্ট করা
      const { error } = await supabase.from('withdrawals').insert([
        {
          worker_id: user.id,
          amount: amount,
          method: method,
          account_number: accountNumber,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'আপনার উত্তোলনের আবেদন সফলভাবে জমা হয়েছে!' });
      setWithdrawAmount('');
      setAccountNumber('');
      fetchWalletData();
      fetchWithdrawalHistory();
    } catch (err) {
      console.error('Withdraw error:', err);
      setMessage({ type: 'error', text: err.message || 'উইথড্র রিকোয়েস্ট জমা দিতে সমস্যা হয়েছে।' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkerLayout title="Earnings & Wallet">
      
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

      {/* ১. ব্যালেন্স কার্ড ও উইথড্র ফর্ম গ্রিড */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '36px'
      }}>
        {/* ব্যালেন্স ওভারভিউ */}
        <div style={{
          background: 'var(--tb-surface)',
          border: '1px solid var(--tb-border)',
          borderRadius: 'var(--tb-radius-md)',
          padding: '24px',
          boxShadow: 'var(--tb-shadow)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--tb-text-soft)', fontWeight: '500' }}>
            বর্তমান প্রধান ব্যালেন্স (Main Balance)
          </span>
          <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '12px 0 8px 0', color: 'var(--tb-secondary)' }}>
            ৳ {balance.toFixed(2)}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--tb-text-muted)', margin: 0 }}>
            অনুমোদিত টাস্ক ও রেফারেল থেকে অর্জিত মোট অর্থ। সর্বনিম্ন উইথড্র limit: ৳ ২০০
          </p>
        </div>

        {/* টাকা উত্তোলনের ফর্ম */}
        <div style={{
          background: 'var(--tb-surface)',
          border: '1px solid var(--tb-border)',
          borderRadius: 'var(--tb-radius-md)',
          padding: '24px',
          boxShadow: 'var(--tb-shadow)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0', color: 'var(--tb-text)' }}>
            💸 টাকা উত্তোলন করুন (Withdraw Funds)
          </h3>

          <form onSubmit={handleWithdrawRequest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                পেমেন্ট মাধ্যম (Method)
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
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
                অ্যাকাউন্ট নম্বর (Account Number)
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
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

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                টাকার পরিমাণ (Amount in BDT)
              </label>
              <input
                type="number"
                required
                min="200"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="ন্যূনতম ২০০ টাকা"
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
                marginTop: '4px',
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
              {loading ? 'আবেদন জমা হচ্ছে...' : 'উইথড্র রিকোয়েস্ট পাঠান'}
            </button>
          </form>
        </div>
      </div>

      {/* ২. উত্তোলনের ইতিহাস (Withdrawal History) */}
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--tb-text)' }}>
        📜 উইথড্র ইতিহাস (Withdrawal History)
      </h2>

      <div style={{
        background: 'var(--tb-surface)',
        border: '1px solid var(--tb-border)',
        borderRadius: 'var(--tb-radius-md)',
        padding: '20px',
        boxShadow: 'var(--tb-shadow)',
        overflowX: 'auto'
      }}>
        {withdrawals.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--tb-text-soft)', margin: '20px 0', fontSize: '14px' }}>
            আপনার কোনো উইথড্র ইতিহাস নেই।
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--tb-border)', color: 'var(--tb-text-soft)' }}>
                <th style={{ padding: '12px' }}>তারিখ</th>
                <th style={{ padding: '12px' }}>মাধ্যম</th>
                <th style={{ padding: '12px' }}>নম্বর</th>
                <th style={{ padding: '12px' }}>পরিমাণ</th>
                <th style={{ padding: '12px' }}>স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--tb-border)' }}>
                  <td style={{ padding: '12px', color: 'var(--tb-text-soft)' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--tb-text)' }}>
                    {item.method}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--tb-text-soft)' }}>{item.account_number}</td>
                  <td style={{ padding: '12px', fontWeight: '700', color: 'var(--tb-secondary)' }}>৳ {item.amount}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--tb-radius-sm)',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: item.status === 'approved' ? 'rgba(34, 197, 94, 0.15)' : item.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: item.status === 'approved' ? '#4ade80' : item.status === 'rejected' ? '#f87171' : '#facc15'
                    }}>
                      {item.status.toUpperCase()}
                    </span>
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
import React, { useState, useEffect } from 'react';
import ClientLayout from '../components/ClientLayout';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function ClientWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      fetchWalletData();
      fetchDepositHistory();
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

  const fetchDepositHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setDeposits(data);
      }
    } catch (err) {
      console.error('Deposit history error:', err);
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const depositAmount = parseFloat(amount);

    if (isNaN(depositAmount) || depositAmount <= 0) {
      setMessage({ type: 'error', text: 'সঠিক ডিপোজিট পরিমাণ লিখুন।' });
      return;
    }

    if (depositAmount < 100) {
      setMessage({ type: 'error', text: 'সর্বনিম্ন ১০০ টাকা ডিপোজিট করতে হবে।' });
      return;
    }

    if (!senderNumber.trim() || !trxId.trim()) {
      setMessage({ type: 'error', text: 'সেন্ডার নম্বর এবং TrxID প্রদান করা বাধ্যতামূলক।' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const { error } = await supabase.from('deposits').insert([
        {
          client_id: user.id,
          amount: depositAmount,
          method: method,
          sender_number: senderNumber,
          trx_id: trxId,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'ডিপোজিট আবেদন সফলভাবে জমা হয়েছে! অ্যাডমিন যাচাই করে ব্যালেন্স যুক্ত করবেন।' });
      setAmount('');
      setSenderNumber('');
      setTrxId('');
      fetchDepositHistory();
    } catch (err) {
      console.error('Deposit submit error:', err);
      setMessage({ type: 'error', text: err.message || 'ডিপোজিট জমা দিতে সমস্যা হয়েছে।' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout title="Deposit & Wallet">
      
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

      {/* ১. ব্যালেন্স কার্ড ও ডিপোজিট ফর্ম গ্রিড */}
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
            উপলব্ধ ডিপোজিট ব্যালেন্স (Available Balance)
          </span>
          <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '12px 0 8px 0', color: 'var(--tb-secondary)' }}>
            ৳ {balance.toFixed(2)}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--tb-text-muted)', margin: 0 }}>
            নতুন কাজ পোস্ট করার জন্য এই ব্যালেন্স ব্যবহার করা হবে।
          </p>
        </div>

        {/* অর্থ জমা করার ফর্ম */}
        <div style={{
          background: 'var(--tb-surface)',
          border: '1px solid var(--tb-border)',
          borderRadius: 'var(--tb-radius-md)',
          padding: '24px',
          boxShadow: 'var(--tb-shadow)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0', color: 'var(--tb-text)' }}>
            💳 ফান্ড ডিপোজিট করুন (Add Funds)
          </h3>

          <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                পেমেন্ট মাধ্যম (Payment Method)
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
                <option value="bkash">বিকাশ Cash In / Send Money (01XXXXXXXXX)</option>
                <option value="nagad">নগদ Cash In / Send Money (01XXXXXXXXX)</option>
                <option value="rocket">রকেট Send Money (01XXXXXXXXX)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                টাকার পরিমাণ (Amount in BDT)
              </label>
              <input
                type="number"
                required
                min="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="ন্যূনতম ১০০ টাকা"
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
                যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Number)
              </label>
              <input
                type="text"
                required
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
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
                ট্রানজেকশন আইডি (Transaction ID / TrxID)
              </label>
              <input
                type="text"
                required
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                placeholder="যেমন: 9J7A6B5C4D"
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
              {loading ? 'আবেদন জমা হচ্ছে...' : 'ডিপোজিট আবেদন জমা দিন'}
            </button>
          </form>
        </div>
      </div>

      {/* ২. ডিপোজিট ইতিহাস (Deposit History) */}
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--tb-text)' }}>
        📜 ডিপোজিট ইতিহাস (Deposit History)
      </h2>

      <div style={{
        background: 'var(--tb-surface)',
        border: '1px solid var(--tb-border)',
        borderRadius: 'var(--tb-radius-md)',
        padding: '20px',
        boxShadow: 'var(--tb-shadow)',
        overflowX: 'auto'
      }}>
        {deposits.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--tb-text-soft)', margin: '20px 0', fontSize: '14px' }}>
            আপনার কোনো ডিপোজিট ইতিহাস নেই।
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--tb-border)', color: 'var(--tb-text-soft)' }}>
                <th style={{ padding: '12px' }}>তারিখ</th>
                <th style={{ padding: '12px' }}>মাধ্যম</th>
                <th style={{ padding: '12px' }}>সেন্ডার নম্বর</th>
                <th style={{ padding: '12px' }}>TrxID</th>
                <th style={{ padding: '12px' }}>পরিমাণ</th>
                <th style={{ padding: '12px' }}>স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--tb-border)' }}>
                  <td style={{ padding: '12px', color: 'var(--tb-text-soft)' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--tb-text)' }}>
                    {item.method}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--tb-text-soft)' }}>{item.sender_number}</td>
                  <td style={{ padding: '12px', color: 'var(--tb-text-soft)', fontFamily: 'monospace' }}>{item.trx_id}</td>
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

    </ClientLayout>
  );
}
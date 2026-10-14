import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../supabaseClient';

export default function AdminDashboard() {
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // ১. পেন্ডিং ডিপোজিট রিকোয়েস্টসমূহ ফেচ করা
      const { data: depData } = await supabase
        .from('deposits')
        .select(`
          *,
          profiles!deposits_client_id_fkey ( full_name, email )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (depData) setPendingDeposits(depData);

      // ২. পেন্ডিং উইথড্রয়াল রিকোয়েস্টসমূহ ফেচ করা
      const { data: withData } = await supabase
        .from('withdrawals')
        .select(`
          *,
          profiles!withdrawals_worker_id_fkey ( full_name, email )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (withData) setPendingWithdrawals(withData);

    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ডিপোজিট অ্যাপ্রুভ লজিক
  const handleApproveDeposit = async (dep) => {
    try {
      setProcessingId(dep.id);
      setMessage({ type: '', text: '' });

      // ১. ডিপোজিট স্ট্যাটাস আপডেট
      const { error: depErr } = await supabase
        .from('deposits')
        .update({ status: 'approved' })
        .eq('id', dep.id);

      if (depErr) throw depErr;

      // ২. ক্লায়েন্টের ব্যালেন্সে ক্যাশ যোগ করা
      const { data: clientProfile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', dep.client_id)
        .single();

      const currentBal = clientProfile?.balance || 0;

      await supabase
        .from('profiles')
        .update({ balance: currentBal + dep.amount })
        .eq('id', dep.client_id);

      setMessage({ type: 'success', text: `৳ ${dep.amount} ডিপোজিট সফলভাবে অ্যাপ্রুভ হয়েছে এবং ক্লায়েন্ট অ্যাকাউন্টে যোগ করা হয়েছে।` });
      fetchAdminData();
    } catch (err) {
      console.error('Deposit approve error:', err);
      setMessage({ type: 'error', text: err.message || 'ডিপোজিট অ্যাপ্রুভ করতে সমস্যা হয়েছে।' });
    } finally {
      setProcessingId(null);
    }
  };

  // উইথড্রয়াল অ্যাপ্রুভ লজিক
  const handleApproveWithdrawal = async (withItem) => {
    try {
      setProcessingId(withItem.id);
      setMessage({ type: '', text: '' });

      const { error } = await supabase
        .from('withdrawals')
        .update({ status: 'approved' })
        .eq('id', withItem.id);

      if (error) throw error;

      setMessage({ type: 'success', text: `৳ ${withItem.amount} উইথড্রয়াল সফলভাবে পেড হিসেবে মার্ক করা হয়েছে।` });
      fetchAdminData();
    } catch (err) {
      console.error('Withdrawal approve error:', err);
      setMessage({ type: 'error', text: err.message || 'উইথড্রয়াল প্রসেস করতে সমস্যা হয়েছে।' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout title="Admin Control Dashboard">
      
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

      {/* ওভারভিউ কার্ডস */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={cardStyle}>
          <span style={cardTitleStyle}>অপেক্ষমাণ ডিপোজিট (Pending)</span>
          <h3 style={{ ...cardValueStyle, color: 'var(--tb-warning)' }}>{pendingDeposits.length} টি</h3>
        </div>

        <div style={cardStyle}>
          <span style={cardTitleStyle}>অপেক্ষমাণ উইথড্রয়াল (Pending)</span>
          <h3 style={{ ...cardValueStyle, color: '#f87171' }}>{pendingWithdrawals.length} টি</h3>
        </div>
      </div>

      {/* ১. পেন্ডিং ডিপোজিট তালিকা */}
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--tb-text)' }}>
        💳 অপেক্ষমাণ ক্লায়েন্ট ডিপোজিট রিকোয়েস্ট (Pending Deposits)
      </h2>

      <div style={{
        background: 'var(--tb-surface)',
        border: '1px solid var(--tb-border)',
        borderRadius: 'var(--tb-radius-md)',
        padding: '20px',
        marginBottom: '36px',
        boxShadow: 'var(--tb-shadow)',
        overflowX: 'auto'
      }}>
        {pendingDeposits.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--tb-text-soft)', margin: '16px 0', fontSize: '14px' }}>
            কোনো পেন্ডিং ডিপোজিট রিকোয়েস্ট নেই।
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--tb-border)', color: 'var(--tb-text-soft)' }}>
                <th style={{ padding: '12px' }}>ক্লায়েন্ট</th>
                <th style={{ padding: '12px' }}>মেথড</th>
                <th style={{ padding: '12px' }}>সেন্ডার নম্বর</th>
                <th style={{ padding: '12px' }}>TrxID</th>
                <th style={{ padding: '12px' }}>পরিমাণ</th>
                <th style={{ padding: '12px' }}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {pendingDeposits.map((dep) => (
                <tr key={dep.id} style={{ borderBottom: '1px solid var(--tb-border)' }}>
                  <td style={{ padding: '12px', color: 'var(--tb-text)' }}>
                    <strong>{dep.profiles?.full_name || 'Client'}</strong><br />
                    <span style={{ fontSize: '11px', color: 'var(--tb-text-soft)' }}>{dep.profiles?.email}</span>
                  </td>
                  <td style={{ padding: '12px', textTransform: 'uppercase', color: 'var(--tb-text-soft)' }}>{dep.method}</td>
                  <td style={{ padding: '12px', color: 'var(--tb-text-soft)' }}>{dep.sender_number}</td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', color: 'var(--tb-secondary)' }}>{dep.trx_id}</td>
                  <td style={{ padding: '12px', fontWeight: '800', color: 'var(--tb-secondary)' }}>৳ {dep.amount}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleApproveDeposit(dep)}
                      disabled={processingId === dep.id}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--tb-secondary)',
                        color: '#070b14',
                        border: 'none',
                        borderRadius: 'var(--tb-radius-sm)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {processingId === dep.id ? 'প্রসেস হচ্ছে...' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ২. পেন্ডিং উইথড্রয়াল তালিকা */}
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--tb-text)' }}>
        💸 অপেক্ষমাণ ওয়ার্কার উইথড্রয়াল রিকোয়েস্ট (Pending Withdrawals)
      </h2>

      <div style={{
        background: 'var(--tb-surface)',
        border: '1px solid var(--tb-border)',
        borderRadius: 'var(--tb-radius-md)',
        padding: '20px',
        boxShadow: 'var(--tb-shadow)',
        overflowX: 'auto'
      }}>
        {pendingWithdrawals.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--tb-text-soft)', margin: '16px 0', fontSize: '14px' }}>
            কোনো পেন্ডিং উইথড্রয়াল রিকোয়েস্ট নেই।
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--tb-border)', color: 'var(--tb-text-soft)' }}>
                <th style={{ padding: '12px' }}>ওয়ার্কার</th>
                <th style={{ padding: '12px' }}>মেথড</th>
                <th style={{ padding: '12px' }}>একাউন্ট নম্বর</th>
                <th style={{ padding: '12px' }}>পরিমাণ</th>
                <th style={{ padding: '12px' }}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {pendingWithdrawals.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--tb-border)' }}>
                  <td style={{ padding: '12px', color: 'var(--tb-text)' }}>
                    <strong>{item.profiles?.full_name || 'Worker'}</strong><br />
                    <span style={{ fontSize: '11px', color: 'var(--tb-text-soft)' }}>{item.profiles?.email}</span>
                  </td>
                  <td style={{ padding: '12px', textTransform: 'uppercase', color: 'var(--tb-text-soft)' }}>{item.method}</td>
                  <td style={{ padding: '12px', color: 'var(--tb-text-soft)' }}>{item.account_number}</td>
                  <td style={{ padding: '12px', fontWeight: '800', color: 'var(--tb-secondary)' }}>৳ {item.amount}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleApproveWithdrawal(item)}
                      disabled={processingId === item.id}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid var(--tb-success)',
                        color: '#4ade80',
                        borderRadius: 'var(--tb-radius-sm)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {processingId === item.id ? 'প্রসেস হচ্ছে...' : 'Mark Paid'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </AdminLayout>
  );
}

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
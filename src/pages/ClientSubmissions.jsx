import React, { useState, useEffect } from 'react';
import ClientLayout from '../components/ClientLayout';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function ClientSubmissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user, filterStatus]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      // ১. ক্লায়েন্টের নিজস্ব পোস্ট করা টাস্ক আইডিগুলো বের করা
      const { data: myTasks, error: taskError } = await supabase
        .from('tasks')
        .select('id')
        .eq('client_id', user.id);

      if (taskError) throw taskError;

      if (!myTasks || myTasks.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      const taskIds = myTasks.map(t => t.id);

      // ২. ওই টাস্কগুলোর অধীনে আসা সাবমিশন ফেচ করা
      let query = supabase
        .from('submissions')
        .select(`
          id,
          task_id,
          worker_id,
          proof_text,
          proof_link,
          status,
          submitted_at,
          rejection_reason,
          tasks ( title, reward_amount ),
          profiles!submissions_worker_id_fkey ( full_name, email )
        `)
        .in('task_id', taskIds)
        .order('submitted_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data: subData, error: subError } = await query;
      if (subError) throw subError;

      setSubmissions(subData || []);
    } catch (err) {
      console.error('Fetch submissions error:', err);
    } finally {
      setLoading(false);
    }
  };

  // কাজ অ্যাপ্রুভ করা এবং ওয়ার্কারকে অর্থ দেওয়া
  const handleApprove = async (sub) => {
    try {
      setProcessingId(sub.id);
      setMessage({ type: '', text: '' });

      // ১. সাবমিশন স্ট্যাটাস আপডেট
      const { error: subErr } = await supabase
        .from('submissions')
        .update({ status: 'approved' })
        .eq('id', sub.id);

      if (subErr) throw subErr;

      // ২. ওয়ার্কারের অ্যাকাউন্টে টাকা যোগ করা
      const reward = sub.tasks?.reward_amount || 0;
      if (reward > 0 && sub.worker_id) {
        // ওয়ার্কারের বর্তমান ব্যালেন্স আনা
        const { data: wProfile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', sub.worker_id)
          .single();

        const currentBal = wProfile?.balance || 0;

        // নতুন ব্যালেন্স সেভ
        await supabase
          .from('profiles')
          .update({ balance: currentBal + reward })
          .eq('id', sub.worker_id);
      }

      setMessage({ type: 'success', text: 'সাবমিশনটি সফলভাবে অনুমোদিত হয়েছে এবং ওয়ার্কারের ওয়ালেটে টাকা পৌঁছে গেছে!' });
      fetchSubmissions();
    } catch (err) {
      console.error('Approve error:', err);
      setMessage({ type: 'error', text: err.message || 'অ্যাপ্রুভ করতে সমস্যা হয়েছে।' });
    } finally {
      setProcessingId(null);
    }
  };

  // কাজ রিজেক্ট করা
  const handleReject = async (sub) => {
    const reason = window.prompt('রিজেক্ট করার কারণ লিখুন (ওয়ার্কার দেখতে পাবে):');
    if (reason === null) return; // বাতিল করা হলে

    try {
      setProcessingId(sub.id);
      setMessage({ type: '', text: '' });

      const { error } = await supabase
        .from('submissions')
        .update({
          status: 'rejected',
          rejection_reason: reason || 'প্রমাণ সঠিক নয়'
        })
        .eq('id', sub.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'সাবমিশনটি বাতিল করা হয়েছে।' });
      fetchSubmissions();
    } catch (err) {
      console.error('Reject error:', err);
      setMessage({ type: 'error', text: err.message || 'রিজেক্ট করতে সমস্যা হয়েছে।' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <ClientLayout title="Review Submissions">
      
      {/* মেসেজ অ্যালার্ট */}
      {message.text && (
        <div style={{
          padding: '14px 16px',
          borderRadius: 'var(--tb-radius-sm)',
          marginBottom: '20px',
          fontSize: '14px',
          fontWeight: '500',
          background: message.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${message.type === 'success' ? 'var(--tb-success)' : 'var(--tb-danger)'}`,
          color: message.type === 'success' ? '#4ade80' : '#f87171'
        }}>
          {message.text}
        </div>
      )}

      {/* ফিল্টার হেডার */}
      <div style={{
        background: 'var(--tb-surface)',
        border: '1px solid var(--tb-border)',
        borderRadius: 'var(--tb-radius-md)',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--tb-text)' }}>
          ওয়ার্কারদের জমাকৃত প্রুফ পর্যালোচনা
        </h3>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['pending', 'approved', 'rejected', 'all'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--tb-radius-sm)',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'capitalize',
                border: '1px solid var(--tb-border)',
                cursor: 'pointer',
                background: filterStatus === st ? 'var(--tb-secondary)' : 'var(--tb-bg-soft)',
                color: filterStatus === st ? '#070b14' : 'var(--tb-text-soft)'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* সাবমিশন লিস্ট */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--tb-text-soft)', padding: '40px' }}>
          সাবমিশন লোড হচ্ছে...
        </p>
      ) : submissions.length === 0 ? (
        <div style={{
          background: 'var(--tb-surface)',
          border: '1px solid var(--tb-border)',
          borderRadius: 'var(--tb-radius-md)',
          padding: '40px',
          textAlign: 'center',
          color: 'var(--tb-text-soft)'
        }}>
          কোনো জমাকৃত সাবমিশন খুঁজে পাওয়া যায়নি।
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {submissions.map((sub) => (
            <div key={sub.id} style={{
              background: 'var(--tb-surface)',
              border: '1px solid var(--tb-border)',
              borderRadius: 'var(--tb-radius-md)',
              padding: '20px',
              boxShadow: 'var(--tb-shadow)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--tb-secondary)', fontWeight: '700' }}>
                    টাস্ক: {sub.tasks?.title || 'Unknown Task'}
                  </span>
                  <h4 style={{ margin: '4px 0 2px 0', fontSize: '15px', color: 'var(--tb-text)' }}>
                    ওয়ার্কার: {sub.profiles?.full_name || 'Anonymous Worker'} ({sub.profiles?.email})
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--tb-text-muted)' }}>
                    জমা দেওয়ার সময়: {new Date(sub.submitted_at).toLocaleString()}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: 'var(--tb-text-soft)', display: 'block' }}>রিওয়ার্ড</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--tb-secondary)' }}>
                    ৳ {sub.tasks?.reward_amount || 0}
                  </span>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--tb-border)', margin: '12px 0' }} />

              {/* প্রুফের বিষয়বস্তু */}
              <div style={{ background: 'var(--tb-bg-soft)', padding: '12px 14px', borderRadius: 'var(--tb-radius-sm)', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--tb-text-soft)', display: 'block', marginBottom: '4px' }}>
                  📝 প্রমাণের বিবরণ (Proof Text):
                </span>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--tb-text)', whiteSpace: 'pre-line' }}>
                  {sub.proof_text || 'কোনো টেক্সট প্রুফ দেওয়া হয়নি।'}
                </p>

                {sub.proof_link && (
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--tb-text-soft)' }}>
                      🔗 প্রুফ লিংক / স্ক্রিনশট:{' '}
                    </span>
                    <a
                      href={sub.proof_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--tb-secondary)', fontSize: '13px', textDecoration: 'underline' }}
                    >
                      {sub.proof_link}
                    </a>
                  </div>
                )}
              </div>

              {/* অ্যাকশন বাটন বা স্ট্যাটাস */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--tb-radius-sm)',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: sub.status === 'approved' ? 'rgba(34, 197, 94, 0.15)' : sub.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                    color: sub.status === 'approved' ? '#4ade80' : sub.status === 'rejected' ? '#f87171' : '#facc15'
                  }}>
                    {sub.status.toUpperCase()}
                  </span>
                </div>

                {sub.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleReject(sub)}
                      disabled={processingId === sub.id}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid var(--tb-danger)',
                        color: '#f87171',
                        borderRadius: 'var(--tb-radius-sm)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      বাতিল করুন (Reject)
                    </button>

                    <button
                      onClick={() => handleApprove(sub)}
                      disabled={processingId === sub.id}
                      style={{
                        padding: '8px 16px',
                        background: 'var(--tb-secondary)',
                        border: 'none',
                        color: '#070b14',
                        borderRadius: 'var(--tb-radius-sm)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {processingId === sub.id ? 'প্রসেস হচ্ছে...' : 'অনুমোদন ও অর্থ প্রদান (Approve)'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </ClientLayout>
  );
}
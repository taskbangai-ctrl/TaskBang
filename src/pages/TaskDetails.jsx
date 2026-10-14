import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkerLayout from '../components/WorkerLayout';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function TaskDetails() {
  const { taskId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proofText, setProofText] = useState('');
  const [proofLink, setProofLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTaskAndSubmission();
  }, [taskId, user]);

  const fetchTaskAndSubmission = async () => {
    try {
      setLoading(true);

      // ১. টাস্কের বিস্তারিত বিবরণ ফেচ করা
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;
      setTask(taskData);

      // ২. এই ওয়ার্কার আগে কাজ জমা দিয়েছে কি না তা চেক করা (Duplicate Prevention)
      if (user) {
        const { data: subData } = await supabase
          .from('submissions')
          .select('id, status')
          .eq('task_id', taskId)
          .eq('worker_id', user.id)
          .maybeSingle();

        if (subData) {
          setAlreadySubmitted(true);
        }
      }
    } catch (err) {
      console.error('Error fetching task details:', err);
      setMessage({ type: 'error', text: 'কাজের বিবরণ লোড করতে সমস্যা হয়েছে।' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!proofText.trim()) {
      setMessage({ type: 'error', text: 'অনুগ্রহ করে প্রুফের বর্ণনা লিখুন।' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: '', text: '' });

      // সাবমিশন টেবিলে ইনসার্ট করা
      const { error } = await supabase.from('submissions').insert([
        {
          task_id: taskId,
          worker_id: user.id,
          proof_text: proofText,
          proof_link: proofLink || null,
          status: 'pending',
          submitted_at: new Date().toISOString()
        }
      ]);

      if (error) throw error;

      setAlreadySubmitted(true);
      setMessage({ type: 'success', text: 'আপনার প্রুফ সফলভাবে জমা হয়েছে! ক্লায়েন্ট পর্যালোচনার পর রিওয়ার্ড যোগ হবে।' });
    } catch (err) {
      console.error('Submission error:', err);
      setMessage({ type: 'error', text: err.message || 'প্রুফ জমা দেওয়ার সময় সমস্যা হয়েছে।' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <WorkerLayout title="Task Details">
        <p style={{ textAlign: 'center', color: 'var(--tb-text-soft)', padding: '40px' }}>
          কাজের তথ্য লোড হচ্ছে...
        </p>
      </WorkerLayout>
    );
  }

  if (!task) {
    return (
      <WorkerLayout title="Task Details">
        <p style={{ textAlign: 'center', color: 'var(--tb-danger)', padding: '40px' }}>
          কাজটি খুঁজে পাওয়া যায়নি বা এটি মুছে ফেলা হয়েছে।
        </p>
      </WorkerLayout>
    );
  }

  return (
    <WorkerLayout title={task.title}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
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

        {/* টাস্ক হেডার কার্ড */}
        <div style={{
          background: 'var(--tb-surface)',
          border: '1px solid var(--tb-border)',
          borderRadius: 'var(--tb-radius-md)',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: 'var(--tb-shadow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                color: 'var(--tb-secondary)',
                background: 'rgba(6, 182, 212, 0.1)',
                padding: '4px 10px',
                borderRadius: 'var(--tb-radius-sm)'
              }}>
                {task.category || 'Microtask'}
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '12px 0 4px 0', color: 'var(--tb-text)' }}>
                {task.title}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: 'var(--tb-text-soft)' }}>টাস্ক রিওয়ার্ড</span>
              <h3 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: 'var(--tb-secondary)' }}>
                ৳ {task.reward_amount}
              </h3>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--tb-border)', margin: '16px 0' }} />

          {/* কাজের বিবরণ ও নির্দেশাবলী */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--tb-text)', marginBottom: '8px' }}>
              📋 কাজের নির্দেশাবলী (Task Instructions):
            </h4>
            <p style={{
              fontSize: '14px',
              color: 'var(--tb-text-soft)',
              lineHeight: '1.6',
              whiteSpace: 'pre-line',
              margin: 0
            }}>
              {task.description || 'ক্লায়েন্ট থেকে অতিরিক্ত নির্দেশ দেওয়া হয়নি।'}
            </p>
          </div>
        </div>

        {/* প্রুফ সাবমিশন ফর্ম */}
        <div style={{
          background: 'var(--tb-surface)',
          border: '1px solid var(--tb-border)',
          borderRadius: 'var(--tb-radius-md)',
          padding: '24px',
          boxShadow: 'var(--tb-shadow)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0', color: 'var(--tb-text)' }}>
            📤 কাজের প্রমাণ জমা দিন (Submit Proof)
          </h3>

          {alreadySubmitted ? (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              background: 'var(--tb-bg-soft)',
              borderRadius: 'var(--tb-radius-sm)',
              border: '1px solid var(--tb-border)'
            }}>
              <span style={{ fontSize: '24px' }}>✅</span>
              <h4 style={{ margin: '8px 0 4px 0', color: 'var(--tb-text)' }}>
                আপনি ইতিমধ্যে এই কাজটি জমা দিয়েছেন!
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--tb-text-soft)', margin: 0 }}>
                ক্লায়েন্ট আপনার সাবমিশন পর্যালোচনা করছেন। অনুমোদিত হলে ব্যালেন্স যুক্ত হবে।
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitProof} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                  প্রমাণের বিবরণ (Text Proof) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="কাজ সম্পন্ন করার বিবরণ, ইউজারনেম বা প্রয়োজনীয় প্রুফ কোড লিখুন..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--tb-bg-soft)',
                    border: '1px solid var(--tb-border)',
                    borderRadius: 'var(--tb-radius-sm)',
                    color: 'var(--tb-text)',
                    outline: 'none',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                  স্ক্রিনশট বা প্রুফ লিংক (Proof URL / Image Drive Link)
                </label>
                <input
                  type="url"
                  value={proofLink}
                  onChange={(e) => setProofLink(e.target.value)}
                  placeholder="https://imgur.com/example.png বা গুগল ড্রাইভ লিংক"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--tb-bg-soft)',
                    border: '1px solid var(--tb-border)',
                    borderRadius: 'var(--tb-radius-sm)',
                    color: 'var(--tb-text)',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '12px',
                  background: 'var(--tb-secondary)',
                  color: '#070b14',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: 'var(--tb-radius-sm)',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  fontSize: '14px',
                  marginTop: '8px'
                }}
              >
                {submitting ? 'জমা হচ্ছে...' : 'প্রমাণ জমা দিন'}
              </button>
            </form>
          )}
        </div>

      </div>
    </WorkerLayout>
  );
}
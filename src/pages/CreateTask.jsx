import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function CreateTask() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ai_microtasks');
  const [description, setDescription] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // মোট বাজেট গণনা
  const totalCost = (parseFloat(rewardAmount) || 0) * (parseInt(capacity) || 0);

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setMessage({ type: 'error', text: 'শিরোনাম এবং কাজের বিবরণ দেওয়া আবশ্যক।' });
      return;
    }

    if (parseFloat(rewardAmount) <= 0 || parseInt(capacity) <= 0) {
      setMessage({ type: 'error', text: 'রিওয়ার্ড এবং ওয়ার্কার সংখ্যা ১ এর বেশি হতে হবে।' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // ১. ক্লায়েন্টের ডিপোজিট ব্যালেন্স চেক করা
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (!profile || (profile.balance || 0) < totalCost) {
        setMessage({ 
          type: 'error', 
          text: `আপনার ব্যালেন্স অপর্যাপ্ত। এই কাজের জন্য প্রয়োজন ৳ ${totalCost.toFixed(2)}, কিন্তু ওয়ালেটে আছে ৳ ${(profile?.balance || 0).toFixed(2)}` 
        });
        setLoading(false);
        return;
      }

      // ২. নতুন কাজ ইনসার্ট করা
      const { error: taskError } = await supabase.from('tasks').insert([
        {
          client_id: user.id,
          title: title,
          category: category,
          description: description,
          reward_amount: parseFloat(rewardAmount),
          capacity: parseInt(capacity),
          status: 'active',
          created_at: new Date().toISOString()
        }
      ]);

      if (taskError) throw taskError;

      // ৩. ব্যালেন্স থেকে কাটিং করা (ডিফাক্ট বাজেট লজিক)
      await supabase
        .from('profiles')
        .update({ balance: (profile.balance - totalCost) })
        .eq('id', user.id);

      setMessage({ type: 'success', text: 'কাজটি সফলভাবে পোস্ট করা হয়েছে!' });
      setTimeout(() => {
        navigate('/client-dashboard');
      }, 1500);

    } catch (err) {
      console.error('Task creation error:', err);
      setMessage({ type: 'error', text: err.message || 'কাজ পোস্ট করতে সমস্যা হয়েছে।' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout title="Create New Task">
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        
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

        <div style={{
          background: 'var(--tb-surface)',
          border: '1px solid var(--tb-border)',
          borderRadius: 'var(--tb-radius-md)',
          padding: '28px',
          boxShadow: 'var(--tb-shadow)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 20px 0', color: 'var(--tb-text)' }}>
            ➕ নতুন কাজ পোস্ট করুন
          </h2>

          <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                কাজের শিরোনাম (Task Title) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: অ্যাপে সাইনআপ করে স্ক্রিনশট দিন"
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

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                ক্যাটাগরি (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--tb-bg-soft)',
                  border: '1px solid var(--tb-border)',
                  borderRadius: 'var(--tb-radius-sm)',
                  color: 'var(--tb-text)',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="ai_microtasks">AI Microtasks</option>
                <option value="data_entry">Data Entry</option>
                <option value="form_filling">Form Filling</option>
                <option value="testing">Website/App Testing</option>
                <option value="marketing">Digital Marketing</option>
                <option value="other">Other Tasks</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                কাজের বিস্তারিত নির্দেশাবলী (Instructions) *
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ওয়ার্কাররা কীভাবে কাজ করবে এবং কী প্রমাণ জমা দেবে তা বিস্তারিত লিখুন..."
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                  প্রতি কাজের রিওয়ার্ড (BDT) *
                </label>
                <input
                  type="number"
                  required
                  step="0.5"
                  min="1"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  placeholder="যেমন: ১০"
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

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--tb-text-soft)' }}>
                  কতজন ওয়ার্কার প্রয়োজন? *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="যেমন: ৫০"
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
            </div>

            {/* হিসাব ও সমাপনী বাজেট বক্স */}
            <div style={{
              background: 'var(--tb-bg-soft)',
              border: '1px solid var(--tb-border)',
              borderRadius: 'var(--tb-radius-sm)',
              padding: '16px',
              marginTop: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '14px', color: 'var(--tb-text-soft)' }}>
                মোট আনুমানিক বাজেট (Total Cost):
              </span>
              <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--tb-secondary)' }}>
                ৳ {totalCost.toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '12px',
                padding: '12px',
                background: 'var(--tb-secondary)',
                color: '#070b14',
                fontWeight: '700',
                border: 'none',
                borderRadius: 'var(--tb-radius-sm)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontSize: '14px'
              }}
            >
              {loading ? 'কাজ পোস্ট হচ্ছে...' : 'কাজ পাবলিশ করুন'}
            </button>
          </form>
        </div>
      </div>
    </ClientLayout>
  );
}
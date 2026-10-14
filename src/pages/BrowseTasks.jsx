import React, { useState, useEffect } from 'react';
import WorkerLayout from '../components/WorkerLayout';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

export default function BrowseTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, [selectedCategory]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let query = supabase.from('tasks').select('*').eq('status', 'active');

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <WorkerLayout title="Browse Tasks">
      {/* ফিল্টার ও সার্চ সেকশন */}
      <div style={{
        background: 'var(--tb-surface)',
        border: '1px solid var(--tb-border)',
        borderRadius: 'var(--tb-radius-md)',
        padding: '20px',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* সার্চ বক্স */}
        <input
          type="text"
          placeholder="কাজের শিরোনাম লিখে খুঁজুন..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: '1 1 280px',
            padding: '12px 16px',
            background: 'var(--tb-bg-soft)',
            border: '1px solid var(--tb-border)',
            borderRadius: 'var(--tb-radius-sm)',
            color: 'var(--tb-text)',
            outline: 'none',
            fontSize: '14px'
          }}
        />

        {/* ক্যাটাগরি ফিল্টার */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '12px 16px',
            background: 'var(--tb-bg-soft)',
            border: '1px solid var(--tb-border)',
            borderRadius: 'var(--tb-radius-sm)',
            color: 'var(--tb-text)',
            outline: 'none',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="all">সকল ক্যাটাগরি (All Categories)</option>
          <option value="ai_microtasks">AI Microtasks</option>
          <option value="data_entry">Data Entry</option>
          <option value="form_filling">Form Filling</option>
          <option value="testing">Website/App Testing</option>
          <option value="marketing">Digital Marketing</option>
          <option value="other">Other Tasks</option>
        </select>
      </div>

      {/* টাস্ক গ্রিড তালিকা */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--tb-text-soft)', padding: '40px' }}>
          কাজ লোড করা হচ্ছে...
        </p>
      ) : filteredTasks.length === 0 ? (
        <div style={{
          background: 'var(--tb-surface)',
          border: '1px solid var(--tb-border)',
          borderRadius: 'var(--tb-radius-md)',
          padding: '40px',
          textAlign: 'center',
          color: 'var(--tb-text-soft)'
        }}>
          কোনো উপলব্ধ কাজ পাওয়া যায়নি।
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredTasks.map((task) => (
            <div key={task.id} style={{
              background: 'var(--tb-surface)',
              border: '1px solid var(--tb-border)',
              borderRadius: 'var(--tb-radius-md)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--tb-shadow)'
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    color: 'var(--tb-secondary)',
                    background: 'rgba(6, 182, 212, 0.1)',
                    padding: '4px 8px',
                    borderRadius: 'var(--tb-radius-sm)'
                  }}>
                    {task.category || 'General'}
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--tb-secondary)' }}>
                    ৳ {task.reward_amount}
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: 'var(--tb-text)' }}>
                  {task.title}
                </h3>
                
                <p style={{
                  fontSize: '13px',
                  color: 'var(--tb-text-soft)',
                  lineHeight: '1.5',
                  margin: '0 0 16px 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {task.description || 'কাজের বিবরণ দেখতে টাস্ক ডিটেইলসে যান।'}
                </p>
              </div>

              <div style={{
                borderTop: '1px solid var(--tb-border)',
                paddingTop: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '12px', color: 'var(--tb-text-muted)' }}>
                  বাকি ফাঁকা: {task.capacity ? `${task.capacity} টি` : 'উন্মুক্ত'}
                </span>
                <Link to={`/worker/task/${task.id}`} style={{
                  padding: '8px 16px',
                  background: 'var(--tb-secondary)',
                  color: '#070b14',
                  borderRadius: 'var(--tb-radius-sm)',
                  fontSize: '12px',
                  fontWeight: '700',
                  textDecoration: 'none'
                }}>
                  কাজটি শুরু করুন
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </WorkerLayout>
  );
}
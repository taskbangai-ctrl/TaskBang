import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // আপনার প্রজেক্টের সুপাবেস ক্লায়েন্ট পাথ অনুযায়ী ঠিক করে নিবেন

export default function WorkerProfile({ session }) {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const user = session.user;

      let { data, error } = await supabase
        .from('worker_profiles')
        .select(`full_name, bio, avatar_url`)
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setFullName(data.full_name || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error) {
      console.error('প্রোফাইল লোড করতে সমস্যা হয়েছে:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = session.user;

      const updates = {
        id: user.id,
        full_name: fullName,
        bio: bio,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      let { error } = await supabase.from('worker_profiles').upsert(updates);

      if (error) throw error;
      setMessage('প্রোফাইল সফলভাবে আপডেট হয়েছে!');
    } catch (error) {
      setMessage('এরর: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">ওয়ার্কার প্রোফাইল</h2>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg text-center">
          {message}
        </div>
      )}

      <form onSubmit={updateProfile} className="space-y-4">
        {/* ইমেল (রিড-অনলি) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">ইমেইল অ্যাকাউন্ট</label>
          <input
            type="text"
            value={session?.user?.email || ''}
            disabled
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 text-sm"
          />
        </div>

        {/* পুরো নাম */}
        <div>
          <label className="block text-sm font-medium text-gray-700">পূর্ণ নাম</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="আপনার নাম লিখুন"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* বায়ো বা বিবরণ */}
        <div>
          <label className="block text-sm font-medium text-gray-700">সংক্ষিপ্ত বায়ো (Bio)</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="আপনার দক্ষতা বা কাজের অভিজ্ঞতা সম্পর্কে কিছু লিখুন..."
            rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* প্রোফাইল পিকচার লিংক বা আপলোড */}
        <div>
          <label className="block text-sm font-medium text-gray-700">প্রোফাইল পিকচার URL</label>
          <input
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="ছবির লিংক দিন (Image URL)"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* সেভ বাটন */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {loading ? 'সংরক্ষণ হচ্ছে...' : 'প্রোফাইল সেভ করুন'}
        </button>
      </form>
    </div>
  );
}
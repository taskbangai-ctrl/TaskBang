import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ClientProfile({ session: propSession }) {
  const [session, setSession] = useState(propSession);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // সেশন বা ইউজার ডেটা ফেচ করা
  useEffect(() => {
    if (!propSession) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });
    } else {
      setSession(propSession);
    }
  }, [propSession]);

  // ক্লায়েন্টের রিয়েল নাম বের করার ফাংশন
  const getClientName = () => {
    const userMeta = session?.user?.user_metadata;
    return (
      userMeta?.full_name ||
      userMeta?.name ||
      userMeta?.display_name ||
      session?.user?.email?.split('@')[0] ||
      'Client Name'
    );
  };

  const [profile, setProfile] = useState({
    companyName: 'N. Tech Studio',
    customId: 'TB-C-000001',
    phone: '+880 18XXXXXXXXX',
    bio: 'Enterprise client & micro-task manager focused on quality assurance and secure digital growth. Dedicated to building a powerful ecosystem on TaskBang AI.',
    website: 'https://ntechstudio.com',
    avatarUrl: '',
    country: 'Bangladesh',
    memberSince: 'September 2026',
    isNidVerified: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    riskLevel: 'Enterprise Secure (Low Risk)',
    totalTasksPosted: 24,
    totalSpent: 450.00
  });

  const [fullNameInput, setFullNameInput] = useState('');

  useEffect(() => {
    if (session) {
      setFullNameInput(getClientName());
      if (session.user?.user_metadata?.company_name) {
        setProfile(prev => ({
          ...prev,
          companyName: session.user.user_metadata.company_name,
          phone: session.user.user_metadata.phone || prev.phone,
          website: session.user.user_metadata.website || prev.website,
          bio: session.user.user_metadata.bio || prev.bio,
          avatarUrl: session.user.user_metadata.avatar_url || prev.avatarUrl,
        }));
      }
    }
  }, [session]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fullName') {
      setFullNameInput(value);
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullNameInput,
          company_name: profile.companyName,
          phone: profile.phone,
          bio: profile.bio,
          website: profile.website,
          avatar_url: profile.avatarUrl,
        },
      });

      if (error) throw error;
      alert('প্রোফাইল এবং ভিআইপি সিকিউরিটি সেটিংস সফলভাবে আপডেট করা হয়েছে!');
      setIsEditing(false);
    } catch (error) {
      alert('ত্রুটি: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentDisplayName = fullNameInput || getClientName();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">
      {/* প্রিমিয়াম ভিআইপি হেডার ব্যানার */}
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl overflow-hidden shadow-2xl border border-indigo-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent"></div>
        
        <div className="relative p-8 md:p-10 z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-indigo-500/30 shadow-2xl bg-slate-800"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white border-4 border-indigo-500/30 shadow-2xl flex items-center justify-center text-4xl font-black uppercase">
                  {currentDisplayName.charAt(0)}
                </div>
              )}
              <span className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" title="Online & Active"></span>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{currentDisplayName}</h1>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  👑 VIP Enterprise Verified
                </span>
              </div>
              <p className="text-sm font-bold text-indigo-300">{profile.companyName}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-slate-300 font-mono">
                <span className="bg-slate-800/90 px-3 py-1 rounded-xl border border-slate-700">ID: {profile.customId}</span>
                <span className="bg-slate-800/90 px-3 py-1 rounded-xl border border-slate-700">📍 {profile.country}</span>
                <span className="bg-slate-800/90 px-3 py-1 rounded-xl border border-slate-700">Member Since {profile.memberSince}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-2xl transition-all shadow-xl border border-indigo-400/30"
          >
            {isEditing ? '✕ Cancel' : '⚙️ Edit VIP Profile'}
          </button>
        </div>
      </div>

      {/* এডিট ফর্ম বনাম প্রিমিয়াম প্রোফাইল ভিউ */}
      {isEditing ? (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <span>✏️</span> Edit Enterprise Client Profile
          </h2>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Full Name (Bangla or English)</label>
                <input
                  type="text"
                  name="fullName"
                  value={fullNameInput}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Company / Studio Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={profile.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Profile Picture / Logo Direct URL</label>
              <input
                type="url"
                name="avatarUrl"
                placeholder="https://images.unsplash.com/... (যেকোনো ছবির সরাসরি লিংক দিন)"
                value={profile.avatarUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Verified Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Official Website Link</label>
                <input
                  type="url"
                  name="website"
                  value={profile.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Enterprise Bio / Mission Statement</label>
              <textarea
                name="bio"
                rows="4"
                value={profile.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-2xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-lg transition-all"
              >
                {loading ? 'Saving...' : 'Save VIP Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* বামের কলাম: বায়ো, স্ট্যাটস এবং কন্টাক্ট */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">About Enterprise Client</h3>
              <p className="text-slate-700 text-sm leading-relaxed font-medium">{profile.bio}</p>
            </div>

            {/* কাজের পরিসংখ্যান (Stats) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100">
                <p className="text-xs font-bold text-blue-600 uppercase">Total Tasks Posted</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{profile.totalTasksPosted} Active Tasks</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600 uppercase">Total Budget Spent</p>
                <p className="text-2xl font-black text-slate-900 mt-1">${profile.totalSpent} USD</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl font-bold">📧</div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Email Address</p>
                  <p className="text-sm font-bold text-slate-800 truncate max-w-[180px]">{session?.user?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-xl font-bold">📞</div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Phone Number</p>
                  <p className="text-sm font-bold text-slate-800">{profile.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ডানের কলাম: ট্রাস্ট ও সিকিউরিটি ব্যাজ */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-7 text-white shadow-xl relative overflow-hidden border border-indigo-500/30">
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">🛡️ VIP Trust & Security Badge</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/10">
                  <span className="text-xs text-slate-300 font-medium">NID / Enterprise ID</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">Verified ✔</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/10">
                  <span className="text-xs text-slate-300 font-medium">Secure Communications</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">Encrypted ✔</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/10">
                  <span className="text-xs text-slate-300 font-medium">Platform Risk Status</span>
                  <span className="text-xs font-bold text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded-full">Low Risk (Safe)</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-7 shadow-xl border border-slate-100 text-center space-y-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center text-xl font-bold">🌟</div>
              <h4 className="font-bold text-slate-800 text-sm">TaskBang Enterprise Standard</h4>
              <p className="text-xs text-slate-500 leading-relaxed">এই ক্লায়েন্ট অ্যাকাউন্টটি TaskBang AI গ্লোবাল স্ট্যান্ডার্ড অনুযায়ী সম্পূর্ণ ভেরিফাইড এবং সুরক্ষিত।</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
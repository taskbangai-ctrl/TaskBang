import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AdminSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminSignup = async (e) => {
    e.preventDefault();
    
    if (secretKey !== 'taskbang2026owner') {
      alert('ভুল সিক্রেট কি! এটি শুধুমাত্র প্ল্যাটফর্ম ওনারের জন্য নির্ধারিত।');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'admin',
          full_name: 'Master System Owner',
        },
      },
    });

    setLoading(false);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('অভিনন্দন! আপনার মাস্টার এডমিন অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। এখন লগইন করুন।');
      navigate('/taskbang-master-admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4 font-sans text-slate-100 relative overflow-hidden">
      {/* Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative bg-slate-900/60 border border-slate-800/80 backdrop-blur-3xl rounded-[28px] p-8 md:p-10 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
        
        {/* Header Icon & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-[1px] shadow-xl shadow-amber-500/20 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center font-black text-amber-400 text-2xl tracking-tighter">
              TB
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Supreme Control
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Master Admin Setup</h1>
          <p className="text-xs text-slate-400 mt-1">Initialize Platform Ownership Credentials</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleAdminSignup} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">Admin Email</label>
            <input
              type="email"
              required
              autoComplete="off"
              placeholder="owner@taskbang.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-amber-500/80 focus:ring-4 focus:ring-amber-500/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">Secure Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-amber-500/80 focus:ring-4 focus:ring-amber-500/10 transition-all pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors px-2 py-1"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">Platform Secret Key</label>
            <div className="relative">
              <input
                type={showSecretKey ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Enter master key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-amber-500/30 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all pr-14"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500/70 hover:text-amber-400 transition-colors px-2 py-1"
              >
                {showSecretKey ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm tracking-wide active:scale-[0.99]"
          >
            {loading ? 'Initializing Core...' : 'Deploy Master Account ⚡'}
          </button>
        </form>

        {/* Footer Navigation Link */}
        <div className="mt-8 pt-5 border-t border-slate-800/80 text-center">
          <a href="/taskbang-master-admin" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            Already have owner credentials? Login here →
          </a>
        </div>
      </div>
    </div>
  );
}
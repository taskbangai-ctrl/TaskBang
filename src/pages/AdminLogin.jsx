import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert('Authentication Failed: ' + error.message);
    } else {
      const userRole = data.user?.user_metadata?.role;
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        alert('Access Denied: Restricted to Master System Owner only.');
        await supabase.auth.signOut();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 font-sans text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0,transparent_70%)]"></div>
      
      <div className="relative bg-slate-900/80 border border-slate-800 backdrop-blur-2xl rounded-3xl p-8 md:p-10 w-full max-w-md shadow-2xl shadow-indigo-950/50">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-indigo-500/30 mb-4">
            TB
          </div>
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            Restricted Core
          </span>
          <h1 className="text-2xl font-black text-white mt-3 tracking-tight">System Master Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Authentication Terminal</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Owner Email</label>
            <input
              type="email"
              required
              placeholder="admin@taskbang.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Master Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-sm tracking-wide"
          >
            {loading ? 'Authenticating Telemetry...' : 'Authorize Access 🔒'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500 font-medium">TaskBang AI Security Protocol v2.4 • Encrypted</p>
        </div>
      </div>
    </div>
  );
}
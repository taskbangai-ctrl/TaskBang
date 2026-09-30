import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const role = user?.user_metadata?.role;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-indigo-600 text-white font-black text-xl px-2.5 py-1 rounded-lg">TB</span>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">TaskBang</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200">
                {role === 'client' ? '🏢 Client' : '👨‍💻 Worker'}: <span className="text-indigo-600 font-bold">{user.user_metadata?.full_name || user.email}</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600">
                Log In
              </Link>
              <Link
                to="/signup"
                className="text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
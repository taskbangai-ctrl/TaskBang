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
  const fullName = user?.user_metadata?.full_name || user?.email || 'User';

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link
          to="/"
          className="group flex items-center gap-3"
          aria-label="TaskBang Home"
        >
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/20">
            <span className="relative z-10 text-sm font-black tracking-tight text-white">
              TB
            </span>
            <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>

          <div className="hidden leading-none sm:block">
            <div className="text-lg font-extrabold tracking-tight text-white">
              TaskBang <span className="text-violet-400">AI</span>
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Work • Earn • Grow
            </div>
          </div>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              {/* User */}
              <div className="hidden items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-xs font-bold text-violet-300">
                  {fullName.charAt(0).toUpperCase()}
                </div>

                <div className="max-w-[180px]">
                  <div className="truncate text-xs font-bold text-slate-200">
                    {fullName}
                  </div>

                  <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {role === 'client'
                      ? 'Client Account'
                      : role === 'admin'
                        ? 'Admin Account'
                        : 'Worker Account'}
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="rounded-xl border border-red-400/20 bg-red-500/5 px-3.5 py-2 text-xs font-bold text-red-300 transition-all duration-200 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white sm:block"
              >
                Log In
              </Link>

              <Link
                to="/signup"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-violet-600/30"
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
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState('worker'); // 'worker' or 'client'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form States
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    paymentNumber: '', // For Worker (Bkash/Nagad)
    companyName: '',  // For Client
    websiteUrl: '',   // For Client
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Regular Sign Up Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: role,
            payment_number: role === 'worker' ? formData.paymentNumber : null,
            company_name: role === 'client' ? formData.companyName : null,
            website_url: role === 'client' ? formData.websiteUrl : null,
          },
        },
      });

      if (error) throw error;

      alert('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...');
      if (role === 'worker') {
        navigate('/worker');
      } else {
        navigate('/client');
      }
    } catch (err) {
      setErrorMsg(err.message || 'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 py-10 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-slate-800">Create an Account</h2>
          <p className="text-sm text-slate-500 mt-1">
            Join <span className="font-semibold text-indigo-600">TaskBang</span> as Worker or Client
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setRole('worker')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              role === 'worker'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👨‍💻 Join as Worker
          </button>
          <button
            type="button"
            onClick={() => setRole('client')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              role === 'client'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏢 Join as Client
          </button>
        </div>

        {/* Access Privileges Box */}
        <div className="mb-6 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-slate-700">
          <h4 className="font-bold text-indigo-900 mb-1.5 text-sm">
            {role === 'worker' ? '✨ Worker Access & Privileges:' : '💼 Client Access & Privileges:'}
          </h4>
          {role === 'worker' ? (
            <ul className="list-disc pl-4 space-y-1">
              <li>সোশ্যাল মিডিয়া, অ্যাপ ডাউনলোড ও রিভিউ টাস্ক সম্পন্ন করে আয়।</li>
              <li>বিকাশ/নগদ এর মাধ্যমে সরাসরি ইনস্ট্যান্ট উইথড্র সুবিধা।</li>
              <li>নিরাপদ পেমেন্ট ট্র্যাকিং এবং ওয়ার্কার প্রোফাইল ব্যাজ।</li>
            </ul>
          ) : (
            <ul className="list-disc pl-4 space-y-1">
              <li>আনলিমিটেড মাইক্রো-টাস্ক পোস্ট করার সুবিধা।</li>
              <li>হাজার হাজার রিয়েল বাংলাদেশি ইউজার থেকে কাজ সম্পন্ন করার নিশ্চয়তা।</li>
              <li>স্মার্ট এআই ভেরিফিকেশন এবং প্রুফ চেকিং ড্যাশবোর্ড।</li>
            </ul>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="e.g. Md Nayeem"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Real User Verification) *</label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="017XXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Role Specific Verification Fields */}
          {role === 'worker' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">bKash / Nagad Wallet Number *</label>
              <input
                type="text"
                name="paymentNumber"
                required
                placeholder="017XXXXXXXX (For Withdrawals)"
                value={formData.paymentNumber}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Business Name *</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  placeholder="e.g. N Tech Studio / Personal"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Website or Page URL (Optional)</label>
                <input
                  type="url"
                  name="websiteUrl"
                  placeholder="https://facebook.com/yourpage"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : `Create ${role === 'worker' ? 'Worker' : 'Client'} Account`}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">
            OR
          </span>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.21 21.32 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.32 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.61H1.21C.44 8.14 0 9.99 0 12s.44 3.86 1.21 5.39l4.11-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.21 2.68 1.21 6.61l4.11 3.15c.94-2.85 3.57-4.96 6.68-4.96z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Log In
          </Link>
        </p>

      </div>
    </div>
  );
}
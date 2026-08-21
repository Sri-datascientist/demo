import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import type { AccountType } from '../../types';

import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from;

  const [accountType, setAccountType] = useState<AccountType>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const type = new URLSearchParams(location.search).get('type');
    if (type === 'farmer' || type === 'customer' || type === 'district_hub') {
      setAccountType(type);
    }
  }, [location.search]);

  const redirectForRole = (role: string) => {
    if (role === 'admin') return '/admin';
    if (role === 'farmer') return '/farmer';
    if (role === 'district_hub') return '/hub';
    return from || '/dashboard';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedIn = await login(email, password, accountType);
      if (loggedIn.role === 'farmer' && !loggedIn.is_verified) {
        navigate('/verify-otp', { replace: true, state: { email: loggedIn.email } });
        return;
      }
      navigate(redirectForRole(loggedIn.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { type: AccountType; label: string }[] = [
    { type: 'customer', label: 'Customer' },
    { type: 'farmer', label: 'Farmer' },
    { type: 'district_hub', label: 'District Hub' },
  ];

  return (
    <div className="max-w-md mx-auto px-6 py-16 font-body">
      <div className="flex justify-center mb-8">
        <Logo size="xl" linkToHome className="h-14 sm:h-16" />
      </div>
      <h1 className="page-section-title mb-2 text-center">Welcome back</h1>
      <p className="page-body mb-6 text-center">Sign in to your Oyedesi account</p>

      <div className="flex gap-2 mb-6">
        {tabs.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => setAccountType(type)}
            className={`flex-1 rounded-full py-3 text-sm font-semibold transition-colors ${
              accountType === type
                ? 'bg-[#2D5A27] text-white'
                : 'bg-[#689F38]/10 text-[#2D5A27] hover:bg-[#689F38]/20'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-neutral-100 p-6 shadow-sm">
        {error && (
          <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm font-medium">{error}</div>
        )}
        <div>
          <label className="page-label block mb-2">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-base"
          />
        </div>
        <div>
          <label className="page-label block mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 pl-4 pr-12 py-3.5 text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#2D5A27] text-white py-4 font-semibold disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {accountType !== 'district_hub' && (
        <p className="mt-6 text-center page-body">
          No account?{' '}
          <Link to="/signup" className="text-[#2D5A27] font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      )}
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import type { AccountType } from '../../types';

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState<AccountType>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, otp_code } = await register(
        email,
        password,
        fullName,
        accountType,
        phone,
      );
      if (accountType === 'farmer') {
        navigate('/verify-otp', { replace: true, state: { email: user.email, otp_code } });
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 font-body">
      <div className="flex justify-center mb-8">
        <Logo size="xl" linkToHome className="h-14 sm:h-16" />
      </div>
      <h1 className="page-section-title mb-2 text-center">Create account</h1>
      <p className="page-body mb-6 text-center">Join Oyedesi for Satvik produce & agri services</p>

      <div className="flex gap-2 mb-6">
        {(['customer', 'farmer'] as AccountType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setAccountType(type)}
            className={`flex-1 rounded-full py-3 font-semibold transition-colors ${
              accountType === type
                ? 'bg-[#2D5A27] text-white'
                : 'bg-[#689F38]/10 text-[#2D5A27] hover:bg-[#689F38]/20'
            }`}
          >
            {type === 'customer' ? 'Customer' : 'Farmer'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-neutral-100 p-6 shadow-sm">
        {error && (
          <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm font-medium">{error}</div>
        )}
        <div>
          <label className="page-label block mb-2">Full name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-base"
          />
        </div>
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
        {accountType === 'farmer' && (
          <div>
            <label className="page-label block mb-2">Phone (for OTP)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-base"
            />
          </div>
        )}
        <div>
          <label className="page-label block mb-2">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-base"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#2D5A27] text-white py-4 font-semibold disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p className="mt-6 text-center page-body">
        Already have an account?{' '}
        <Link to="/login" className="text-[#2D5A27] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

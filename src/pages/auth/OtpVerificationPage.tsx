import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  const state = location.state as { email?: string; otp_code?: string } | null;

  const [email, setEmail] = useState(state?.email || '');
  const [code, setCode] = useState('');
  const [devOtp, setDevOtp] = useState(state?.otp_code || '');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setError('');
    try {
      const res = await api.sendOtp(email);
      if (res.otp_code) setDevOtp(res.otp_code);
      setMessage('OTP sent. Check your email (or dev code below).');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.verifyOtp(email, code);
      await refreshUser();
      navigate('/farmer', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 font-body">
      <div className="flex justify-center mb-8">
        <Logo size="xl" linkToHome className="h-14 sm:h-16" />
      </div>
      <h1 className="page-section-title mb-2 text-center">Verify OTP</h1>
      <p className="page-body mb-8 text-center">
        Enter the verification code sent to your email. SMS/email integration can be configured in production.
      </p>

      {devOtp && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
          <strong>Dev mode:</strong> Your OTP is <span className="font-mono font-bold">{devOtp}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-neutral-100 p-6 shadow-sm">
        {error && (
          <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm font-medium">{error}</div>
        )}
        {message && (
          <div className="rounded-xl bg-green-50 text-green-700 px-4 py-3 text-sm font-medium">{message}</div>
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
          <label className="page-label block mb-2">OTP Code</label>
          <input
            type="text"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-base font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#2D5A27] text-white py-4 font-semibold disabled:opacity-60"
        >
          {loading ? 'Verifying...' : 'Verify & continue'}
        </button>
        <button
          type="button"
          onClick={handleResend}
          className="w-full rounded-full border border-[#2D5A27] text-[#2D5A27] py-3 font-semibold"
        >
          Resend OTP
        </button>
      </form>
    </div>
  );
}

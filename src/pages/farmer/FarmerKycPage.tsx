import { useEffect, useState, type FormEvent } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  DashboardButton,
  DashboardField,
  DashboardFormActions,
  DashboardFormCard,
  DashboardFormGrid,
  DashboardInput,
  DashboardReadOnlyField,
} from '../../components/dashboard/DashboardForm';
import { farmerNav } from '../../lib/navItems';
import { api } from '../../lib/api';
import type { KycStatus as KycStatusType } from '../../types';

export default function FarmerKycPage() {
  const [kyc, setKyc] = useState<KycStatusType | null>(null);
  const [aadhaar, setAadhaar] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => api.getKycStatus().then(setKyc).catch(() => setKyc(null));

  useEffect(() => {
    load();
  }, []);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const clean = aadhaar.replace(/\s|-/g, '');
      const init = await api.initiateKyc(clean);
      setSessionId(init.session_id);
      if (init.auto_verify) {
        const result = await api.completeKyc(clean, init.session_id);
        setKyc(result);
        setMessage('Aadhaar verified via DigiLocker (dev auto-verify).');
      } else {
        setMessage('Redirect to DigiLocker required. Complete verification there and return.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      load();
    } finally {
      setLoading(false);
    }
  };

  const verified = kyc?.kyc_status === 'verified';

  return (
    <DashboardLayout title="KYC — Aadhaar Verification" navItems={farmerNav}>
      <p className="dashboard-section-desc mb-6 max-w-2xl">
        Farmer accounts must verify Aadhaar through DigiLocker before submitting crops for sale.
        In development mode, valid Aadhaar numbers are auto-verified.
      </p>

      <DashboardFormCard title="Verification status" className="max-w-2xl mb-6">
        <DashboardFormGrid>
          <DashboardReadOnlyField label="KYC status" value={kyc?.kyc_status || '—'} />
          <DashboardReadOnlyField label="Aadhaar" value={kyc?.aadhaar_masked || 'Not linked'} />
          <DashboardReadOnlyField label="Provider" value={kyc?.kyc_provider || '—'} />
          <DashboardReadOnlyField label="Profile verification" value={kyc?.verification_status || '—'} />
        </DashboardFormGrid>
        {kyc?.kyc_verified_at && (
          <p className="text-sm text-[#6b7c74]">
            Verified at: {new Date(kyc.kyc_verified_at).toLocaleString()}
          </p>
        )}
      </DashboardFormCard>

      {!verified && (
        <form onSubmit={handleVerify} className="max-w-2xl">
          <DashboardFormCard
            title="Verify with DigiLocker"
            description="Enter your 12-digit Aadhaar number to start verification."
          >
            <DashboardField label="Aadhaar number" htmlFor="aadhaar">
              <DashboardInput
                id="aadhaar"
                type="text"
                required
                maxLength={14}
                placeholder="12-digit Aadhaar"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
              />
            </DashboardField>

            {error && (
              <p className="text-sm text-red-700 font-medium rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-green-800 font-medium rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                {message}
              </p>
            )}

            <DashboardFormActions>
              <DashboardButton type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify with DigiLocker'}
              </DashboardButton>
            </DashboardFormActions>
          </DashboardFormCard>
        </form>
      )}

      {verified && (
        <div className="max-w-2xl rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-800 font-medium">
          Your Aadhaar is verified. You can submit crops for quality inspection.
        </div>
      )}

      {sessionId && !verified && (
        <p className="text-sm text-[#6b7c74] mt-4">Session: {sessionId}</p>
      )}
    </DashboardLayout>
  );
}

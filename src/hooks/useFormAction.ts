import { useState } from 'react';

function formatActionError(err: unknown): string {
  const msg = err instanceof Error ? err.message : 'Request failed';
  if (
    msg.toLowerCase().includes('credential') ||
    msg.toLowerCase().includes('unauthorized') ||
    msg.includes('401')
  ) {
    return 'Session expired. Please log out and sign in again.';
  }
  return msg;
}

export function useFormAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clear = () => {
    setError('');
    setSuccess('');
  };

  const run = async (
    action: () => Promise<void>,
    options?: { successMessage?: string; onSuccess?: () => void },
  ) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await action();
      if (options?.successMessage) setSuccess(options.successMessage);
      options?.onSuccess?.();
    } catch (err) {
      setError(formatActionError(err));
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, run, clear };
}

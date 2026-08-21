import { Navigate, useSearchParams } from 'react-router-dom';

/** Redirect legacy /track-order URLs into the customer dashboard. */
export default function TrackOrderRedirect() {
  const [params] = useSearchParams();
  const tracking = params.get('tracking');
  const target = tracking
    ? `/dashboard/track-order?tracking=${encodeURIComponent(tracking)}`
    : '/dashboard/track-order';
  return <Navigate to={target} replace />;
}

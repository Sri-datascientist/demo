import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({
  children,
  adminOnly = false,
  farmerOnly = false,
  customerOnly = false,
  hubOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
  farmerOnly?: boolean;
  customerOnly?: boolean;
  hubOnly?: boolean;
}) {
  const { user, loading, isAdmin, isFarmer, isCustomer, isDistrictHub } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center font-body text-[#2D5A27]">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to={isDistrictHub ? '/hub' : isFarmer ? '/farmer' : '/dashboard'} replace />;
  }

  if (hubOnly && !isDistrictHub) {
    return <Navigate to={isAdmin ? '/admin' : isFarmer ? '/farmer' : '/dashboard'} replace />;
  }

  if (farmerOnly && !isFarmer) {
    return <Navigate to={isAdmin ? '/admin' : isDistrictHub ? '/hub' : '/dashboard'} replace />;
  }

  if (customerOnly && !isCustomer) {
    return <Navigate to={isAdmin ? '/admin' : isDistrictHub ? '/hub' : '/farmer'} replace />;
  }

  return children;
}

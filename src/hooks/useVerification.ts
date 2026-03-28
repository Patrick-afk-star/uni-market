import { useState, useCallback, useEffect } from 'react';
import { currentUser } from '@/data/user';

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface VerificationState {
  status: VerificationStatus;
  idImage: string | null;
  submittedAt: string | null;
}

export function useVerification() {
  const [verification, setVerification] = useState<VerificationState>({
    status: currentUser.verified ? 'verified' : 'unverified',
    idImage: null,
    submittedAt: null,
  });

  // Update verification status whenever currentUser.verified changes
  useEffect(() => {
    setVerification((prev) => ({
      ...prev,
      status: currentUser.verified ? 'verified' : 'unverified',
    }));
  }, [currentUser.verified]);

  const submitVerification = useCallback((idImage: string) => {
    setVerification({
      status: 'pending',
      idImage,
      submittedAt: new Date().toISOString(),
    });
  }, []);

  const approveVerification = useCallback(() => {
    setVerification((prev) => ({
      ...prev,
      status: 'verified',
    }));
  }, []);

  const resetVerification = useCallback(() => {
    setVerification({
      status: currentUser.verified ? 'verified' : 'unverified',
      idImage: null,
      submittedAt: null,
    });
  }, []);

  const isVerified = verification.status === 'verified';
  const isPending = verification.status === 'pending';
  const isUnverified = verification.status === 'unverified';

  return {
    verification,
    submitVerification,
    approveVerification,
    resetVerification,
    isVerified,
    isPending,
    isUnverified,
  };
}

"use client";

import { Messages } from '@/components/dashboard/Messages';
import { useVerification } from '@/hooks/useVerification';
import { useNavigate } from 'react-router-dom';

export default function MessagesPage() {
  const { isVerified } = useVerification();
  const navigate = useNavigate();
  const handleVerificationRequired = () => {
    // setShowVerification(true);
  };

  const handleBuySubViewChange = () => {
    navigate('/dashboard/browse');
  };

  return (
    <Messages
      isVerified={isVerified}
      onVerificationRequired={handleVerificationRequired}
      setBuySubView={handleBuySubViewChange}
    />
  );
}

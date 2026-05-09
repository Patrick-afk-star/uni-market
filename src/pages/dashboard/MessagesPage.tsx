"use client";

import { Messages } from '@/components/dashboard/Messages';
import { useVerification } from '@/hooks/useVerification';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function MessagesPage() {
  const { isVerified } = useVerification();
  const navigate = useNavigate();
  const [showVerification, setShowVerification] = useState(false);

  const handleVerificationRequired = () => {
    setShowVerification(true);
  };

  const handleBuySubViewChange = (view: 'browse') => {
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

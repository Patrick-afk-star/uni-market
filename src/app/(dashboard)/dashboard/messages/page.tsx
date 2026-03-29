"use client";

import { Messages } from '@/components/dashboard/Messages';
import { useVerification } from '@/hooks/useVerification';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function MessagesPage() {
  const { isVerified } = useVerification();
  const router = useRouter();
  const [showVerification, setShowVerification] = useState(false);

  const handleVerificationRequired = () => {
    setShowVerification(true);
  };

  const handleBuySubViewChange = (view: 'browse') => {
    router.push('/dashboard/browse');
  };

  return (
    <Messages
      isVerified={isVerified}
      onVerificationRequired={handleVerificationRequired}
      setBuySubView={handleBuySubViewChange}
    />
  );
}

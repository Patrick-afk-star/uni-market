"use client";

import { BuyView } from '@/components/dashboard/BuyView';
import { useVerification } from '@/hooks/useVerification';
import { toast } from 'sonner';

export default function BrowsePage() {
  const { isVerified } = useVerification();

  const handleMessageClick = () => {
    toast.info('Redirecting to messages...');
  };

  const handleVerificationRequired = () => {
    toast.error('Verification required to message sellers');
  };

  return (
    <BuyView
      searchQuery=""
      isVerified={isVerified}
      onMessageClick={handleMessageClick}
      onVerificationRequired={handleVerificationRequired}
    />
  );
}

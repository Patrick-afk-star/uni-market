"use client";

import { useOutletContext } from 'react-router-dom';
import { BuyView } from '@/components/dashboard/BuyView';
import { useVerification } from '@/hooks/useVerification';
import { toast } from 'sonner';

export default function BrowsePage() {
  const { isVerified } = useVerification();
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();

  const handleMessageClick = () => {
    toast.info('Redirecting to messages...');
  };

  const handleVerificationRequired = () => {
    toast.error('Verification required to message sellers');
  };

  return (
    <BuyView
      searchQuery={searchQuery}
      isVerified={isVerified}
      onMessageClick={handleMessageClick}
      onVerificationRequired={handleVerificationRequired}
    />
  );
}

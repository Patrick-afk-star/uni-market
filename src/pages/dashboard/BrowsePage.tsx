"use client";

import { useOutletContext, useNavigate } from 'react-router-dom';
import { BuyView } from '@/components/dashboard/BuyView';
import { useVerification } from '@/hooks/useVerification';
import { useAuth } from '@/context/AuthContext';
import { startConversation } from '@/lib/messaging';
import { toast } from 'sonner';

export default function BrowsePage() {
  const { isVerified } = useVerification();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();

  /**
   * Called by BuyView's Message button with the listing id.
   * Starts (or resumes) the conversation, then navigates into the thread.
   */
  const handleMessageClick = async (listingId: string) => {
    if (!accessToken) {
      toast.error('Please log in to message sellers.');
      return;
    }
    const toastId = toast.loading('Opening conversation...');
    try {
      const conv = await startConversation(accessToken, listingId);
      toast.dismiss(toastId);
      navigate(`/dashboard/messages?conversation=${conv.id}`);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message ?? 'Could not start conversation.');
    }
  };

  const handleVerificationRequired = () => {
    toast.error('Verify your account to message sellers.');
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

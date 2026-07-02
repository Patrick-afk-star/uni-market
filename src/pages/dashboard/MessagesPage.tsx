"use client";

import { useSearchParams, useNavigate } from 'react-router-dom';
import { Messages } from '@/components/dashboard/Messages';
import { useVerification } from '@/hooks/useVerification';

export default function MessagesPage() {
  const { isVerified } = useVerification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ?conversation=<id> is set by the "Message" button on listing cards/detail
  const initialConversationId = searchParams.get('conversation');

  const handleVerificationRequired = () => {
    // future: open verification modal
  };

  const handleBuySubViewChange = () => {
    navigate('/dashboard/browse');
  };

  return (
    <Messages
      isVerified={isVerified}
      onVerificationRequired={handleVerificationRequired}
      setBuySubView={handleBuySubViewChange}
      initialConversationId={initialConversationId}
    />
  );
}

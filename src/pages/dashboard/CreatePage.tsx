"use client";

import { useParams } from 'react-router-dom';
import { SellView } from '@/components/dashboard/SellView';
import { toast } from 'sonner';

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();

  const handlePublish = () => {
    toast.success(id ? 'Listing updated successfully!' : 'Listing published successfully!', {
      description: id ? 'Your changes have been saved.' : 'Your item is now live and visible to buyers.',
    });
  };

  return <SellView listingId={id} onPublish={handlePublish} />;
}

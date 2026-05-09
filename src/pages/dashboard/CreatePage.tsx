"use client";

import { SellView } from '@/components/dashboard/SellView';
import { toast } from 'sonner';

export default function CreatePage() {
  const handlePublish = () => {
    toast.success('Listing published successfully!', {
      description: 'Your item is now live and visible to buyers.',
    });
  };

  return <SellView onPublish={handlePublish} />;
}

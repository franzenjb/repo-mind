'use client';

import { use } from 'react';
import { useQACard } from '@/hooks/use-qa-cards';
import { QACardForm } from '@/components/qa-cards/qa-card-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditQACardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: card, isLoading } = useQACard(id);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!card) {
    return <div>Q&A Card not found</div>;
  }

  return <QACardForm card={card} mode="edit" />;
}

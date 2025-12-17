'use client';

import { use, Suspense } from 'react';
import { useQACard } from '@/hooks/use-qa-cards';
import { QACardForm } from '@/components/qa-cards/qa-card-form';
import { Skeleton } from '@/components/ui/skeleton';

function EditQACardContent({ id }: { id: string }) {
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

export default function EditQACardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <EditQACardContent id={id} />
    </Suspense>
  );
}

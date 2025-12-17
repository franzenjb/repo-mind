'use client';

import { Suspense } from 'react';
import { QACardForm } from '@/components/qa-cards/qa-card-form';
import { Skeleton } from '@/components/ui/skeleton';

function QACardFormWrapper() {
  return <QACardForm mode="create" />;
}

export default function NewQACardPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-2xl mx-auto" />}>
      <QACardFormWrapper />
    </Suspense>
  );
}

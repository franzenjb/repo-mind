'use client';

import { Suspense } from 'react';
import { NoteForm } from '@/components/notes/note-form';
import { Skeleton } from '@/components/ui/skeleton';

function NoteFormWrapper() {
  return <NoteForm mode="create" />;
}

export default function NewNotePage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-4xl mx-auto" />}>
      <NoteFormWrapper />
    </Suspense>
  );
}

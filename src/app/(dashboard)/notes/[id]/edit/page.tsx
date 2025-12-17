'use client';

import { use } from 'react';
import { useNote } from '@/hooks/use-notes';
import { NoteForm } from '@/components/notes/note-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: note, isLoading } = useNote(id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!note) {
    return <div>Note not found</div>;
  }

  return <NoteForm note={note} mode="edit" />;
}

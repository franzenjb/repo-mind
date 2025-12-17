'use client';

import { use } from 'react';
import { useSession } from '@/hooks/use-sessions';
import { SessionForm } from '@/components/sessions/session-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, isLoading } = useSession(id);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session) {
    return <div>Session not found</div>;
  }

  return <SessionForm session={session} mode="edit" />;
}

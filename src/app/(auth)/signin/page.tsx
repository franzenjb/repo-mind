'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/auth-form';

function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return <AuthForm mode="signin" initialError={error} />;
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}

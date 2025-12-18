'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      // Check for error in URL params
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        setError(errorDescription || errorParam);
        setTimeout(() => {
          router.push(`/signin?error=${encodeURIComponent(errorDescription || errorParam)}`);
        }, 2000);
        return;
      }

      // Check for code in URL params (OAuth callback)
      const code = searchParams.get('code');

      if (code) {
        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setError(error.message);
          setTimeout(() => {
            router.push(`/signin?error=${encodeURIComponent(error.message)}`);
          }, 2000);
          return;
        }
      }

      // Check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Successfully authenticated, redirect to repos
        router.push('/repos');
        router.refresh();
      } else {
        // No session, redirect back to signin
        setError('Authentication failed. Please try again.');
        setTimeout(() => {
          router.push('/signin?error=auth_failed');
        }, 2000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg">{error}</div>
          <div className="text-muted-foreground">Redirecting to sign in...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <div className="text-lg font-medium">Completing sign in...</div>
        <div className="text-sm text-muted-foreground">Please wait while we set up your session</div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const handleAuth = async () => {
      // Check for errors in URL (both hash and query params)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);

      const error = hashParams.get('error') || searchParams.get('error');
      const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || error);
        setTimeout(() => {
          router.push(`/signin?error=${encodeURIComponent(errorDescription || error)}`);
        }, 2000);
        return;
      }

      // Check if we have a session with provider_token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        setStatus('error');
        setErrorMessage(sessionError.message);
        setTimeout(() => {
          router.push(`/signin?error=${encodeURIComponent(sessionError.message)}`);
        }, 2000);
        return;
      }

      if (session) {
        console.log('Session found:', {
          user: session.user?.email,
          hasProviderToken: !!session.provider_token,
          providerTokenLength: session.provider_token?.length,
        });

        // Store the provider token in the profile if available
        if (session.provider_token && session.user) {
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              github_token: session.provider_token,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'id',
            });

          if (updateError) {
            console.error('Failed to store GitHub token:', updateError);
          } else {
            console.log('GitHub token stored successfully');
          }
        }

        setStatus('success');
        setTimeout(() => {
          router.push('/repos');
          router.refresh();
        }, 500);
        return;
      }

      // No session yet - wait and retry
      setTimeout(async () => {
        const { data: { session: retrySession } } = await supabase.auth.getSession();

        if (retrySession) {
          // Store token on retry too
          if (retrySession.provider_token && retrySession.user) {
            await supabase
              .from('profiles')
              .upsert({
                id: retrySession.user.id,
                github_token: retrySession.provider_token,
                updated_at: new Date().toISOString(),
              }, {
                onConflict: 'id',
              });
          }

          setStatus('success');
          setTimeout(() => {
            router.push('/repos');
            router.refresh();
          }, 500);
        } else {
          setStatus('error');
          setErrorMessage('Authentication timed out. Please try again.');
          setTimeout(() => {
            router.push('/signin');
          }, 2000);
        }
      }, 2000);
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session ? 'has session' : 'no session');

      if (event === 'SIGNED_IN' && session) {
        // Store the provider token
        if (session.provider_token && session.user) {
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              github_token: session.provider_token,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'id',
            });

          if (updateError) {
            console.error('Failed to store GitHub token:', updateError);
          }
        }

        setStatus('success');
        setTimeout(() => {
          router.push('/repos');
          router.refresh();
        }, 500);
      }
    });

    handleAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg">{errorMessage}</div>
          <div className="text-muted-foreground">Redirecting to sign in...</div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-green-500 text-lg">Successfully signed in!</div>
          <div className="text-muted-foreground">Redirecting to your repos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <div className="text-lg font-medium">Completing sign in...</div>
        <div className="text-sm text-muted-foreground">Please wait while we set up your session</div>
      </div>
    </div>
  );
}

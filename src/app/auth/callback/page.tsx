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

    const storeGitHubToken = async (userId: string, token: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          github_token: token,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Failed to store GitHub token:', error);
      } else {
        console.log('GitHub token stored successfully');
      }
    };

    const handleCallback = async () => {
      try {
        // Check for errors in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);

        const error = hashParams.get('error') || searchParams.get('error');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

        if (error) {
          console.error('OAuth error:', error, errorDescription);
          setStatus('error');
          setErrorMessage(errorDescription || error);
          setTimeout(() => {
            router.push(`/signin?error=${encodeURIComponent(errorDescription || error)}`);
          }, 2000);
          return;
        }

        // Check for code in URL (PKCE flow)
        const code = searchParams.get('code');

        if (code) {
          console.log('Exchanging code for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setStatus('error');
            setErrorMessage(exchangeError.message);
            setTimeout(() => {
              router.push(`/signin?error=${encodeURIComponent(exchangeError.message)}`);
            }, 2000);
            return;
          }

          if (data.session) {
            console.log('Session established:', {
              user: data.session.user?.email,
              hasProviderToken: !!data.session.provider_token,
            });

            // Store the GitHub token
            if (data.session.provider_token && data.session.user) {
              await storeGitHubToken(data.session.user.id, data.session.provider_token);
            }

            setStatus('success');
            setTimeout(() => {
              router.push('/repos');
              router.refresh();
            }, 500);
            return;
          }
        }

        // No code - check if we already have a session (e.g., from hash fragment)
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          console.log('Existing session found');
          if (session.provider_token && session.user) {
            await storeGitHubToken(session.user.id, session.provider_token);
          }
          setStatus('success');
          setTimeout(() => {
            router.push('/repos');
            router.refresh();
          }, 500);
          return;
        }

        // No session - wait and retry once
        console.log('No session yet, waiting...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { data: { session: retrySession } } = await supabase.auth.getSession();
        if (retrySession) {
          if (retrySession.provider_token && retrySession.user) {
            await storeGitHubToken(retrySession.user.id, retrySession.provider_token);
          }
          setStatus('success');
          setTimeout(() => {
            router.push('/repos');
            router.refresh();
          }, 500);
        } else {
          setStatus('error');
          setErrorMessage('Authentication failed. Please try again.');
          setTimeout(() => {
            router.push('/signin');
          }, 2000);
        }
      } catch (err) {
        console.error('Callback error:', err);
        setStatus('error');
        setErrorMessage('An unexpected error occurred.');
        setTimeout(() => {
          router.push('/signin');
        }, 2000);
      }
    };

    handleCallback();
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

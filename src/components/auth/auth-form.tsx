'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Github, Mail, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  initialError?: string | null;
}

export function AuthForm({ mode, initialError }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(initialError || null);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, signInWithGitHub } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setError(error.message);
        } else {
          router.push('/repos');
          router.refresh();
        }
      } else {
        const { error } = await signUpWithEmail(email, password, fullName);
        if (error) {
          setError(error.message);
        } else {
          setError(null);
          setError('Check your email to confirm your account!');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setGithubLoading(true);
    setError(null);
    // Clear error from URL to ensure fresh OAuth state
    if (window.location.search.includes('error')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    const { error } = await signInWithGitHub();
    if (error) {
      setError(error.message);
      setGithubLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {mode === 'signin' ? 'Welcome back' : 'Get started'}
        </CardTitle>
        <CardDescription>
          {mode === 'signin'
            ? 'Sign in to access your repositories'
            : 'Connect your GitHub to document your repos'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* GitHub - Primary method */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={handleGitHubSignIn}
            disabled={githubLoading}
          >
            {githubLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Github className="mr-2 h-5 w-5" />
            )}
            Continue with GitHub
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Recommended - gives access to your repositories
          </p>
        </div>

        {error && (
          <Alert variant={error.includes('Check your email') ? 'default' : 'destructive'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {!error.includes('Check your email') && (
                <button
                  type="button"
                  className="ml-2 underline hover:no-underline"
                  onClick={() => {
                    setError(null);
                    window.history.replaceState({}, '', window.location.pathname);
                  }}
                >
                  Dismiss
                </button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Email fallback */}
        {!showEmailForm ? (
          <div className="pt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 text-muted-foreground"
              onClick={() => setShowEmailForm(true)}
            >
              <Mail className="mr-2 h-4 w-4" />
              Use email instead
            </Button>
          </div>
        ) : (
          <>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" variant="outline" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {mode === 'signin' ? 'Sign In with Email' : 'Sign Up with Email'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Note: Email sign-in won&apos;t have access to your GitHub repos.
                For full functionality, use GitHub sign-in.
              </p>
            </form>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {mode === 'signin' ? (
          <Link
            href="/signup"
            className="text-sm text-muted-foreground hover:underline"
          >
            Don&apos;t have an account? Sign up
          </Link>
        ) : (
          <Link
            href="/signin"
            className="text-sm text-muted-foreground hover:underline"
          >
            Already have an account? Sign in
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}

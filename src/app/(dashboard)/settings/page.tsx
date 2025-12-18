'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Github, User, Mail } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const githubUsername = user?.user_metadata?.user_name || user?.user_metadata?.preferred_username;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.user_metadata?.avatar_url || profile?.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {githubUsername?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{githubUsername || profile?.full_name || 'User'}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid gap-4 pt-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="text-muted-foreground">Username:</span> {githubUsername || 'Not set'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="text-muted-foreground">Email:</span> {user?.email}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Github className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="text-muted-foreground">Connected via:</span> GitHub
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Sign out or manage your session</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


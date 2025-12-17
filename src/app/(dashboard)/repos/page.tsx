'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGitHubRepos } from '@/hooks/use-github';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GitFork,
  Star,
  Lock,
  Globe,
  Search,
  AlertCircle,
  Github,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ReposPage() {
  const { data: repos, isLoading, error } = useGitHubRepos();
  const [search, setSearch] = useState('');

  const filteredRepos = repos?.filter(
    (repo) =>
      repo.name.toLowerCase().includes(search.toLowerCase()) ||
      repo.description?.toLowerCase().includes(search.toLowerCase()) ||
      repo.language?.toLowerCase().includes(search.toLowerCase())
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load repositories</h2>
        <p className="text-muted-foreground mb-4">
          Make sure you signed in with GitHub and granted repository access.
        </p>
        <Link href="/signin" className="text-primary hover:underline">
          Sign in again with GitHub
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Repositories</h1>
          <p className="text-muted-foreground">
            Select a repository to document and study
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Github className="h-4 w-4" />
          {repos?.length || 0} repositories
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search repositories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRepos?.length === 0 ? (
        <div className="text-center py-12">
          <Github className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {search ? 'No repositories found' : 'No repositories yet'}
          </h3>
          <p className="text-muted-foreground">
            {search
              ? 'Try a different search term'
              : 'Create repositories on GitHub to see them here'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRepos?.map((repo) => (
            <Link key={repo.id} href={`/repos/${encodeURIComponent(repo.full_name)}`}>
              <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg truncate flex items-center gap-2">
                      {repo.private ? (
                        <Lock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      ) : (
                        <Globe className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      )}
                      {repo.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {repo.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {repo.language && (
                      <Badge variant="secondary">{repo.language}</Badge>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-3 w-3" />
                      {repo.forks_count}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Updated {formatDistanceToNow(new Date(repo.updated_at))} ago
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

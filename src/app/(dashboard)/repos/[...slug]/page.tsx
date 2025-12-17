'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useGitHubRepos, useRepoContents, useRepoReadme } from '@/hooks/use-github';
import { useNotes } from '@/hooks/use-notes';
import { useQACards } from '@/hooks/use-qa-cards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Folder,
  Star,
  GitFork,
  Clock,
  Plus,
  BookOpen,
  HelpCircle,
  File,
  Lock,
  Globe,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';

export default function RepoDetailPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = use(params);
  const fullName = slug.join('/');
  const [owner, repoName] = fullName.split('/');
  const [currentPath, setCurrentPath] = useState('');

  const { data: repos, isLoading: reposLoading } = useGitHubRepos();
  const repo = repos?.find((r) => r.full_name === fullName);

  const { data: contents, isLoading: contentsLoading } = useRepoContents(
    owner,
    repoName,
    currentPath
  );
  const { data: readme, isLoading: readmeLoading } = useRepoReadme(owner, repoName);

  // Get notes and Q&A cards linked to this repo
  const { data: allNotes } = useNotes();
  const { data: allQACards } = useQACards();

  const repoNotes = allNotes?.filter(
    (note) => note.session_id === fullName ||
    (note as { repository_name?: string }).repository_name === fullName
  );
  const repoQACards = allQACards?.filter(
    (card) => card.session_id === fullName ||
    (card as { repository_name?: string }).repository_name === fullName
  );

  if (reposLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Repository not found</h2>
        <p className="text-muted-foreground mb-4">
          This repository may not exist or you don&apos;t have access to it.
        </p>
        <Link href="/repos">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Repositories
          </Button>
        </Link>
      </div>
    );
  }

  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/repos">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {repo.private ? (
              <Lock className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Globe className="h-5 w-5 text-muted-foreground" />
            )}
            <h1 className="text-3xl font-bold">{repo.name}</h1>
            {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
          </div>
          <p className="text-muted-foreground mt-1">
            {repo.description || 'No description'}
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              {repo.stargazers_count} stars
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-4 w-4" />
              {repo.forks_count} forks
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Updated {formatDistanceToNow(new Date(repo.updated_at))} ago
            </span>
          </div>
        </div>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          View on GitHub
        </a>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="notes">
            Notes {repoNotes?.length ? `(${repoNotes.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="qa">
            Q&A Cards {repoQACards?.length ? `(${repoQACards.length})` : ''}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                README
              </CardTitle>
            </CardHeader>
            <CardContent>
              {readmeLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : readme ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{readme}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground">No README found</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document This Repo</CardTitle>
                <CardDescription>
                  Add notes to help you remember what this repository does
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/notes/new?repo=${encodeURIComponent(fullName)}`}>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Note
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Your Knowledge</CardTitle>
                <CardDescription>
                  Create Q&A cards to help you remember key concepts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/qa-cards/new?repo=${encodeURIComponent(fullName)}`}>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Q&A Card
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Repository Contents
              </CardTitle>
              {currentPath && (
                <div className="flex items-center gap-1 text-sm">
                  <button
                    onClick={() => setCurrentPath('')}
                    className="text-primary hover:underline"
                  >
                    {repo.name}
                  </button>
                  {pathParts.map((part, index) => (
                    <span key={index} className="flex items-center gap-1">
                      <span className="text-muted-foreground">/</span>
                      <button
                        onClick={() =>
                          setCurrentPath(pathParts.slice(0, index + 1).join('/'))
                        }
                        className="text-primary hover:underline"
                      >
                        {part}
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {contentsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : contents?.length === 0 ? (
                <p className="text-muted-foreground">No files found</p>
              ) : (
                <div className="space-y-1">
                  {currentPath && (
                    <button
                      onClick={() =>
                        setCurrentPath(pathParts.slice(0, -1).join('/'))
                      }
                      className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted text-left"
                    >
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      <span>..</span>
                    </button>
                  )}
                  {contents
                    ?.sort((a, b) => {
                      if (a.type === b.type) return a.name.localeCompare(b.name);
                      return a.type === 'dir' ? -1 : 1;
                    })
                    .map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          if (item.type === 'dir') {
                            setCurrentPath(item.path);
                          }
                        }}
                        className={`flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted text-left ${
                          item.type === 'file' ? 'cursor-default' : ''
                        }`}
                      >
                        {item.type === 'dir' ? (
                          <Folder className="h-4 w-4 text-blue-500" />
                        ) : (
                          <File className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{item.name}</span>
                        {item.size && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {(item.size / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
                <CardDescription>
                  Your documentation and notes about this repository
                </CardDescription>
              </div>
              <Link href={`/notes/new?repo=${encodeURIComponent(fullName)}`}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {repoNotes?.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No notes yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Start documenting what this repository does
                  </p>
                  <Link href={`/notes/new?repo=${encodeURIComponent(fullName)}`}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Note
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {repoNotes?.map((note) => (
                    <Link key={note.id} href={`/notes/${note.id}`}>
                      <div className="p-3 rounded-md border hover:bg-muted cursor-pointer">
                        <h4 className="font-medium">{note.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {note.content}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qa">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Q&A Cards
                </CardTitle>
                <CardDescription>
                  Test your knowledge about this repository
                </CardDescription>
              </div>
              <Link href={`/qa-cards/new?repo=${encodeURIComponent(fullName)}`}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Card
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {repoQACards?.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Q&A cards yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Create flashcards to test your understanding
                  </p>
                  <Link href={`/qa-cards/new?repo=${encodeURIComponent(fullName)}`}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Card
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {repoQACards?.map((card) => (
                    <Link key={card.id} href={`/qa-cards/${card.id}`}>
                      <div className="p-3 rounded-md border hover:bg-muted cursor-pointer">
                        <h4 className="font-medium">{card.question}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {card.answer}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

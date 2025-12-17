'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useSession, useDeleteSession } from '@/hooks/use-sessions';
import type { Tag, Note, QACard, Screenshot } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  BookOpen,
  FileText,
  MessageSquare,
  Image,
  ExternalLink,
  Edit,
  Trash2,
  Plus,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, isLoading } = useSession(id);
  const deleteSession = useDeleteSession();

  const handleDelete = async () => {
    await deleteSession.mutateAsync(id);
    router.push('/sessions');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">Session not found</h2>
        <Link href="/sessions">
          <Button variant="link">Back to sessions</Button>
        </Link>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-green-500/10 text-green-600 border-green-500/20',
    archived: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    completed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/sessions">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{session.title}</h1>
            <Badge variant="outline" className={statusColors[session.status as keyof typeof statusColors]}>
              {session.status}
            </Badge>
          </div>
          {session.repository_name && (
            <p className="text-muted-foreground flex items-center gap-1">
              {session.repository_url ? (
                <a
                  href={session.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-1"
                >
                  {session.repository_name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                session.repository_name
              )}
            </p>
          )}
          {session.description && (
            <p className="text-muted-foreground max-w-2xl">
              {session.description}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Created {formatDistanceToNow(new Date(session.created_at))} ago
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Summary
          </Button>
          <Link href={`/sessions/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Session?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this session and all its notes,
                  Q&A cards, and screenshots. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Tags */}
      {session.tags && session.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {session.tags.map((tag: Tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="notes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notes" className="gap-2">
            <FileText className="h-4 w-4" />
            Notes ({session.notes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="qa-cards" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Q&A Cards ({session.qa_cards?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="screenshots" className="gap-2">
            <Image className="h-4 w-4" />
            Screenshots ({session.screenshots?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Notes</h3>
            <Link href={`/notes/new?session=${id}`}>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Note
              </Button>
            </Link>
          </div>
          {session.notes && session.notes.length > 0 ? (
            <div className="grid gap-4">
              {session.notes.map((note: Note) => (
                <Card key={note.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      <Link
                        href={`/notes/${note.id}`}
                        className="hover:underline"
                      >
                        {note.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {note.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No notes yet</p>
                <Link href={`/notes/new?session=${id}`}>
                  <Button variant="link" className="mt-2">
                    Create your first note
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="qa-cards" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Q&A Cards</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Button>
              <Link href={`/qa-cards/new?session=${id}`}>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Q&A
                </Button>
              </Link>
            </div>
          </div>
          {session.qa_cards && session.qa_cards.length > 0 ? (
            <div className="grid gap-4">
              {session.qa_cards.map((card: QACard) => (
                <Card key={card.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Q: {card.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      A: {card.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No Q&A cards yet</p>
                <Link href={`/qa-cards/new?session=${id}`}>
                  <Button variant="link" className="mt-2">
                    Create your first Q&A card
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="screenshots" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Screenshots</h3>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Upload Screenshot
            </Button>
          </div>
          {session.screenshots && session.screenshots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {session.screenshots.map((screenshot: Screenshot) => (
                <Card key={screenshot.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <CardContent className="p-2">
                    <p className="text-xs text-muted-foreground truncate">
                      {screenshot.file_name}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Image className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No screenshots yet</p>
                <Button variant="link" className="mt-2">
                  Upload your first screenshot
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

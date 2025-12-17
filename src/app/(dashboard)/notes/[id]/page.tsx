'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { useNote, useDeleteNote, useGenerateNoteSummary } from '@/hooks/use-notes';
import type { Tag } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  FileText,
  Edit,
  Trash2,
  ArrowLeft,
  Sparkles,
  FileCode,
  BookOpen,
  Loader2,
} from 'lucide-react';

export default function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: note, isLoading } = useNote(id);
  const deleteNote = useDeleteNote();
  const generateSummary = useGenerateNoteSummary();

  const handleDelete = async () => {
    await deleteNote.mutateAsync(id);
    router.push('/notes');
  };

  const handleGenerateSummary = async () => {
    await generateSummary.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">Note not found</h2>
        <Link href="/notes">
          <Button variant="link">Back to notes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/notes">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Notes
        </Button>
      </Link>

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{note.title}</h1>
          </div>
          {note.study_sessions && (
            <Link
              href={`/sessions/${note.session_id}`}
              className="text-muted-foreground hover:underline flex items-center gap-1"
            >
              <BookOpen className="h-4 w-4" />
              {note.study_sessions.title}
            </Link>
          )}
          <p className="text-sm text-muted-foreground">
            Updated {formatDistanceToNow(new Date(note.updated_at))} ago
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleGenerateSummary}
            disabled={generateSummary.isPending}
          >
            {generateSummary.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {note.ai_summary ? 'Regenerate Summary' : 'Generate Summary'}
          </Button>
          <Link href={`/notes/${id}/edit`}>
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
                <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this note. This action cannot be undone.
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

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.tags.map((tag: Tag) => (
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

      {note.file_path && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Code Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <code className="text-sm bg-muted px-2 py-1 rounded">
              {note.file_path}
              {note.line_start && `:${note.line_start}`}
              {note.line_end && `-${note.line_end}`}
            </code>
          </CardContent>
        </Card>
      )}

      {note.ai_summary && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <p className="text-sm">{note.ai_summary}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="py-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{note.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

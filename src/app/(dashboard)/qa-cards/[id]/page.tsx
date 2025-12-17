'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useQACard, useDeleteQACard } from '@/hooks/use-qa-cards';
import type { Tag } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
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
  MessageSquare,
  Edit,
  Trash2,
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

export default function QACardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: card, isLoading } = useQACard(id);
  const deleteCard = useDeleteQACard();

  const handleDelete = async () => {
    await deleteCard.mutateAsync(id);
    router.push('/qa-cards');
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

  if (!card) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">Q&A Card not found</h2>
        <Link href="/qa-cards">
          <Button variant="link">Back to Q&A Cards</Button>
        </Link>
      </div>
    );
  }

  const accuracy =
    card.times_reviewed && card.times_reviewed > 0
      ? Math.round((card.times_correct / card.times_reviewed) * 100)
      : null;

  const difficultyColors = {
    easy: 'bg-green-500/10 text-green-600 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    hard: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link href="/qa-cards">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Q&A Cards
        </Button>
      </Link>

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Q&A Card</h1>
            <Badge
              variant="outline"
              className={difficultyColors[card.difficulty as keyof typeof difficultyColors] || difficultyColors.medium}
            >
              {card.difficulty || 'medium'}
            </Badge>
            {card.ai_generated && (
              <Badge variant="secondary">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Generated
              </Badge>
            )}
          </div>
          {card.study_sessions && (
            <Link
              href={`/sessions/${card.session_id}`}
              className="text-muted-foreground hover:underline flex items-center gap-1"
            >
              <BookOpen className="h-4 w-4" />
              {card.study_sessions.title}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/qa-cards/${id}/edit`}>
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
                <AlertDialogTitle>Delete Q&A Card?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this Q&A card. This action cannot be undone.
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

      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {card.tags.map((tag: Tag) => (
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

      {/* Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Review Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{card.times_reviewed || 0}</p>
              <p className="text-xs text-muted-foreground">Times Reviewed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{card.times_correct || 0}</p>
              <p className="text-xs text-muted-foreground">Times Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{accuracy !== null ? `${accuracy}%` : '-'}</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
          </div>
          {accuracy !== null && <Progress value={accuracy} className="h-2" />}
          {card.last_reviewed && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last reviewed {formatDistanceToNow(new Date(card.last_reviewed))} ago
            </p>
          )}
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Question</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{card.question}</p>
        </CardContent>
      </Card>

      {/* Answer */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-primary flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Answer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{card.answer}</p>
        </CardContent>
      </Card>
    </div>
  );
}

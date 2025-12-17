'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Clock, CheckCircle, BookOpen } from 'lucide-react';
import type { QACard, Tag } from '@/types/database';

interface QACardWithTags extends QACard {
  tags: Tag[];
  study_sessions?: { title: string };
}

interface QACardItemProps {
  card: QACardWithTags;
}

export function QACardItem({ card }: QACardItemProps) {
  const accuracy =
    card.times_reviewed && card.times_reviewed > 0
      ? Math.round((card.times_correct / card.times_reviewed) * 100)
      : null;

  return (
    <Link href={`/qa-cards/${card.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <MessageSquare className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-base line-clamp-1">
                {card.question}
              </CardTitle>
            </div>
            {card.ai_generated && (
              <Badge variant="secondary" className="flex-shrink-0 text-xs">
                AI
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {card.answer}
          </p>

          {card.study_sessions && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {card.study_sessions.title}
            </p>
          )}

          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
              {card.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{card.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {card.last_reviewed
                ? `Reviewed ${formatDistanceToNow(new Date(card.last_reviewed))} ago`
                : 'Not reviewed'}
            </div>
            {accuracy !== null && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>{accuracy}% accuracy</span>
              </div>
            )}
          </div>

          {card.times_reviewed && card.times_reviewed > 0 && (
            <Progress value={accuracy || 0} className="h-1" />
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

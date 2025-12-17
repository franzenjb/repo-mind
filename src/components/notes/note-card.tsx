'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Sparkles } from 'lucide-react';
import type { Note, Tag } from '@/types/database';

interface NoteWithTags extends Note {
  tags: Tag[];
  study_sessions?: { title: string };
}

interface NoteCardProps {
  note: NoteWithTags;
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-base truncate">{note.title}</CardTitle>
            </div>
            {note.ai_summary && (
              <Badge variant="secondary" className="flex-shrink-0">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {note.content}
          </p>

          {note.study_sessions && (
            <p className="text-xs text-muted-foreground">
              Session: {note.study_sessions.title}
            </p>
          )}

          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{note.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Updated {formatDistanceToNow(new Date(note.updated_at))} ago
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

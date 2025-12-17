'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BookOpen,
  FileText,
  MessageSquare,
  Image,
  MoreVertical,
  ExternalLink,
  Trash2,
  Edit,
  Archive,
} from 'lucide-react';
import type { StudySession, Tag } from '@/types/database';

interface SessionCardProps {
  session: StudySession & { tags: Tag[] };
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function SessionCard({ session, onDelete, onArchive }: SessionCardProps) {
  const statusColors = {
    active: 'bg-green-500/10 text-green-600 border-green-500/20',
    archived: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    completed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">
            <Link
              href={`/sessions/${session.id}`}
              className="hover:underline flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4 text-primary" />
              {session.title}
            </Link>
          </CardTitle>
          {session.repository_name && (
            <CardDescription className="flex items-center gap-1">
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
            </CardDescription>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusColors[session.status]}>
            {session.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/sessions/${session.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive?.(session.id)}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(session.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {session.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {session.description}
          </p>
        )}

        {/* Tags */}
        {session.tags && session.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {session.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />0 notes
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />0 Q&A
          </span>
          <span className="flex items-center gap-1">
            <Image className="h-3 w-3" />0 screenshots
          </span>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground">
          Created {formatDistanceToNow(new Date(session.created_at))} ago
        </p>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearch } from '@/hooks/use-search';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search as SearchIcon,
  BookOpen,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { data: results, isLoading, isFetching } = useSearch(query);

  const totalResults =
    (results?.sessions.length || 0) +
    (results?.notes.length || 0) +
    (results?.qaCards.length || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-muted-foreground">
          Search across all your sessions, notes, and Q&A cards
        </p>
      </div>

      <div className="relative max-w-2xl">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search for anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12 text-lg"
          autoFocus
        />
      </div>

      {query.trim() && (
        <div className="space-y-4">
          {isLoading || isFetching ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : totalResults > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Found {totalResults} result{totalResults !== 1 ? 's' : ''} for &quot;{query}&quot;
              </p>

              <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="all">
                    All ({totalResults})
                  </TabsTrigger>
                  <TabsTrigger value="sessions">
                    Sessions ({results?.sessions.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="notes">
                    Notes ({results?.notes.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="qa-cards">
                    Q&A ({results?.qaCards.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {results?.sessions.map((session) => (
                    <SearchResultCard
                      key={`session-${session.id}`}
                      href={`/sessions/${session.id}`}
                      type="Session"
                      icon={<BookOpen className="h-4 w-4" />}
                      title={session.title}
                      description={session.description}
                      updatedAt={session.updated_at}
                    />
                  ))}
                  {results?.notes.map((note) => (
                    <SearchResultCard
                      key={`note-${note.id}`}
                      href={`/notes/${note.id}`}
                      type="Note"
                      icon={<FileText className="h-4 w-4" />}
                      title={note.title}
                      description={note.content}
                      updatedAt={note.updated_at}
                    />
                  ))}
                  {results?.qaCards.map((card) => (
                    <SearchResultCard
                      key={`qa-${card.id}`}
                      href={`/qa-cards/${card.id}`}
                      type="Q&A"
                      icon={<MessageSquare className="h-4 w-4" />}
                      title={card.question}
                      description={card.answer}
                      updatedAt={card.updated_at}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="sessions" className="space-y-4">
                  {results?.sessions.map((session) => (
                    <SearchResultCard
                      key={session.id}
                      href={`/sessions/${session.id}`}
                      type="Session"
                      icon={<BookOpen className="h-4 w-4" />}
                      title={session.title}
                      description={session.description}
                      updatedAt={session.updated_at}
                    />
                  ))}
                  {results?.sessions.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No sessions found
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  {results?.notes.map((note) => (
                    <SearchResultCard
                      key={note.id}
                      href={`/notes/${note.id}`}
                      type="Note"
                      icon={<FileText className="h-4 w-4" />}
                      title={note.title}
                      description={note.content}
                      updatedAt={note.updated_at}
                    />
                  ))}
                  {results?.notes.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No notes found
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="qa-cards" className="space-y-4">
                  {results?.qaCards.map((card) => (
                    <SearchResultCard
                      key={card.id}
                      href={`/qa-cards/${card.id}`}
                      type="Q&A"
                      icon={<MessageSquare className="h-4 w-4" />}
                      title={card.question}
                      description={card.answer}
                      updatedAt={card.updated_at}
                    />
                  ))}
                  {results?.qaCards.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No Q&A cards found
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="text-center py-16 border rounded-lg bg-muted/30">
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try a different search term
              </p>
            </div>
          )}
        </div>
      )}

      {!query.trim() && (
        <div className="text-center py-16 border rounded-lg bg-muted/30">
          <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Start searching</h3>
          <p className="text-muted-foreground">
            Type a keyword to search across all your content
          </p>
        </div>
      )}
    </div>
  );
}

function SearchResultCard({
  href,
  type,
  icon,
  title,
  description,
  updatedAt,
}: {
  href: string;
  type: string;
  icon: React.ReactNode;
  title: string;
  description: string | null;
  updatedAt: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              {icon}
              {type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(updatedAt))} ago
            </span>
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        {description && (
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}

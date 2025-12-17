'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQACards } from '@/hooks/use-qa-cards';
import { QACardItem } from '@/components/qa-cards/qa-card-item';
import { FlashcardViewer } from '@/components/qa-cards/flashcard-viewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Plus, Search, PlayCircle, Grid } from 'lucide-react';

export default function QACardsPage() {
  const { data: cards, isLoading } = useQACards();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'study'>('grid');

  const filteredCards = cards?.filter(
    (card) =>
      card.question.toLowerCase().includes(search.toLowerCase()) ||
      card.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Q&A Cards</h1>
          <p className="text-muted-foreground">
            Test your knowledge with flashcards
          </p>
        </div>
        <div className="flex gap-2">
          {cards && cards.length > 0 && (
            <Button
              variant={view === 'study' ? 'default' : 'outline'}
              className="gap-2"
              onClick={() => setView(view === 'study' ? 'grid' : 'study')}
            >
              {view === 'study' ? (
                <>
                  <Grid className="h-4 w-4" />
                  View Cards
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  Study Mode
                </>
              )}
            </Button>
          )}
          <Link href="/qa-cards/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Card
            </Button>
          </Link>
        </div>
      </div>

      {view === 'study' && filteredCards && filteredCards.length > 0 ? (
        <FlashcardViewer cards={filteredCards} />
      ) : (
        <>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Q&A cards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : filteredCards && filteredCards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCards.map((card) => (
                <QACardItem key={card.id} card={card} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border rounded-lg bg-muted/30">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {search ? 'No cards found' : 'No Q&A cards yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {search
                  ? 'Try a different search term'
                  : 'Create your first Q&A card to start studying'}
              </p>
              {!search && (
                <Link href="/qa-cards/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Q&A Card
                  </Button>
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

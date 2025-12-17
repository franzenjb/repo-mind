'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  Shuffle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useUpdateQACardReview } from '@/hooks/use-qa-cards';
import type { QACard } from '@/types/database';
import { cn } from '@/lib/utils';

interface FlashcardViewerProps {
  cards: QACard[];
  onComplete?: () => void;
}

export function FlashcardViewer({ cards, onComplete }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledCards, setShuffledCards] = useState(cards);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);

  const updateReview = useUpdateQACardReview();

  const currentCard = shuffledCards[currentIndex];
  const progress = (reviewedCount / shuffledCards.length) * 100;

  const shuffleCards = useCallback(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedCount(0);
    setCorrectCount(0);
    setIsReviewing(false);
  }, [cards]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped && !isReviewing) {
      setIsReviewing(true);
    }
  };

  const handleResponse = async (correct: boolean) => {
    if (!currentCard) return;

    await updateReview.mutateAsync({ id: currentCard.id, correct });

    if (correct) {
      setCorrectCount((prev) => prev + 1);
    }
    setReviewedCount((prev) => prev + 1);
    setIsReviewing(false);

    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else if (onComplete) {
      onComplete();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setIsReviewing(false);
    }
  };

  const goToNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setIsReviewing(false);
    }
  };

  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No cards to review</p>
      </div>
    );
  }

  const difficultyColors = {
    easy: 'bg-green-500/10 text-green-600 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    hard: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Card {currentIndex + 1} of {shuffledCards.length}
          </span>
          <span className="text-muted-foreground">
            {reviewedCount} reviewed • {correctCount} correct
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="relative min-h-[400px]" style={{ perspective: '1000px' }}>
        <Card
          className={cn(
            'absolute inset-0 cursor-pointer transition-all duration-500',
            'flex flex-col'
          )}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
          onClick={handleFlip}
        >
          {/* Front (Question) */}
          <div
            className="absolute inset-0 backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
              <Badge
                variant="outline"
                className={cn('mb-4', difficultyColors[currentCard.difficulty as keyof typeof difficultyColors] || difficultyColors.medium)}
              >
                {currentCard.difficulty || 'medium'}
              </Badge>
              <p className="text-xl font-medium">{currentCard.question}</p>
              <div className="mt-8 flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span className="text-sm">Click to reveal answer</span>
              </div>
            </CardContent>
          </div>

          {/* Back (Answer) */}
          <div
            className="absolute inset-0 backface-hidden bg-card rounded-lg border"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
              <Badge variant="secondary" className="mb-4">
                Answer
              </Badge>
              <p className="text-lg">{currentCard.answer}</p>
              <div className="mt-8 flex items-center gap-2 text-muted-foreground">
                <EyeOff className="h-4 w-4" />
                <span className="text-sm">Click to see question</span>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={currentIndex === shuffledCards.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {isFlipped && isReviewing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 text-destructive border-destructive/50"
              onClick={() => handleResponse(false)}
              disabled={updateReview.isPending}
            >
              <XCircle className="h-4 w-4" />
              Incorrect
            </Button>
            <Button
              variant="outline"
              className="gap-2 text-green-600 border-green-600/50"
              onClick={() => handleResponse(true)}
              disabled={updateReview.isPending}
            >
              <CheckCircle className="h-4 w-4" />
              Correct
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={shuffleCards}>
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
              setReviewedCount(0);
              setCorrectCount(0);
              setIsReviewing(false);
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Completion message */}
      {reviewedCount === shuffledCards.length && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-6 text-center">
            <h3 className="text-lg font-medium mb-2">Session Complete!</h3>
            <p className="text-muted-foreground">
              You got {correctCount} out of {shuffledCards.length} correct (
              {Math.round((correctCount / shuffledCards.length) * 100)}%)
            </p>
            <Button className="mt-4" onClick={shuffleCards}>
              Start New Session
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useCreateQACard, useUpdateQACard } from '@/hooks/use-qa-cards';
import { useSessions } from '@/hooks/use-sessions';
import type { QACard } from '@/types/database';

const qaCardSchema = z.object({
  question: z.string().min(1, 'Question is required').max(1000),
  answer: z.string().min(1, 'Answer is required').max(5000),
  session_id: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

type QACardFormData = z.infer<typeof qaCardSchema>;

interface QACardFormProps {
  card?: QACard;
  mode: 'create' | 'edit';
}

export function QACardForm({ card, mode }: QACardFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get('session');

  const createQACard = useCreateQACard();
  const updateQACard = useUpdateQACard();
  const { data: sessions } = useSessions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QACardFormData>({
    resolver: zodResolver(qaCardSchema),
    defaultValues: {
      question: card?.question || '',
      answer: card?.answer || '',
      session_id: card?.session_id || sessionIdFromUrl || '',
      difficulty: (card?.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
    },
  });

  const onSubmit = async (data: QACardFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        const result = await createQACard.mutateAsync({
          question: data.question,
          answer: data.answer,
          session_id: data.session_id || null,
          difficulty: data.difficulty,
        });
        router.push(`/qa-cards/${result.id}`);
      } else if (card) {
        await updateQACard.mutateAsync({
          id: card.id,
          question: data.question,
          answer: data.answer,
          session_id: data.session_id || null,
          difficulty: data.difficulty,
        });
        router.push(`/qa-cards/${card.id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Create New Q&A Card' : 'Edit Q&A Card'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="session_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Study Session</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a session (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No session</SelectItem>
                      {sessions?.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Link this Q&A card to a study session
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What concept or topic are you testing?"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="The correct answer or explanation..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === 'create' ? 'Create Q&A Card' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { QACard, QACardInsert, QACardUpdate, Tag } from '@/types/database';
import { toast } from 'sonner';

interface QACardWithTags extends QACard {
  tags: Tag[];
  qa_card_tags?: { tag: Tag }[];
  study_sessions?: { title: string };
}

export function useQACards(sessionId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['qa-cards', sessionId],
    queryFn: async (): Promise<QACardWithTags[]> => {
      let query = supabase
        .from('qa_cards')
        .select(
          `
          *,
          qa_card_tags (
            tag:tags (*)
          ),
          study_sessions (title)
        `
        )
        .order('created_at', { ascending: false });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const cards = data as unknown as QACardWithTags[];
      return cards.map((card) => ({
        ...card,
        tags: card.qa_card_tags?.map((qt) => qt.tag) || [],
      }));
    },
  });
}

export function useQACard(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['qa-card', id],
    queryFn: async (): Promise<QACardWithTags> => {
      const { data, error } = await supabase
        .from('qa_cards')
        .select(
          `
          *,
          qa_card_tags (
            tag:tags (*)
          ),
          study_sessions (title)
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      const card = data as unknown as QACardWithTags;
      return {
        ...card,
        tags: card.qa_card_tags?.map((qt) => qt.tag) || [],
      };
    },
    enabled: !!id,
  });
}

export function useCreateQACard() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (card: Omit<QACardInsert, 'user_id'>): Promise<QACard> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const insertData = { ...card, user_id: user.id };
      const { data, error } = await supabase
        .from('qa_cards')
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as QACard;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['qa-cards'] });
      if (data.session_id) {
        queryClient.invalidateQueries({ queryKey: ['session', data.session_id] });
      }
      toast.success('Q&A card created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create Q&A card: ' + error.message);
    },
  });
}

export function useUpdateQACard() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: QACardUpdate & { id: string }): Promise<QACard> => {
      const { data, error } = await supabase
        .from('qa_cards')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as QACard;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['qa-cards'] });
      queryClient.invalidateQueries({ queryKey: ['qa-card', data.id] });
      if (data.session_id) {
        queryClient.invalidateQueries({ queryKey: ['session', data.session_id] });
      }
      toast.success('Q&A card updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update Q&A card: ' + error.message);
    },
  });
}

export function useDeleteQACard() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('qa_cards').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qa-cards'] });
      toast.success('Q&A card deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete Q&A card: ' + error.message);
    },
  });
}

export function useUpdateQACardReview() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      correct,
    }: {
      id: string;
      correct: boolean;
    }): Promise<QACard> => {
      const { data: existing, error: fetchError } = await supabase
        .from('qa_cards')
        .select('times_reviewed, times_correct')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const existingData = existing as { times_reviewed: number; times_correct: number };
      const updates = {
        times_reviewed: (existingData.times_reviewed || 0) + 1,
        times_correct: correct
          ? (existingData.times_correct || 0) + 1
          : existingData.times_correct || 0,
        last_reviewed: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('qa_cards')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as QACard;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['qa-cards'] });
      queryClient.invalidateQueries({ queryKey: ['qa-card', data.id] });
    },
  });
}

export function useGenerateQACards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      content,
    }: {
      sessionId?: string;
      content: string;
    }): Promise<{ question: string; answer: string }[]> => {
      const response = await fetch('/api/ai/generate-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Q&A cards');
      }

      const { cards } = await response.json();
      return cards;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qa-cards'] });
      toast.success('Q&A cards generated successfully');
    },
    onError: (error) => {
      toast.error('Failed to generate Q&A cards: ' + error.message);
    },
  });
}

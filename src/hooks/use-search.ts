'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { StudySession, Note, QACard } from '@/types/database';

interface SearchResult {
  sessions: StudySession[];
  notes: Note[];
  qaCards: QACard[];
}

export function useSearch(query: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<SearchResult> => {
      if (!query.trim()) {
        return { sessions: [], notes: [], qaCards: [] };
      }

      const searchTerm = `%${query}%`;

      const [sessionsResult, notesResult, qaCardsResult] = await Promise.all([
        supabase
          .from('study_sessions')
          .select('*')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},repository_name.ilike.${searchTerm}`)
          .order('updated_at', { ascending: false })
          .limit(10),
        supabase
          .from('notes')
          .select('*')
          .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
          .order('updated_at', { ascending: false })
          .limit(10),
        supabase
          .from('qa_cards')
          .select('*')
          .or(`question.ilike.${searchTerm},answer.ilike.${searchTerm}`)
          .order('updated_at', { ascending: false })
          .limit(10),
      ]);

      if (sessionsResult.error) throw sessionsResult.error;
      if (notesResult.error) throw notesResult.error;
      if (qaCardsResult.error) throw qaCardsResult.error;

      return {
        sessions: sessionsResult.data as StudySession[],
        notes: notesResult.data as Note[],
        qaCards: qaCardsResult.data as QACard[],
      };
    },
    enabled: query.trim().length > 0,
  });
}

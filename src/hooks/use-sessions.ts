'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  StudySession,
  StudySessionInsert,
  StudySessionUpdate,
  Tag,
  Note,
  QACard,
  Screenshot,
} from '@/types/database';
import { toast } from 'sonner';

interface SessionWithTags extends StudySession {
  tags: Tag[];
  session_tags?: { tag: Tag }[];
}

export function useSessions() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['sessions'],
    queryFn: async (): Promise<SessionWithTags[]> => {
      const { data, error } = await supabase
        .from('study_sessions')
        .select(
          `
          *,
          session_tags (
            tag:tags (*)
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include tags array
      const sessions = data as unknown as SessionWithTags[];
      return sessions.map((session) => ({
        ...session,
        tags: session.session_tags?.map((st) => st.tag) || [],
      }));
    },
  });
}

interface SessionDetail extends StudySession {
  tags: Tag[];
  session_tags?: { tag: Tag }[];
  notes?: Note[];
  qa_cards?: QACard[];
  screenshots?: Screenshot[];
}

export function useSession(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['session', id],
    queryFn: async (): Promise<SessionDetail> => {
      const { data, error } = await supabase
        .from('study_sessions')
        .select(
          `
          *,
          session_tags (
            tag:tags (*)
          ),
          notes (*),
          qa_cards (*),
          screenshots (*)
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      const session = data as unknown as SessionDetail;
      return {
        ...session,
        tags: session.session_tags?.map((st) => st.tag) || [],
      };
    },
    enabled: !!id,
  });
}

export function useCreateSession() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: Omit<StudySessionInsert, 'user_id'>): Promise<StudySession> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const insertData = { ...session, user_id: user.id };
      const { data, error } = await supabase
        .from('study_sessions')
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as StudySession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create session: ' + error.message);
    },
  });
}

export function useUpdateSession() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: StudySessionUpdate & { id: string }): Promise<StudySession> => {
      const { data, error } = await supabase
        .from('study_sessions')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as StudySession;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session', data.id] });
      toast.success('Session updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update session: ' + error.message);
    },
  });
}

export function useDeleteSession() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete session: ' + error.message);
    },
  });
}

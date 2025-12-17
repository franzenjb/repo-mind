'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Note, NoteInsert, NoteUpdate, Tag } from '@/types/database';
import { toast } from 'sonner';

interface NoteWithTags extends Note {
  tags: Tag[];
  note_tags?: { tag: Tag }[];
  study_sessions?: { title: string };
}

export function useNotes(sessionId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['notes', sessionId],
    queryFn: async (): Promise<NoteWithTags[]> => {
      let query = supabase
        .from('notes')
        .select(
          `
          *,
          note_tags (
            tag:tags (*)
          ),
          study_sessions (title)
        `
        )
        .order('updated_at', { ascending: false });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const notes = data as unknown as NoteWithTags[];
      return notes.map((note) => ({
        ...note,
        tags: note.note_tags?.map((nt) => nt.tag) || [],
      }));
    },
  });
}

export function useNote(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['note', id],
    queryFn: async (): Promise<NoteWithTags> => {
      const { data, error } = await supabase
        .from('notes')
        .select(
          `
          *,
          note_tags (
            tag:tags (*)
          ),
          study_sessions (title)
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      const note = data as unknown as NoteWithTags;
      return {
        ...note,
        tags: note.note_tags?.map((nt) => nt.tag) || [],
      };
    },
    enabled: !!id,
  });
}

export function useCreateNote() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: Omit<NoteInsert, 'user_id'>): Promise<Note> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const insertData = { ...note, user_id: user.id };
      const { data, error } = await supabase
        .from('notes')
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Note;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      if (data.session_id) {
        queryClient.invalidateQueries({ queryKey: ['session', data.session_id] });
      }
      toast.success('Note created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create note: ' + error.message);
    },
  });
}

export function useUpdateNote() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: NoteUpdate & { id: string }): Promise<Note> => {
      const { data, error } = await supabase
        .from('notes')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Note;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', data.id] });
      if (data.session_id) {
        queryClient.invalidateQueries({ queryKey: ['session', data.session_id] });
      }
      toast.success('Note updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update note: ' + error.message);
    },
  });
}

export function useDeleteNote() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete note: ' + error.message);
    },
  });
}

export function useGenerateNoteSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string): Promise<string> => {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const { summary } = await response.json();
      return summary;
    },
    onSuccess: (_, noteId) => {
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
      toast.success('Summary generated successfully');
    },
    onError: (error) => {
      toast.error('Failed to generate summary: ' + error.message);
    },
  });
}

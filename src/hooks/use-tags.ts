'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Tag, TagInsert, TagUpdate } from '@/types/database';
import { toast } from 'sonner';

export function useTags() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['tags'],
    queryFn: async (): Promise<Tag[]> => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Tag[];
    },
  });
}

export function useTag(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['tag', id],
    queryFn: async (): Promise<Tag> => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Tag;
    },
    enabled: !!id,
  });
}

export function useCreateTag() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: Omit<TagInsert, 'user_id'>): Promise<Tag> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const insertData = { ...tag, user_id: user.id };
      const { data, error } = await supabase
        .from('tags')
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create tag: ' + error.message);
    },
  });
}

export function useUpdateTag() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: TagUpdate & { id: string }): Promise<Tag> => {
      const { data, error } = await supabase
        .from('tags')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Tag;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tag', data.id] });
      toast.success('Tag updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update tag: ' + error.message);
    },
  });
}

export function useDeleteTag() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tags').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete tag: ' + error.message);
    },
  });
}

// Hook for managing tags on items (sessions, notes, qa_cards)
export function useItemTags(
  itemType: 'session' | 'note' | 'qa_card',
  itemId: string
) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const junctionTable = `${itemType}_tags`;
  const itemColumn = `${itemType}_id`;

  const addTag = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from(junctionTable as never)
        .insert({ [itemColumn]: itemId, tag_id: tagId } as never);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [itemType, itemId] });
      queryClient.invalidateQueries({ queryKey: [`${itemType}s`] });
    },
  });

  const removeTag = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from(junctionTable as never)
        .delete()
        .eq(itemColumn as never, itemId as never)
        .eq('tag_id' as never, tagId as never);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [itemType, itemId] });
      queryClient.invalidateQueries({ queryKey: [`${itemType}s`] });
    },
  });

  return { addTag, removeTag };
}

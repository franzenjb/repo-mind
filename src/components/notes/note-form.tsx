'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, Edit2 } from 'lucide-react';
import { useCreateNote, useUpdateNote } from '@/hooks/use-notes';
import { useSessions } from '@/hooks/use-sessions';
import type { Note } from '@/types/database';
import ReactMarkdown from 'react-markdown';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  session_id: z.string().optional(),
  file_path: z.string().max(500).optional(),
  line_start: z.number().optional(),
  line_end: z.number().optional(),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface NoteFormProps {
  note?: Note;
  mode: 'create' | 'edit';
}

export function NoteForm({ note, mode }: NoteFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get('session');

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const { data: sessions } = useSessions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewTab, setPreviewTab] = useState<string>('edit');

  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
      session_id: note?.session_id || sessionIdFromUrl || '',
      file_path: note?.file_path || '',
      line_start: note?.line_start || undefined,
      line_end: note?.line_end || undefined,
    },
  });

  const contentValue = form.watch('content');

  const onSubmit = async (data: NoteFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        const result = await createNote.mutateAsync({
          title: data.title,
          content: data.content,
          session_id: data.session_id || null,
          file_path: data.file_path || null,
          line_start: data.line_start || null,
          line_end: data.line_end || null,
        });
        router.push(`/notes/${result.id}`);
      } else if (note) {
        await updateNote.mutateAsync({
          id: note.id,
          title: data.title,
          content: data.content,
          session_id: data.session_id || null,
          file_path: data.file_path || null,
          line_start: data.line_start || null,
          line_end: data.line_end || null,
        });
        router.push(`/notes/${note.id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Create New Note' : 'Edit Note'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Understanding useEffect cleanup" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    Link this note to a study session
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content *</FormLabel>
                  <Tabs value={previewTab} onValueChange={setPreviewTab}>
                    <TabsList className="mb-2">
                      <TabsTrigger value="edit" className="gap-2">
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="gap-2">
                        <Eye className="h-3 w-3" />
                        Preview
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit">
                      <FormControl>
                        <Textarea
                          placeholder="Write your notes in Markdown..."
                          className="min-h-[300px] font-mono"
                          {...field}
                        />
                      </FormControl>
                    </TabsContent>
                    <TabsContent value="preview">
                      <div className="min-h-[300px] p-4 border rounded-md bg-muted/30 prose prose-sm dark:prose-invert max-w-none">
                        {contentValue ? (
                          <ReactMarkdown>{contentValue}</ReactMarkdown>
                        ) : (
                          <p className="text-muted-foreground">Nothing to preview</p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  <FormDescription>
                    Supports Markdown formatting
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="file_path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Path</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., src/hooks/useEffect.ts" {...field} />
                    </FormControl>
                    <FormDescription>Reference to source file</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="line_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Line</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 10"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="line_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Line</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 25"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === 'create' ? 'Create Note' : 'Save Changes'}
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

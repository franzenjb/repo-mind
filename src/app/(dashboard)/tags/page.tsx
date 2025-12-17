'use client';

import { useState } from 'react';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/use-tags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tags, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import type { Tag } from '@/types/database';

const TAG_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
];

function TagForm({
  tag,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  tag?: Tag;
  onSubmit: (name: string, color: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState(tag?.name || '');
  const [color, setColor] = useState(tag?.color || TAG_COLORS[0].value);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., React, TypeScript, Important"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Color</label>
        <div className="flex gap-2 flex-wrap">
          {TAG_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                color === c.value ? 'border-foreground scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Preview</label>
        <Badge
          variant="secondary"
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          {name || 'Tag name'}
        </Badge>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(name, color)}
          disabled={!name.trim() || isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {tag ? 'Save Changes' : 'Create Tag'}
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function TagsPage() {
  const { data: tags, isLoading } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const handleCreate = async (name: string, color: string) => {
    await createTag.mutateAsync({ name, color });
    setIsCreateOpen(false);
  };

  const handleUpdate = async (name: string, color: string) => {
    if (!editingTag) return;
    await updateTag.mutateAsync({ id: editingTag.id, name, color });
    setEditingTag(null);
  };

  const handleDelete = async (id: string) => {
    await deleteTag.mutateAsync(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tags</h1>
          <p className="text-muted-foreground">
            Organize your content with tags
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
              <DialogDescription>
                Create a new tag to organize your sessions, notes, and Q&A cards.
              </DialogDescription>
            </DialogHeader>
            <TagForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreateOpen(false)}
              isSubmitting={createTag.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : tags && tags.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <Card key={tag.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="text-sm"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  {tag.name}
                </Badge>
                <div className="flex gap-1">
                  <Dialog
                    open={editingTag?.id === tag.id}
                    onOpenChange={(open) => !open && setEditingTag(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingTag(tag)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Tag</DialogTitle>
                        <DialogDescription>
                          Update the tag name or color.
                        </DialogDescription>
                      </DialogHeader>
                      <TagForm
                        tag={tag}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingTag(null)}
                        isSubmitting={updateTag.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Tag?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the tag from all sessions, notes, and Q&A
                          cards. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(tag.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-muted/30">
          <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No tags yet</h3>
          <p className="text-muted-foreground mb-4">
            Create tags to organize your content
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Tag
          </Button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useTags, useCreateTag, useItemTags } from '@/hooks/use-tags';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Plus, X, Check, Tags } from 'lucide-react';
import type { Tag } from '@/types/database';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  itemType: 'session' | 'note' | 'qa_card';
  itemId: string;
  selectedTags: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
}

const TAG_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export function TagSelector({
  itemType,
  itemId,
  selectedTags,
  onTagsChange,
}: TagSelectorProps) {
  const { data: allTags } = useTags();
  const createTag = useCreateTag();
  const { addTag, removeTag } = useItemTags(itemType, itemId);
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const selectedTagIds = new Set(selectedTags.map((t) => t.id));

  const handleToggleTag = async (tag: Tag) => {
    if (selectedTagIds.has(tag.id)) {
      await removeTag.mutateAsync(tag.id);
      onTagsChange?.(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      await addTag.mutateAsync(tag.id);
      onTagsChange?.([...selectedTags, tag]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    const randomColor = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
    const newTag = await createTag.mutateAsync({
      name: newTagName.trim(),
      color: randomColor,
    });

    await addTag.mutateAsync(newTag.id);
    onTagsChange?.([...selectedTags, newTag]);
    setNewTagName('');
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="gap-1 pr-1"
            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
          >
            {tag.name}
            <button
              type="button"
              onClick={() => handleToggleTag(tag)}
              className="ml-1 rounded-full hover:bg-black/10 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 gap-1 text-xs">
              <Tags className="h-3 w-3" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandList>
                <CommandEmpty>
                  <div className="p-2 space-y-2">
                    <p className="text-sm text-muted-foreground">No tags found</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Create new tag..."
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="h-8"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreateTag();
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        className="h-8"
                        onClick={handleCreateTag}
                        disabled={!newTagName.trim() || createTag.isPending}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {allTags?.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => handleToggleTag(tag)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                      {selectedTagIds.has(tag.id) && (
                        <Check className="h-4 w-4 ml-auto" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <div className="p-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Create new tag..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="h-8"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateTag();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim() || createTag.isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useNotes } from '@/hooks/use-notes';
import { NoteCard } from '@/components/notes/note-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function NotesPage() {
  const { data: notes, isLoading } = useNotes();
  const [search, setSearch] = useState('');

  const filteredNotes = notes?.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notes</h1>
          <p className="text-muted-foreground">
            All your notes across all study sessions
          </p>
        </div>
        <Link href="/notes/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filteredNotes && filteredNotes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-muted/30">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {search ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search
              ? 'Try a different search term'
              : 'Create your first note to start documenting your learnings'}
          </p>
          {!search && (
            <Link href="/notes/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

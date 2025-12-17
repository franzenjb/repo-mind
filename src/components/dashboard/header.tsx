'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';

const pageTitles: Record<string, string> = {
  '/sessions': 'Study Sessions',
  '/notes': 'All Notes',
  '/qa-cards': 'Q&A Cards',
  '/search': 'Search',
  '/tags': 'Tags',
  '/export': 'Export',
  '/settings': 'Settings',
};

export function Header() {
  const pathname = usePathname();

  // Get the page title based on the current path
  const getTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (pathname.startsWith(path)) {
        return title;
      }
    }
    return 'Dashboard';
  };

  // Show create button for sessions, notes, qa-cards
  const showCreateButton = ['/sessions', '/notes', '/qa-cards'].some((path) =>
    pathname.startsWith(path)
  );

  const getCreateLink = () => {
    if (pathname.startsWith('/sessions')) return '/sessions/new';
    if (pathname.startsWith('/notes')) return '/notes/new';
    if (pathname.startsWith('/qa-cards')) return '/qa-cards/new';
    return '#';
  };

  const getCreateLabel = () => {
    if (pathname.startsWith('/sessions')) return 'New Session';
    if (pathname.startsWith('/notes')) return 'New Note';
    if (pathname.startsWith('/qa-cards')) return 'New Q&A';
    return 'Create';
  };

  return (
    <header className="flex h-16 items-center justify-between border-b px-6 bg-card">
      <h1 className="text-xl font-semibold">{getTitle()}</h1>

      <div className="flex items-center gap-4">
        {/* Quick search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Quick search..." className="pl-9" />
        </div>

        {/* Create button */}
        {showCreateButton && (
          <Link href={getCreateLink()}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {getCreateLabel()}
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}

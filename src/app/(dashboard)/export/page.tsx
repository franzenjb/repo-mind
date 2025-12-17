'use client';

import { useState } from 'react';
import { useSessions } from '@/hooks/use-sessions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileJson, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ExportPage() {
  const { data: sessions } = useSessions();
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [format, setFormat] = useState<'markdown' | 'json'>('markdown');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (selectedSession !== 'all') {
        params.set('sessionId', selectedSession);
      }
      params.set('format', format);

      const response = await fetch(`/api/export?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      if (format === 'json') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });
        downloadBlob(
          blob,
          `repomind-export-${selectedSession === 'all' ? 'all' : selectedSession}-${Date.now()}.json`
        );
      } else {
        const text = await response.text();
        const blob = new Blob([text], { type: 'text/markdown' });
        downloadBlob(
          blob,
          `repomind-export-${selectedSession === 'all' ? 'all' : selectedSession}-${Date.now()}.md`
        );
      }

      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Export</h1>
        <p className="text-muted-foreground">
          Download your sessions, notes, and Q&A cards
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Markdown Export
            </CardTitle>
            <CardDescription>
              Export your content as a readable Markdown document. Great for
              documentation, sharing, or importing into other tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>Human-readable format</li>
              <li>Compatible with most note-taking apps</li>
              <li>Includes all notes and Q&A cards</li>
            </ul>
            <Button
              variant={format === 'markdown' ? 'default' : 'outline'}
              className="w-full"
              onClick={() => setFormat('markdown')}
            >
              {format === 'markdown' ? 'Selected' : 'Select Markdown'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              JSON Export
            </CardTitle>
            <CardDescription>
              Export your content as structured JSON data. Perfect for backups,
              data migration, or programmatic access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>Complete data structure</li>
              <li>Easy to import elsewhere</li>
              <li>Includes all metadata</li>
            </ul>
            <Button
              variant={format === 'json' ? 'default' : 'outline'}
              className="w-full"
              onClick={() => setFormat('json')}
            >
              {format === 'json' ? 'Selected' : 'Select JSON'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Choose what to export and in which format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Scope</label>
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger>
                <SelectValue placeholder="Select what to export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content</SelectItem>
                {sessions?.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Export everything or select a specific session
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <div className="flex gap-2">
              <Button
                variant={format === 'markdown' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('markdown')}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Markdown
              </Button>
              <Button
                variant={format === 'json' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('json')}
                className="gap-2"
              >
                <FileJson className="h-4 w-4" />
                JSON
              </Button>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? 'Exporting...' : 'Download Export'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

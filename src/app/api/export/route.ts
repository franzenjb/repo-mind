import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { StudySession, Note, QACard } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const format = searchParams.get('format') || 'markdown';

    let sessions: StudySession[] = [];
    let notes: Note[] = [];
    let qaCards: QACard[] = [];

    if (sessionId) {
      const { data: session } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      const { data: sessionNotes } = await supabase
        .from('notes')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      const { data: sessionQACards } = await supabase
        .from('qa_cards')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      sessions = session ? [session as unknown as StudySession] : [];
      notes = (sessionNotes as unknown as Note[]) || [];
      qaCards = (sessionQACards as unknown as QACard[]) || [];
    } else {
      const { data: allSessions } = await supabase
        .from('study_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: allNotes } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: allQACards } = await supabase
        .from('qa_cards')
        .select('*')
        .order('created_at', { ascending: false });

      sessions = (allSessions as unknown as StudySession[]) || [];
      notes = (allNotes as unknown as Note[]) || [];
      qaCards = (allQACards as unknown as QACard[]) || [];
    }

    if (format === 'json') {
      return NextResponse.json({
        sessions,
        notes,
        qaCards,
        exportedAt: new Date().toISOString(),
      });
    }

    let markdown = '# RepoMind Export\n\n';
    markdown += `Exported on: ${new Date().toLocaleString()}\n\n`;

    if (sessions.length > 0) {
      markdown += '## Study Sessions\n\n';
      for (const session of sessions) {
        markdown += `### ${session.title}\n\n`;
        if (session.description) {
          markdown += `${session.description}\n\n`;
        }
        if (session.repository_name) {
          markdown += `**Repository:** ${session.repository_name}`;
          if (session.repository_url) {
            markdown += ` ([link](${session.repository_url}))`;
          }
          markdown += '\n\n';
        }
        markdown += `**Status:** ${session.status}\n`;
        markdown += `**Created:** ${new Date(session.created_at).toLocaleDateString()}\n\n`;
        markdown += '---\n\n';
      }
    }

    if (notes.length > 0) {
      markdown += '## Notes\n\n';
      for (const note of notes) {
        markdown += `### ${note.title}\n\n`;
        if (note.file_path) {
          markdown += `**File:** \`${note.file_path}\``;
          if (note.line_start) {
            markdown += ` (lines ${note.line_start}`;
            if (note.line_end) {
              markdown += `-${note.line_end}`;
            }
            markdown += ')';
          }
          markdown += '\n\n';
        }
        markdown += `${note.content}\n\n`;
        if (note.ai_summary) {
          markdown += `> **AI Summary:** ${note.ai_summary}\n\n`;
        }
        markdown += '---\n\n';
      }
    }

    if (qaCards.length > 0) {
      markdown += '## Q&A Cards\n\n';
      for (const card of qaCards) {
        markdown += `### Q: ${card.question}\n\n`;
        markdown += `**A:** ${card.answer}\n\n`;
        if (card.difficulty) {
          markdown += `**Difficulty:** ${card.difficulty}\n`;
        }
        if (card.times_reviewed && card.times_reviewed > 0) {
          const accuracy = Math.round(
            (card.times_correct / card.times_reviewed) * 100
          );
          markdown += `**Reviewed:** ${card.times_reviewed} times (${accuracy}% accuracy)\n`;
        }
        markdown += '\n---\n\n';
      }
    }

    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="repomind-export-${
          sessionId || 'all'
        }-${Date.now()}.md"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

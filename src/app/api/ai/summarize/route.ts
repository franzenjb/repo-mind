import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { anthropic, CLAUDE_MODEL } from '@/lib/ai/anthropic';
import { PROMPTS } from '@/lib/ai/prompts';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { noteId, content } = await request.json();

    let textToSummarize = content;

    if (noteId) {
      const { data: note, error } = await supabase
        .from('notes')
        .select('content')
        .eq('id', noteId)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }

      textToSummarize = (note as { content: string }).content;
    }

    if (!textToSummarize) {
      return NextResponse.json(
        { error: 'No content to summarize' },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: PROMPTS.summarize(textToSummarize),
        },
      ],
    });

    const summary =
      message.content[0].type === 'text' ? message.content[0].text : '';

    if (noteId) {
      await supabase
        .from('notes')
        .update({ ai_summary: summary } as never)
        .eq('id', noteId);
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

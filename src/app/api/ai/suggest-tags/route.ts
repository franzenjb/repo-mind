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

    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      );
    }

    const { data: existingTags } = await supabase
      .from('tags')
      .select('name')
      .eq('user_id', user.id);

    const existingTagNames = (existingTags as { name: string }[] | null)?.map((t) => t.name) || [];

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: PROMPTS.suggestTags(content, existingTagNames),
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    let suggestions: string[] = [];
    try {
      suggestions = JSON.parse(responseText);
    } catch {
      suggestions = responseText
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length < 50);
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error suggesting tags:', error);
    return NextResponse.json(
      { error: 'Failed to suggest tags' },
      { status: 500 }
    );
  }
}

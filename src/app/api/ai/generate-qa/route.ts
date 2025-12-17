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

    const { sessionId, content, count = 5 } = await request.json();

    let textToProcess = content;

    if (sessionId && !content) {
      const { data: notes, error } = await supabase
        .from('notes')
        .select('content')
        .eq('session_id', sessionId);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch notes' },
          { status: 500 }
        );
      }

      textToProcess = (notes as { content: string }[]).map((n) => n.content).join('\n\n');
    }

    if (!textToProcess) {
      return NextResponse.json(
        { error: 'No content to generate questions from' },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: PROMPTS.generateQuestions(textToProcess, count),
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    let cards: { question: string; answer: string }[] = [];
    try {
      cards = JSON.parse(responseText);
    } catch {
      const lines = responseText.split('\n').filter((l) => l.trim());
      cards = [];
      for (let i = 0; i < lines.length - 1; i += 2) {
        const question = lines[i].replace(/^Q:\s*/i, '').trim();
        const answer = lines[i + 1]?.replace(/^A:\s*/i, '').trim();
        if (question && answer) {
          cards.push({ question, answer });
        }
      }
    }

    if (sessionId && cards.length > 0) {
      const insertData = cards.map((card) => ({
        session_id: sessionId,
        user_id: user.id,
        question: card.question,
        answer: card.answer,
        ai_generated: true,
        difficulty: 'medium',
      }));

      await supabase.from('qa_cards').insert(insertData as never);
    }

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Error generating Q&A cards:', error);
    return NextResponse.json(
      { error: 'Failed to generate Q&A cards' },
      { status: 500 }
    );
  }
}

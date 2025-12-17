import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

export async function generateCompletion(params: {
  system: string;
  userMessage: string;
  maxTokens?: number;
}) {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: params.maxTokens || 1024,
    system: params.system,
    messages: [{ role: 'user', content: params.userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : '';
}

export async function streamCompletion(params: {
  system: string;
  userMessage: string;
  maxTokens?: number;
}) {
  const stream = await anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: params.maxTokens || 1024,
    system: params.system,
    messages: [{ role: 'user', content: params.userMessage }],
  });

  return stream;
}

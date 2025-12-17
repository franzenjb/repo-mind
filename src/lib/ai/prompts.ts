export const PROMPTS = {
  summarize: (content: string) => `You are a concise summarizer. Create a clear, actionable summary that captures key concepts and insights. Focus on what's most important for learning and retention. Keep the summary to 2-3 paragraphs maximum.

Summarize the following content:

${content}`,

  generateQuestions: (content: string, count: number) => `You are an expert educator creating study questions. Generate questions that test understanding, not just recall. Include a mix of conceptual and practical questions.

Based on the following content, generate ${count} study questions with detailed answers.

Return ONLY a JSON array in this exact format (no other text):
[{"question": "...", "answer": "..."}]

Content:
${content}`,

  suggestTags: (content: string, existingTags: string[]) => `You are a content categorization expert. Suggest relevant, concise tags that help organize and find content later. Tags should be lowercase, single words or short hyphenated phrases (max 2 words).

${existingTags.length > 0 ? `Existing tags in the system: ${existingTags.join(', ')}\nPrefer existing tags when appropriate.\n` : ''}
Suggest 3-5 tags for this content:

${content}

Return ONLY a JSON array of strings (no other text): ["tag1", "tag2", ...]`,

  findRelated: (content: string) => `You are analyzing content for semantic similarity. Identify the main concepts and themes that would connect this to other content.

Extract 5-7 key concepts from this content that could be used to find related materials:

${content}

Return ONLY a JSON array of strings (no other text): ["concept1", "concept2", ...]`,
};

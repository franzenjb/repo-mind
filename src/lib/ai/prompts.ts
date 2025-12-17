export const PROMPTS = {
  summarize: {
    system: `You are a concise summarizer. Create clear, actionable summaries that capture key concepts and insights. Focus on what's most important for learning and retention. Keep summaries to 2-3 paragraphs maximum.`,
    user: (content: string) => `Summarize the following content:

${content}`,
  },

  generateQuestions: {
    system: `You are an expert educator creating study questions. Generate questions that test understanding, not just recall. Include a mix of conceptual and practical questions. Return valid JSON only.`,
    user: (content: string, count: number) => `Based on the following content, generate ${count} study questions with detailed answers.

Return ONLY a JSON array in this exact format (no other text):
[{"question": "...", "answer": "...", "difficulty": "easy|medium|hard"}]

Content:
${content}`,
  },

  suggestTags: {
    system: `You are a content categorization expert. Suggest relevant, concise tags that help organize and find content later. Tags should be lowercase, single words or short hyphenated phrases (max 2 words). Return valid JSON only.`,
    user: (content: string, existingTags: string[]) => `Suggest 3-5 tags for this content.
${existingTags.length > 0 ? `Existing tags in the system: ${existingTags.join(', ')}\nPrefer existing tags when appropriate.` : ''}

Content:
${content}

Return ONLY a JSON array of strings (no other text): ["tag1", "tag2", ...]`,
  },

  findRelated: {
    system: `You are analyzing content for semantic similarity. Identify the main concepts and themes that would connect this to other content. Return valid JSON only.`,
    user: (content: string) => `Extract 5-7 key concepts from this content that could be used to find related materials:

${content}

Return ONLY a JSON array of strings (no other text): ["concept1", "concept2", ...]`,
  },
};

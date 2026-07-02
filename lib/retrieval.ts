import { Chunk } from '@prisma/client';

function tokenize(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

export function scoreChunks(question: string, chunks: Chunk[], limit = 5) {
  const qTokens = tokenize(question);
  const qSet = new Set(qTokens);

  return chunks
    .map((chunk) => {
      const words = tokenize(chunk.content);
      let score = 0;
      for (const word of words) {
        if (qSet.has(word)) score += 1;
      }
      const coverage = new Set(words.filter((word) => qSet.has(word))).size;
      return { chunk, score: score + coverage * 2 };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

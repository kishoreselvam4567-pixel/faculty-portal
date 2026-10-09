export interface ChunkingOptions {
  maxChunkSize?: number;
  overlap?: number;
}

export function chunkText(
  text: string,
  options: ChunkingOptions = {}
): string[] {
  const maxChunkSize = options.maxChunkSize || 450;
  const overlap = options.overlap || 80;

  if (!text || text.trim().length === 0) return [];

  // Normalize newlines
  const normalized = text.replace(/\r\n/g, '\n');
  const paragraphs = normalized.split(/\n\s*\n/);

  const chunks: string[] = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    if (currentChunk.length + trimmedPara.length + 2 <= maxChunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + trimmedPara;
    } else {
      // If adding this paragraph exceeds maxChunkSize, split paragraph by sentences if needed
      if (currentChunk) {
        chunks.push(currentChunk);
        // Retain overlap from end of currentChunk
        const words = currentChunk.split(/\s+/);
        const overlapText = words.slice(-Math.floor(overlap / 6)).join(' ');
        currentChunk = overlapText;
      }

      if (trimmedPara.length <= maxChunkSize) {
        currentChunk += (currentChunk ? ' ' : '') + trimmedPara;
      } else {
        // Break large paragraph into sentence-level chunks
        const sentences = trimmedPara.split(/(?<=[.?!])\s+/);
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length + 1 <= maxChunkSize) {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
          } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = sentence;
          }
        }
      }
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

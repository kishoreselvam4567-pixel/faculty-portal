import { DocumentChunk, RAGSearchResult } from './rag.types';

export class InMemoVectorStore {
  private chunks: DocumentChunk[] = [];

  addChunks(chunks: DocumentChunk[]) {
    this.chunks.push(...chunks);
  }

  deleteChunksByDocumentId(documentId: string) {
    this.chunks = this.chunks.filter((c) => c.documentId !== documentId);
  }

  getChunkCount(): number {
    return this.chunks.length;
  }

  search(
    queryEmbedding: number[],
    queryText: string,
    topK = 4,
    departmentId?: string | null
  ): RAGSearchResult[] {
    if (this.chunks.length === 0) return [];

    const queryTerms = queryText.toLowerCase().split(/\W+/).filter((t) => t.length > 2);

    const scored = this.chunks.map((chunk) => {
      // Permission / department filtering
      if (
        departmentId &&
        chunk.departmentId &&
        chunk.departmentId !== departmentId
      ) {
        return { chunk, score: 0 };
      }

      // 1. Vector cosine similarity
      const vectorScore = this.cosineSimilarity(queryEmbedding, chunk.embedding);

      // 2. Lexical keyword boost
      let lexicalBoost = 0;
      const chunkLower = chunk.text.toLowerCase();
      const titleLower = chunk.title.toLowerCase();

      for (const term of queryTerms) {
        if (titleLower.includes(term)) lexicalBoost += 0.15;
        if (chunkLower.includes(term)) lexicalBoost += 0.08;
      }

      const totalScore = Math.min(1.0, vectorScore * 0.7 + lexicalBoost);

      return { chunk, score: totalScore };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return scored
      .filter((item) => item.score > 0.25)
      .slice(0, topK)
      .map(({ chunk, score }) => ({
        id: chunk.id,
        documentId: chunk.documentId,
        title: chunk.title,
        documentName: chunk.documentName,
        category: chunk.category,
        snippet: chunk.text.length > 320 ? chunk.text.slice(0, 317) + '...' : chunk.text,
        score: Math.round(score * 100) / 100,
      }));
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      magA += vecA[i] * vecA[i];
      magB += vecB[i] * vecB[i];
    }

    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }
}

export const vectorStore = new InMemoVectorStore();
export default vectorStore;

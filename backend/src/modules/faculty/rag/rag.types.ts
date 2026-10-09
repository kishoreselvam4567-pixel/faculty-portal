export type KnowledgeCategory =
  | 'SYLLABUS'
  | 'REGULATIONS'
  | 'EXAMINATION'
  | 'ACADEMIC_NOTICE'
  | 'FACULTY_GUIDELINE'
  | 'COURSE_MATERIAL';

export interface KnowledgeDocument {
  id: string;
  title: string;
  documentName: string;
  category: KnowledgeCategory;
  departmentId?: string | null;
  content: string;
  authorUid?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  embedding: number[];
  category: KnowledgeCategory;
  title: string;
  documentName: string;
  departmentId?: string | null;
}

export interface RAGSearchResult {
  id: string;
  documentId: string;
  title: string;
  documentName: string;
  category: string;
  snippet: string;
  score: number;
}

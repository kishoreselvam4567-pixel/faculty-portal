# HANDOFF 03: Jeresh to Kishore — Faculty RAG & Knowledge Retrieval

**Status:** COMPLETE  
**Previous Branch:** `feature/faculty-tools`  
**Next Owner:** KISHORE  
**Next Branch:** `feature/faculty-chat-ui`  

---

## 1. Overview & Accomplishments

As the RAG and Knowledge Retrieval developer:
1. **Built Institutional RAG Engine:** Implemented `RAGKnowledgeEngine` indexing verified academic policies, syllabus documents, and exam guidelines.
2. **Deterministic Document Chunking:** Created recursive sliding-window chunker (`chunkText`) that respects heading boundaries, paragraph breaks, and token limits (target: 450 chars, 80 char overlap).
3. **In-Memory Cosine Vector Store:** Implemented `RAGVectorStore` with hybrid TF-IDF/lexical scoring and cosine similarity ranking.
4. **Pre-Seeded Institutional Knowledge:** Indexed:
   - `CS701 Cloud Computing & Virtualization Course Syllabus`
   - `CS702 Cryptography & Network Security Course Specification`
   - `Academic Regulations 2026: Student Attendance & Condonation Rules (75% Rule)`
   - `Continuous Internal Assessment (CIA) & Examination Evaluation Policy 2026`
   - `Faculty Class Incharge Guidelines & Mentorship Standard Operating Procedure`
5. **Integrated Canonical RAG Tools:** Bound `faculty.searchKnowledge` and `faculty.getKnowledgeContext` into the shared Tool Registry.
6. **Strict Live Data Boundary:** Ensured RAG never attempts to serve live database attendance or roster numbers; all live data remains under Ashik's deterministic tools.

---

## 2. Exact Files Changed / Created

- `backend/src/modules/faculty/rag/chunker.ts` (Recursive paragraph & heading chunker)
- `backend/src/modules/faculty/rag/rag.types.ts` (Document, chunk, and search result schemas)
- `backend/src/modules/faculty/rag/ragVectorStore.ts` (Cosine similarity vector store)
- `backend/src/modules/faculty/rag/ragEngine.ts` (Institutional knowledge search orchestrator & document seeder)
- `backend/src/modules/faculty/faculty.routes.ts` (`GET /api/faculty/knowledge/search?q=<query>`)

---

## 3. RAG Output Contract for Frontend UI

When a user query touches institutional policies or syllabi, the orchestrator includes verified citations in the `sources` array of the response:

```json
{
  "reply": "According to Section 4.2 of the Academic Regulations 2026...",
  "sources": [
    {
      "id": "doc-reg-01",
      "title": "Academic Regulations 2026 — Attendance Requirements",
      "documentName": "Academic_Regulations_2026.pdf",
      "category": "REGULATIONS",
      "snippet": "Section 4.2: Minimum 75% attendance mandatory to appear for End Semester Examinations. Condonation permitted between 65-74% on medical grounds with Principal approval.",
      "score": 0.91
    }
  ]
}
```

---

## 4. Instructions for Kishore (Frontend Chatbot UI Owner)

> Implement the Faculty/Class Incharge Chatbot UI using the established backend contract.
>
> 1. Consume `POST /api/faculty/chat` (or `POST /api/faculty/assistant/chat`).
> 2. Ensure your API client uses a fresh Firebase ID token via `auth.currentUser.getIdToken()`. Never use localStorage tokens.
> 3. Do NOT calculate attendance percentages or statistics in frontend code. Display the values returned by the backend tools.
> 4. Render RAG citations using the `sources` metadata provided by the backend response. Do NOT query Supabase or vector stores directly from the frontend.
> 5. Handle all states: Loading, Error, Empty, Retry, Tool badges, and Interactive confirmation modal.

---

## 5. Files Kishore Must NOT Modify

- Backend services, repositories, or routes (`backend/**`)
- Supabase schema or Prisma models
- HOD or Student frontend modules (`frontend/src/modules/hod/**`, `frontend/src/modules/student/**`)

# HANDOFF 01: Tushar to Ashik — Faculty AI Orchestrator & Tool Contract

**Status:** COMPLETE  
**Previous Branch:** `FAC`  
**Next Owner:** ASHIK  
**Next Branch:** `feature/faculty-tools`  

---

## 1. Overview & Accomplishments

As the first developer in the sequential chain, I have established and frozen:
1. **Canonical Faculty Chatbot Route:** `POST /api/faculty/chat` (also alias-mounted at `POST /api/faculty/assistant/chat`).
2. **Provider-Agnostic AI Engine:** Support for Gemini (`gemini-2.5-flash`), OpenAI-compatible providers, and an intelligent deterministic local engine (`RuleBasedProvider`).
3. **Canonical Tool Contract:** 19 standardized tool interfaces prefixed with `faculty.*`, fully mapped to `FacultyService` and the RAG engine.
4. **Security & RBAC Enforcement:** Strictly enforced `authMiddleware` + `requireFaculty` with verified token UID extraction. No browser-supplied authentication fields are trusted.
5. **Multi-Turn Conversation Store:** Isolated conversation sessions per faculty UID with zero cross-tenant state bleed.

---

## 2. Exact Files Changed / Created

- `backend/src/modules/faculty/faculty.routes.ts` (Mounted `POST /chat` and `POST /assistant/chat`)
- `backend/src/modules/faculty/ai/ai.types.ts` (Core orchestration interfaces & context schemas)
- `backend/src/modules/faculty/ai/aiEngine.ts` (Provider abstraction layer)
- `backend/src/modules/faculty/ai/aiOrchestrator.ts` (Multi-turn loop, tool execution & confirmation handling)
- `backend/src/modules/faculty/ai/assistant.controller.ts` (Express controller handlers for chat, conversations, tools)
- `backend/src/modules/faculty/ai/conversation.store.ts` (In-memory isolated conversation storage)
- `backend/src/modules/faculty/ai/providers/geminiProvider.ts` (Google Gemini adapter)
- `backend/src/modules/faculty/ai/providers/openaiProvider.ts` (OpenAI / Ollama adapter)
- `backend/src/modules/faculty/ai/providers/ruleBasedProvider.ts` (Intelligent deterministic fallback)
- `backend/src/modules/faculty/tools/toolRegistry.ts` (Canonical tool registry defining all 19 `faculty.*` tools)
- `docs/faculty/FACULTY_AI_TOOL_CONTRACT.md` (Frozen contract specification)

---

## 3. Exact Functions & Classes Created

- `FacultyAIOrchestrator` (`backend/src/modules/faculty/ai/aiOrchestrator.ts`)
  - `registerTool(tool: ToolDefinition): void`
  - `processChat(context: ToolExecutionContext, request: ChatRequestInput): Promise<ChatResponseOutput>`
  - `executeTool(name: string, args: any, context: ToolExecutionContext): Promise<any>`
- `AssistantController` (`backend/src/modules/faculty/ai/assistant.controller.ts`)
  - `chat(req: Request, res: Response): Promise<void>`
  - `getConversations(req: Request, res: Response): Promise<void>`
  - `createConversation(req: Request, res: Response): Promise<void>`
  - `getTools(req: Request, res: Response): Promise<void>`
- `RuleBasedProvider` (`backend/src/modules/faculty/ai/providers/ruleBasedProvider.ts`)
  - `generateResponse(messages, tools, systemPrompt): Promise<AIProviderResponse>`
  - `synthesizeToolOutput(toolName, data, error): string`

---

## 4. Exact API Endpoints & Contracts

- `POST /api/faculty/chat`:
  - Request: `{ "message": "string", "conversationId": "string (optional)" }`
  - Response: `{ "conversationId": "string", "reply": "string", "toolCalls": [], "sources": [] }`
- `GET /api/faculty/assistant/tools`: Returns all registered tools.

---

## 5. Reused Services & Repositories

- `FacultyService` (`backend/src/modules/faculty/faculty.service.ts`):
  - `getDashboard`, `getProfile`, `getAssignedClasses`, `getClassDetails`, `getClassStudents`, `getStudentDetails`, `getDepartment`, `getSubjects`, `getAcademicYears`, `getSemesters`, `getClassAttendanceStats`, `getClassAttendanceHistory`, `getTodayReminders`, `search`
- `authMiddleware` (`backend/src/middleware/auth.middleware.ts`)
- `requireFaculty` (`backend/src/middleware/role.middleware.ts`)

---

## 6. Authorization & Tenant Security

- All endpoints extract identity from `req.user.uid` verified via Firebase token.
- No `role`, `uid`, `college_id`, or `department_id` is accepted from request body.
- Attendance queries use `attendance_session_id`.

---

## 7. Instructions for Ashik (Backend Tools Owner)

> Read `FACULTY_AI_TOOL_CONTRACT.md` and this document before changing code. Implement only the backend data/tool executors specified there. Reuse the existing Faculty service/repository and authorization functions. Do not create a second Faculty authorization layer. Do NOT create generic database querying tools (`getDb()`, `executeSql()`). Return deterministic structured JSON objects from tools.

---

## 8. Files Ashik Must NOT Modify

- `backend/src/modules/faculty/faculty.middleware.ts`
- `backend/src/middleware/auth.middleware.ts`
- `backend/src/middleware/role.middleware.ts`
- `backend/src/modules/faculty/ai/aiOrchestrator.ts`
- Frontend code (`frontend/**`)

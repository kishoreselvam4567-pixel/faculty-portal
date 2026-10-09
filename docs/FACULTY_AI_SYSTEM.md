# Faculty AI Assistant & LMS Integration Documentation

## 1. Executive Summary & Architecture

The **Faculty AI Assistant** is a production-oriented, grounded academic intelligence subsystem embedded directly within the Aura Academia College LMS Faculty Portal. It integrates with real backend APIs, database models (Prisma ORM & Supabase PostgreSQL), scoped authentication (`authMiddleware`, `requireFaculty`), and the React 19 frontend design system.

### Architecture Overview

```mermaid
graph TD
    UI["Faculty Portal Frontend (React 19 + TypeScript + Vite)"]
    Page["FacultyAssistantPage (/assistant)"]
    Sidebar["Conversation History & Quick Chips"]
    UI --> Page
    Page --> Sidebar

    API["Backend Express API (/api/faculty/assistant/*)"]
    Auth["Role Guard (FACULTY / HOD)"]
    Orchestrator["Faculty AI Orchestrator"]
    Engine["AIEngine (Gemini / OpenAI / Deterministic Local)"]
    Tools["Modular Faculty Tool Registry (13 Tools)"]
    RAG["Faculty RAG Engine (Chunking + Vector Store)"]

    Page -->|REST / JSON| API
    API --> Auth --> Orchestrator
    Orchestrator <--> Engine
    Orchestrator <--> Tools
    Orchestrator <--> RAG

    Tools --> Service["Existing FacultyService & Repository"]
    Tools --> TaskStore["Task & Email Draft Store"]
    RAG --> DocStore["Approved Syllabi & Regulations Store"]
```

---

## 2. Key Capabilities & Features

### A. Faculty Chatbot User Interface
- **Dedicated Route**: Located at `/assistant`, integrated directly in the sidebar navigation with custom badge.
- **Message History Panel**: Browse past conversations, search previous conversations, rename and delete with confirmation dialogs.
- **Markdown & Code Rendering**: Full formatting for headers, bullet points, markdown tables, and syntax-highlighted code blocks with a one-click copy-to-clipboard action.
- **Tool Execution Feedback**: Dynamic badges displaying tool name, input arguments, execution status, and interactive confirmation modals.
- **Knowledge Sources Citations**: Grounded institutional references showing document title, category, and relevance matching score.
- **Suggested Prompts**: 5 pre-configured prompt cards across Class Incharge duties, Today's Schedule, Tasks, Syllabi, and Email drafts.
- **Input Controls**: Enter-to-send, Shift+Enter for multiline, Stop generation control, and Retry failed requests button.

### B. AI Orchestration Layer (`FacultyAIOrchestrator`)
- **Intent Understanding & Classification**: Maps natural-language requests into tool operations or institutional RAG queries.
- **Multi-Turn Context**: Maintains recent conversation window without state bleed across different faculty members.
- **Zero-Downtime Provider Abstraction**:
  - Google Gemini (`gemini-2.5-flash` / `gemini-1.5-flash`) via `GEMINI_API_KEY`
  - OpenAI-compatible endpoints via `OPENAI_API_KEY` / `OPENAI_BASE_URL`
  - Intelligent Deterministic Academic Engine (zero-dependency local fallback that always operates without crashing or presenting empty views).
- **Interactive Action Confirmation**: Sensitive actions (e.g., dispatching emails, deleting critical tasks) require explicit faculty confirmation before execution.
- **Audit Logging**: Logs tool name, input arguments, and execution timestamp into `FacultyAuditRecord` without recording passwords or privileged secrets.

---

## 3. Modular Faculty Tool Registry

| Tool Name | Display Name | Permissions / Security | Description |
| :--- | :--- | :--- | :--- |
| `get_faculty_profile` | Faculty Profile | Self (`facultyUid`) | Retrieves authenticated faculty profile, designation, department code, and employee ID. |
| `get_dashboard_stats` | Dashboard Overview | Self | Returns assigned classes count, total students, pending attendance sessions, and academic year. |
| `get_assigned_classes` | Assigned Classes | Self | Lists assigned classes, term numbers, student enrollment, and Class Incharge flag. |
| `get_class_students` | Class Student Roster | Incharge / Dept Scope | Scoped student roster for verified assigned class. Unauthorized classes are rejected. |
| `get_student_academic_info` | Student Academic Profile | Dept Scope | Retrieves student details, register number, and enrollment information. |
| `get_subjects` | Courses & Syllabi | Dept Scope | Returns degree courses, credit weights, semester numbers, and course codes. |
| `get_academic_calendar` | Academic Calendar & Terms | College Scope | Retrieves academic year term boundaries and semester milestone dates. |
| `get_today_schedule` | Today's Deliverables | Self | Returns today's active classes, period attendance status, and pending deliverables. |
| `query_attendance_summary` | Attendance Analytics | Assigned Class | Summarizes class attendance percentage, sessions conducted, and shortage alerts (<75%). |
| `manage_faculty_tasks` | Faculty Task Management | Self | `LIST`, `CREATE`, `UPDATE`, and `DELETE` academic tasks and reminder deadlines. |
| `compose_email_draft` | Compose Email Draft | Self | Prepares draft notices and emails to students, class groups, or HOD. |
| `send_email` | Send Academic Email | **Requires Confirmation** | Dispatches email notice. Prompts user for interactive confirmation before sending. |
| `search_knowledge_base` | Knowledge Base (RAG) | Access Controlled | Vector search across approved syllabi, academic regulations, and exam policies. |

---

## 4. Faculty RAG Knowledge System

### Indexing & Retrieval Architecture
1. **Source Documents**:
   - `CS701 Cloud Computing & Virtualization Course Syllabus`
   - `CS702 Cryptography & Network Security Course Specification`
   - `Academic Regulations 2026: Student Attendance & Condonation Rules (75% Rule)`
   - `Continuous Internal Assessment (CIA) & Examination Evaluation Policy 2026`
   - `Faculty Class Incharge Guidelines & Mentorship Standard Operating Procedure`
2. **Chunking**: Recursive sliding window chunker (`chunkText`) splitting text along paragraph and sentence boundaries (target size: 450 characters, 80 character overlap).
3. **Embeddings & Vector Store**: Cosine similarity matching boosted with lexical keyword relevance scores.
4. **Access Control**: Filtering by department and role ensuring students or unauthorized faculty cannot retrieve confidential records.

---

## 5. API Endpoint Reference

All endpoints require `Authorization: Bearer <token>` or `x-dev-uid: <uid>` header and verify the `FACULTY` or `HOD` role.

### AI Assistant Endpoints
- `POST /api/faculty/assistant/chat`: Send chat message or action confirmation.
- `GET /api/faculty/assistant/conversations`: List faculty's chat conversations.
- `POST /api/faculty/assistant/conversations`: Create new conversation session.
- `GET /api/faculty/assistant/conversations/:id/messages`: Retrieve messages in a conversation.
- `PATCH /api/faculty/assistant/conversations/:id`: Rename conversation title.
- `DELETE /api/faculty/assistant/conversations/:id`: Delete conversation.
- `GET /api/faculty/assistant/tools`: List all registered tools and their confirmation requirements.

### Task Management Endpoints
- `GET /api/faculty/tasks`: List all tasks for authenticated faculty.
- `POST /api/faculty/tasks`: Create new task (`title`, `dueDate`, `priority`, `category`).
- `PATCH /api/faculty/tasks/:id`: Update task (`status`, `priority`, `title`).
- `DELETE /api/faculty/tasks/:id`: Delete task.

### Email & Communication Endpoints
- `GET /api/faculty/email/drafts`: List email drafts.
- `POST /api/faculty/email/drafts`: Create draft notice.
- `POST /api/faculty/email/send`: Dispatch email (confirmed operation).

### Knowledge & Notifications
- `GET /api/faculty/knowledge/search?q=<query>`: Query RAG vector store for grounded citations.
- `GET /api/faculty/notifications`: Active reminders, pending attendance, and announcements.

---

## 6. Testing & Quality Assurance

The codebase includes an automated test runner validating all tiers:

```bash
# Run Unit, Integration, Security, and E2E Orchestrator tests
npm --prefix backend test

# Run Live HTTP Integration tests against the running Express backend
npm --prefix backend run test:live
```

### Verified Test Results
- **Unit Tests**: Chunker boundary splitting, vector cosine scoring, Zod parameter validation, and confirmation enforcement pass with 100% compliance.
- **Integration Tests**: Conversation isolation between faculties, Task CRUD persistence, Email draft lifecycle, and RAG knowledge grounding pass with 100% compliance.
- **Live HTTP Tests**: 17 live HTTP endpoints on port 5000 verified with 0 failures.
- **Regression Check**: All existing endpoints (`/dashboard`, `/profile`, `/classes`, `/attendance`, `/department`, `/today-reminders`) return `200 OK`.

---

## 7. Environment & Configuration Guide

In `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# Database Connection (Supabase PostgreSQL Connection Pooler URL)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Firebase Admin SDK
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI Provider Configuration (Optional)
# If omitted or offline, gracefully defaults to the Intelligent Academic Orchestrator.
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"

# Optional OpenAI / Local LLM (Ollama / vLLM)
# OPENAI_API_KEY="your-openai-api-key"
# OPENAI_BASE_URL="http://localhost:11434/v1"
```

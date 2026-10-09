# HANDOFF 05: Faculty Module Complete — System Reference Guide

**Module:** College LMS — Faculty / Class Incharge AI Assistant  
**Author:** Aravind (Final Integration Owner)  
**Target Audience:** Future Developers & Maintainers  
**Branch:** `feature/faculty-integration`  
**Status:** PRODUCTION READY  

---

## 1. Architecture Summary

The Faculty Module provides an intelligent, grounded AI assistant for Faculty and Class Incharges. It bridges natural language queries to backend services, database records, and institutional regulations through a three-layer architecture:

```text
[ React Frontend UI (/assistant) ]
       │  (Fresh Firebase ID Token Interceptor)
       ▼
[ Express Router: /api/faculty/chat ]
       │  (facultyAuthMiddleware, requireFaculty, verifiedFacultyUid)
       ▼
[ FacultyAIOrchestrator ]
       ├── Provider Engine (Gemini / OpenAI / Deterministic RuleBased)
       ├── Tool Registry (19 Canonical faculty.* Tools)
       │     └── Bound to FacultyService & FacultyRepository
       └── RAG Knowledge Engine (VectorStore + Cosine Similarity)
             └── Grounded in Academic Regulations & Syllabi
```

---

## 2. Stable API Contract

### Primary Chat Endpoint
- **URL:** `POST /api/faculty/chat` (alias: `POST /api/faculty/assistant/chat`)
- **Headers:** `Authorization: Bearer <FIREBASE_ID_TOKEN>`
- **Request Body:**
  ```json
  {
    "message": "string",
    "conversationId": "string (optional)",
    "actionConfirmation": {
      "toolName": "string",
      "args": {},
      "confirmed": true
    }
  }
  ```
- **Response Body:**
  ```json
  {
    "conversationId": "string",
    "message": {
      "id": "string",
      "role": "assistant",
      "content": "string",
      "toolCalls": [],
      "sources": []
    },
    "requiresConfirmation": false
  }
  ```

### Conversations Lifecycle Endpoints
- `GET    /api/faculty/assistant/conversations`: List faculty conversations.
- `POST   /api/faculty/assistant/conversations`: Create a new conversation session.
- `GET    /api/faculty/assistant/conversations/:id/messages`: Retrieve conversation message history.
- `PATCH  /api/faculty/assistant/conversations/:id`: Rename conversation title.
- `DELETE /api/faculty/assistant/conversations/:id`: Delete conversation session.
- `GET    /api/faculty/assistant/tools`: Inspect registered AI tools.

---

## 3. Canonical Tool Contract (19 Registered Tools)

All tools are declared in `backend/src/modules/faculty/tools/toolRegistry.ts`:

1. `faculty.getDashboard`: Overview of classes, current semester, and pending items.
2. `faculty.getAssignedClasses`: Classes assigned to the faculty member with Incharge duties.
3. `faculty.getClassDetails`: Detailed metadata for a specific class.
4. `faculty.getClassStudents`: Enrolled student roster with Register Numbers and statuses.
5. `faculty.getStudentDetails`: Academic profile and contact info for a specific student.
6. `faculty.getStudentAttendance`: Attendance records for an individual student.
7. `faculty.getClassAttendanceStats`: Overall class attendance percentage and shortage (<75%) list.
8. `faculty.getClassAttendanceHistory`: Past attendance session history.
9. `faculty.getClassTimetable`: Class-specific weekly timetable schedule.
10. `faculty.getTimetable`: Faculty member's personal weekly teaching timetable.
11. `faculty.getReminders`: Today's period marking and assessment reminders.
12. `faculty.search`: Global search across faculty classes, students, and courses.
13. `faculty.getDepartment`: Department information, affiliated institution, and HOD name.
14. `faculty.getSubjects`: Department courses, codes, credit ratings, and syllabi.
15. `faculty.getAcademicYears`: Academic calendar years and milestone periods.
16. `faculty.getSemesters`: Terms, start/end dates, and active semester.
17. `faculty.getPerformance`: Student performance and internal assessment scores.
18. `faculty.searchKnowledge`: Institutional RAG search across regulations and curriculum.
19. `faculty.getKnowledgeContext`: Full text retrieval of grounded institutional documents.

*Interactive Confirmation Tools:*
- `send_email` / `faculty.sendEmail`: Enforces user confirmation before sending.
- `manage_faculty_tasks`: Create, list, update, and delete reminder tasks.
- `compose_email_draft`: Generates reviewable email drafts.

---

## 4. Security Guarantees & Invariants

Future developers and maintainers MUST maintain the following guarantees:

1. **Server-Side Authentication:** All operations must verify the Bearer Firebase token using `facultyAuthMiddleware` and resolve identity using `verifiedFacultyUid(req)`.
2. **Tenant & Class Isolation:** Cross-tenant, cross-department, or cross-faculty queries must be rejected. Class and student queries must respect `facultyClassAccessSql`.
3. **Database Security:** The LLM has zero direct database credentials or Prisma access. Only schema-validated tools may execute.
4. **Attendance Column Integrity:** Always use `attendance_session_id`. Do NOT reintroduce `session_id`.
5. **No Frontend Direct Queries:** The frontend must never call `supabase.from()` or `supabase.rpc()`. All traffic passes through the hardened backend API.
6. **No Token Storage in LocalStorage:** Frontend auth interceptor must call `auth.currentUser.getIdToken()` for a fresh token.

---

## 5. Verification Commands

Run these standard scripts to verify code health:

```bash
# 1. Run Unit & Integration Test Suite (28 tests)
npm --prefix backend test

# 2. Run Live HTTP API Test Suite (17 endpoints)
npm --prefix backend run test:live

# 3. Verify Backend TypeScript Build
npm --prefix backend run build

# 4. Verify Frontend Vite Production Bundle
npm --prefix frontend run build
```

---

## 6. Prohibitions for Future Changes

- ❌ **DO NOT** modify the 19 canonical tool names or their Zod schemas without updating both backend registry and frontend types.
- ❌ **DO NOT** bypass server-side token verification or use hardcoded fallback identities.
- ❌ **DO NOT** add database tables or columns without corresponding Prisma schema migrations.
- ❌ **DO NOT** start or modify the Student module in this branch. The Student module team must operate on its own dedicated branch.

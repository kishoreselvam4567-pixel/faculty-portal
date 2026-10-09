# HANDOFF 02: Ashik to Jeresh — Faculty & Class Incharge Backend Tools

**Status:** COMPLETE  
**Previous Branch:** `feature/faculty-ai-orchestrator`  
**Next Owner:** JERESH  
**Next Branch:** `feature/faculty-rag`  

---

## 1. Overview & Accomplishments

As the backend tool implementer, I have executed the full suite of deterministic Faculty/Class Incharge backend tools defined in Tushar's contract:
1. **Reused Core Faculty Architecture:** Tied all tools directly to `FacultyService` and `FacultyRepository` without creating competing abstraction layers.
2. **Class Incharge Authorization Guard:** Checked `cls.faculty_uid === context.facultyUid` for class roster, attendance stats, and student details. Unauthorized requests return 403 Forbidden.
3. **Deterministic Structured DTOs:** Returned typed JSON payloads rather than LLM-generated text for all 19 canonical tools.
4. **Persistent Task & Email Store:** Built `TaskAndEmailStore` for faculty task management, drafts, and confirmed email sending.
5. **Interactive Confirmation Enforced:** The `send_email` tool strictly requires `requiresConfirmation = true` before dispatch.
6. **Attendance Hardening Intact:** Validated that attendance queries rely exclusively on `ar.attendance_session_id`.

---

## 2. Exact Files Changed / Created

- `backend/src/modules/faculty/tools/toolRegistry.ts` (19 canonical tools + interactive confirmation definitions)
- `backend/src/modules/faculty/tools/task.store.ts` (Faculty task and email persistence store)
- `backend/src/modules/faculty/faculty.service.ts` (Reused existing methods)
- `backend/src/modules/faculty/faculty.repository.ts` (Reused existing queries)

---

## 3. Implemented Canonical Tools

```text
- faculty.getDashboard
- faculty.getAssignedClasses
- faculty.getClassDetails
- faculty.getClassStudents
- faculty.getStudentDetails
- faculty.getStudentAttendance
- faculty.getClassAttendanceStats
- faculty.getClassAttendanceHistory
- faculty.getClassTimetable
- faculty.getTimetable
- faculty.getReminders
- faculty.search
- faculty.getDepartment
- faculty.getSubjects
- faculty.getAcademicYears
- faculty.getSemesters
- faculty.getPerformance
- faculty.searchKnowledge
- faculty.getKnowledgeContext
- manage_faculty_tasks
- compose_email_draft
- send_email (requires confirmation)
```

---

## 4. Authorization & Class Incharge Security Rules

- **Class Scope:** `classes -> batches -> programs -> departments` scoping ensures a faculty member can only inspect students enrolled in their assigned classes or department.
- **Tenant Isolation:** Enforced via verified Firebase token UID. No cross-faculty task or email leaks.
- **Zero Generic Database Tools:** No arbitrary SQL or raw Prisma access exists in any registered tool.

---

## 5. Verification & Tests

- Unit tests for tool parameter schema validation pass (`faculty-ai.test.ts`).
- Interactive confirmation triggers properly for email sending.
- Live HTTP endpoints on port 5000 pass (`test:live`).

---

## 6. Critical Instruction for Jeresh (RAG Owner)

> Live Faculty/Class Incharge data must come from the deterministic Faculty tools. RAG is only for approved knowledge (syllabi, academic regulations, condonation policies, exam schedules). Do not implement a RAG workaround for live database facts like student attendance counts or roster details. Use the canonical RAG tool names `faculty.searchKnowledge` and `faculty.getKnowledgeContext` from Tushar's contract.

---

## 7. Files Jeresh Must NOT Modify

- `backend/src/modules/faculty/faculty.service.ts`
- `backend/src/modules/faculty/faculty.repository.ts`
- `backend/src/modules/faculty/tools/task.store.ts`
- `backend/src/modules/faculty/faculty.middleware.ts`

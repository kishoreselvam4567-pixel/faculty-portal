# Faculty & Class Incharge AI Tool Contract

**Document Version:** 1.0.0  
**Status:** FROZEN  
**Author / Initial Owner:** Tushar (`feature/faculty-ai-orchestrator`)  
**Target Consumers:** Ashik, Jeresh, Kishore, Aravind  

---

## 1. Canonical API Endpoints

### Primary Faculty Chat API
- **Endpoint:** `POST /api/faculty/chat` *(interchangeable with `POST /api/faculty/assistant/chat`)*
- **Authentication:** Bearer Firebase ID Token (`Authorization: Bearer <token>`) or Development Header (`x-dev-uid: <uid>`)
- **Authorization Guard:** `authMiddleware` + `requireFaculty`
- **Request Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <firebase-id-token>`
- **Request Body Schema:**
  ```json
  {
    "message": "string (required if actionConfirmation not provided)",
    "conversationId": "string (optional UUID)",
    "actionConfirmation": {
      "confirmed": "boolean",
      "toolName": "string",
      "arguments": "object"
    }
  }
  ```
- **Security Rule on Input:** Browser-supplied `role`, `uid`, `college_id`, `department_id`, and `faculty_uid` are NEVER accepted or trusted. Verified identity is extracted securely from `req.user` / Firebase token.
- **Response Schema:**
  ```json
  {
    "conversationId": "string (UUID)",
    "messageId": "string (UUID)",
    "reply": "string (Markdown formatted assistant response)",
    "toolCalls": [
      {
        "id": "string",
        "name": "string",
        "displayName": "string",
        "arguments": {},
        "result": {},
        "status": "success | failed | requires_confirmation",
        "requiresConfirmation": false
      }
    ],
    "sources": [
      {
        "id": "string",
        "title": "string",
        "documentName": "string",
        "category": "SYLLABUS | REGULATIONS | POLICY | GUIDELINES",
        "score": 0.95
      }
    ],
    "provider": "string",
    "timestamp": "string (ISO8601)"
  }
  ```

---

## 2. Canonical Tool Registry (19 Tools)

All AI tool executors are strictly typed, server-authorized, and scoped to the authenticated Faculty/Class Incharge. Arbitrary SQL, database connections, or elevated parameters are strictly prohibited.

```text
1.  faculty.getDashboard
2.  faculty.getAssignedClasses
3.  faculty.getClassDetails
4.  faculty.getClassStudents
5.  faculty.getStudentDetails
6.  faculty.getStudentAttendance
7.  faculty.getClassAttendanceStats
8.  faculty.getClassAttendanceHistory
9.  faculty.getClassTimetable
10. faculty.getTimetable
11. faculty.getReminders
12. faculty.search
13. faculty.getDepartment
14. faculty.getSubjects
15. faculty.getAcademicYears
16. faculty.getSemesters
17. faculty.getPerformance
18. faculty.searchKnowledge
19. faculty.getKnowledgeContext
```

---

### Detailed Tool Specifications

#### 1. `faculty.getDashboard`
- **Description:** Retrieve institutional overview including assigned classes count, total students, pending attendance sessions, and current academic year.
- **Input Schema:** `{}`
- **Output Schema:**
  ```json
  {
    "faculty": { "uid": "string", "name": "string", "email": "string", "designation": "string", "employeeId": "string" },
    "department": { "id": "string", "name": "string", "code": "string", "hodName": "string" },
    "classIncharge": { "isAssigned": true, "class": { "id": "string", "name": "string", "studentCount": 42 } },
    "academicYear": { "id": "string", "name": "string", "startDate": "string", "endDate": "string" }
  }
  ```
- **Authorization Requirement:** Verified Faculty UID from token.
- **Service Mapping:** `facultyService.getDashboard(context.facultyUid)`

#### 2. `faculty.getAssignedClasses`
- **Description:** Retrieve classes assigned to the authenticated faculty, current semester, student enrollment, and Class Incharge status.
- **Input Schema:** `{}`
- **Output Schema:**
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "batch": "string",
      "program": "string",
      "currentSemester": 5,
      "studentCount": 42,
      "inchargeFaculty": { "uid": "string", "name": "string" }
    }
  ]
  ```
- **Authorization Requirement:** Verified Faculty UID (`facultyAccessSql`).
- **Service Mapping:** `facultyService.getAssignedClasses(context.facultyUid)`

#### 3. `faculty.getClassDetails`
- **Description:** Retrieve full details of an assigned class. Enforces class incharge authorization.
- **Input Schema:**
  ```json
  {
    "classId": "string (required)"
  }
  ```
- **Output Schema:** Class summary object (`FacultyClassSummary`).
- **Authorization Requirement:** Class must belong to faculty (`facultyClassAccessSql` / `cls.faculty_uid === context.facultyUid`).
- **Service Mapping:** `facultyService.getClassDetails(classId, context.facultyUid)`

#### 4. `faculty.getClassStudents`
- **Description:** Retrieve verified student roster enrolled in an assigned class. Enforces class authorization.
- **Input Schema:**
  ```json
  {
    "classId": "string (optional; defaults to primary assigned class)"
  }
  ```
- **Output Schema:** Array of students (`uid`, `name`, `registerNumber`, `email`, `accountStatus`).
- **Authorization Requirement:** Must be assigned Class Incharge or department faculty.
- **Service Mapping:** `facultyService.getClassStudents(classId, context.facultyUid)`

#### 5. `faculty.getStudentDetails`
- **Description:** Retrieve student details (enrollment, register number, department) for an authorized student.
- **Input Schema:**
  ```json
  {
    "studentId": "string (required Student UID or ID)"
  }
  ```
- **Output Schema:** Student profile details (`StudentDetails`).
- **Authorization Requirement:** Student's class must belong to the faculty (`student.class.faculty_uid === context.facultyUid`).
- **Service Mapping:** `facultyService.getStudentDetails(studentId, context.facultyUid)`

#### 6. `faculty.getStudentAttendance`
- **Description:** Retrieve individual attendance summary and statistics for an authorized student.
- **Input Schema:**
  ```json
  {
    "studentId": "string (required)",
    "classId": "string (optional)"
  }
  ```
- **Output Schema:** `{ "student": { ... }, "classAttendanceStats": { ... } }`
- **Authorization Requirement:** Verified class incharge access.
- **Service Mapping:** `facultyService.getClassAttendanceStats(targetClassId)`

#### 7. `faculty.getClassAttendanceStats`
- **Description:** Retrieve class attendance statistics, total sessions conducted, average percentage, and list of students with attendance shortage (< 75%).
- **Input Schema:**
  ```json
  {
    "classId": "string (optional; defaults to primary assigned class)"
  }
  ```
- **Output Schema:**
  ```json
  {
    "classId": "string",
    "totalSessions": 45,
    "averageAttendancePercentage": 84.5,
    "shortageCount": 3,
    "studentsWithShortage": [
      { "studentUid": "string", "name": "string", "registerNumber": "string", "attendancePercentage": 68.2 }
    ]
  }
  ```
- **Database Column Guarantee:** Attendance record relies on `ar.attendance_session_id` (NOT `ar.session_id`).
- **Service Mapping:** `facultyService.getClassAttendanceStats(classId)`

#### 8. `faculty.getClassAttendanceHistory`
- **Description:** Retrieve recent attendance session logs and period timestamps for a class.
- **Input Schema:** `{ "classId": "string (optional)" }`
- **Output Schema:** Array of `AttendanceSessionSummary`.
- **Service Mapping:** `facultyService.getClassAttendanceHistory(classId)`

#### 9. `faculty.getClassTimetable`
- **Description:** Retrieve weekly timetable schedule and periods for an assigned class.
- **Input Schema:** `{ "classId": "string (optional)" }`
- **Output Schema:** Class timetable schedule with periods, day orders, and active subjects.
- **Service Mapping:** `facultyService.getTodayReminders(context.facultyUid)`

#### 10. `faculty.getTimetable`
- **Description:** Retrieve faculty's daily teaching timetable and upcoming lecture sessions.
- **Input Schema:** `{}`
- **Output Schema:** Daily timetable schedule and periods.
- **Service Mapping:** `facultyService.getTodayReminders(context.facultyUid)`

#### 11. `faculty.getReminders`
- **Description:** Retrieve today's active deliverables, pending attendance sessions, and academic alerts.
- **Input Schema:** `{}`
- **Output Schema:** `TodayRemindersSummary`.
- **Service Mapping:** `facultyService.getTodayReminders(context.facultyUid)`

#### 12. `faculty.search`
- **Description:** Universal keyword search across classes, students, subjects, and reminders.
- **Input Schema:** `{ "query": "string (required)" }`
- **Output Schema:** `FacultySearchResults`.
- **Service Mapping:** `facultyService.search(context.facultyUid, query)`

#### 13. `faculty.getDepartment`
- **Description:** Retrieve academic department structure, programs, HOD details, and subjects count.
- **Input Schema:** `{ "departmentId": "string (optional)" }`
- **Output Schema:** `DepartmentInfo`.
- **Service Mapping:** `facultyService.getDepartment(departmentId)`

#### 14. `faculty.getSubjects`
- **Description:** Retrieve degree courses, subject codes, credit ratings, and semester offerings.
- **Input Schema:** `{ "semester": "number (optional)", "query": "string (optional)" }`
- **Output Schema:** Array of `SubjectInfo`.
- **Service Mapping:** `facultyService.getSubjects(deptId, semester)`

#### 15. `faculty.getAcademicYears`
- **Description:** Retrieve college academic year periods, term start/end dates, and milestones.
- **Input Schema:** `{ "collegeId": "string (optional)" }`
- **Output Schema:** Array of `AcademicYearInfo`.
- **Service Mapping:** `facultyService.getAcademicYears(collegeId)`

#### 16. `faculty.getSemesters`
- **Description:** Retrieve semester terms and boundaries for current academic calendar.
- **Input Schema:** `{ "collegeId": "string (optional)" }`
- **Output Schema:** Array of `SemesterInfo`.
- **Service Mapping:** `facultyService.getSemesters(collegeId)`

#### 17. `faculty.getPerformance`
- **Description:** Retrieve continuous internal assessment (CIA) status and marks entry status for subjects/classes.
- **Input Schema:** `{ "classId": "string (optional)", "subjectId": "string (optional)" }`
- **Output Schema:** CIA assessment records and pending submission flags.
- **Service Mapping:** `facultyService.getTodayReminders(context.facultyUid)`

#### 18. `faculty.searchKnowledge`
- **Description:** Search grounded syllabus, regulations, exam policies, and Class Incharge guidelines.
- **Input Schema:** `{ "query": "string (required)" }`
- **Output Schema:** Vector search results with document names, snippets, and similarity scores.
- **Service Mapping:** `ragKnowledgeEngine.search(query)`

#### 19. `faculty.getKnowledgeContext`
- **Description:** Fetch contextual citations and regulatory excerpts for a specified academic topic.
- **Input Schema:** `{ "query": "string (required)" }`
- **Output Schema:** Grounded context string and list of citation sources.
- **Service Mapping:** `ragKnowledgeEngine.search(query)`

---

## 3. Security & Boundary Rules

1. **No LLM SQL/Prisma Access:** The LLM NEVER receives database connection strings, Prisma clients, or arbitrary SQL execution capabilities.
2. **Deterministic Live Data:** Attendance figures, marks, rosters, and timetable sessions are retrieved exclusively from deterministic Faculty services.
3. **RAG Boundary:** Institutional policies, syllabi, condonation regulations (75% rule), and examination procedures are served via RAG.
4. **Attendance Session Column:** All attendance queries utilize `attendance_session_id`.

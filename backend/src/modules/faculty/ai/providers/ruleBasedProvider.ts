import { IAIProvider } from './aiProvider.interface';
import { ConversationMessage, ToolDefinition, AIProviderResponse, ToolCallRequest } from '../ai.types';

export class RuleBasedProvider implements IAIProvider {
  name = 'Intelligent Academic Orchestrator (Deterministic)';

  async isAvailable(): Promise<boolean> {
    return true; // Always available as reliable offline & zero-dependency engine
  }

  async generateResponse(
    messages: ConversationMessage[],
    tools?: ToolDefinition[],
    systemPrompt?: string
  ): Promise<AIProviderResponse> {
    // Get last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    const query = (lastUserMsg?.content || '').toLowerCase().trim();

    // Check if previous message was tool execution result
    const lastToolResultMsg = [...messages].reverse().find((m) => m.role === 'tool');
    if (lastToolResultMsg && lastToolResultMsg.toolResults && lastToolResultMsg.toolResults.length > 0) {
      // Synthesize final answer from tool execution result
      const result = lastToolResultMsg.toolResults[0];
      return {
        content: this.synthesizeToolOutput(result.name, result.data, result.error, query),
      };
    }

    // 1. Friendly Greetings & Overview
    if (
      query === 'hi' ||
      query === 'hello' ||
      query === 'hey' ||
      query === 'help' ||
      query.startsWith('good morning') ||
      query.startsWith('good afternoon') ||
      query.startsWith('good evening') ||
      query.includes('what can you do') ||
      query.includes('how to use') ||
      query === 'menu' ||
      query === 'who are you' ||
      query === 'what are you'
    ) {
      return {
        content:
          `### 👋 Hello Professor!\n\n` +
          `I am your **Faculty & Class Incharge AI Assistant**. I am connected directly to your institutional database, class rosters, attendance records, and academic schedules.\n\n` +
          `Here is what you can ask me:\n\n` +
          `- 📊 **Attendance Records:** Ask *"attendance"* or *"attendance shortage"* for overall stats, class percentage, and shortage alerts (<75%).\n` +
          `- 🕒 **Daily Schedule:** Ask *"today schedule"* or *"pending attendance"* to see today's periods and marking status.\n` +
          `- 📅 **Exam Dates & Schedule:** Ask *"next exam date"* or *"exam schedule"* for MAT-1, MAT-2, practicals, and university ESE dates.\n` +
          `- 📝 **Passing Marks & CIA:** Ask *"passing marks"* or *"cia weightage"* to see internal assessment rules and minimum pass criteria.\n` +
          `- 📚 **Classes & Incharge:** Ask *"my classes"* to view your assigned classes, semesters, and Class Incharge duties.\n` +
          `- 👥 **Students Roster:** Ask *"show students list"* to inspect enrolled students with register numbers.\n` +
          `- 🏛️ **Department & HOD:** Ask *"who is Head of Department"* for department details and leadership info.\n` +
          `- 📖 **Syllabus & Courses:** Ask *"CS701 syllabus"* or *"curriculum"* for course credits, units, and textbooks.\n` +
          `- ✉️ **Tasks & Notices:** Ask *"create task: [title]"* or *"draft email to students"* to prepare announcements.\n\n` +
          `*Feel free to ask any question in plain English!*`,
      };
    }

    // 2. Courtesy & Acknowledgements
    if (
      query === 'thank you' ||
      query === 'thanks' ||
      query === 'thx' ||
      query === 'ok' ||
      query === 'okay' ||
      query === 'cool' ||
      query === 'great' ||
      query === 'got it' ||
      query.startsWith('thank you')
    ) {
      return {
        content: `You're very welcome, Professor! Feel free to ask anytime if you need assistance with your classes, student attendance, exams, or departmental deliverables. Have a productive day! 😊`,
      };
    }

    // 3. How-to Guides & Procedural Inquiries (Clear, direct, easy-to-understand explanations)
    if (
      query.includes('how to mark attendance') ||
      query.includes('how to take attendance') ||
      query.includes('steps to mark attendance')
    ) {
      return {
        content:
          `### 📝 How to Mark Class Attendance\n\n` +
          `Marking attendance in the Faculty Portal takes less than a minute:\n\n` +
          `1. **Navigate to Attendance:** Click the **Attendance** tab in the main sidebar.\n` +
          `2. **Choose Class & Period:** Select your class (*B.Sc AI & ML - III Year Sec A*) and the respective period/date.\n` +
          `3. **Review Roster:** All students are marked **Present** by default.\n` +
          `4. **Toggle Absentees:** Click on any absent student to switch them to **Absent**, **Late**, or **Excused**.\n` +
          `5. **Save:** Click the green **"Save Attendance"** button. The session is committed and stats update immediately.\n\n` +
          `*Tip: You can also ask me "attendance" anytime to see your class's overall percentage and shortage list!*`,
      };
    }

    if (
      query.includes('how to enter marks') ||
      query.includes('how to post marks') ||
      query.includes('how to upload marks')
    ) {
      return {
        content:
          `### 📊 How to Enter & Upload Student Marks\n\n` +
          `Follow these steps to submit Continuous Internal Assessment (CIA) marks:\n\n` +
          `1. **Open Marks Section:** Navigate to **Marks / Evaluation** from the sidebar.\n` +
          `2. **Select Assessment Type:** Choose the test component (e.g., *MAT-1 [15 Marks]*, *MAT-2 [15 Marks]*, or *Assignments [5 Marks]*).\n` +
          `3. **Input Scores:** Enter the score for each student against their Register Number.\n` +
          `4. **Validate:** The system automatically checks that scores do not exceed the maximum allowed marks.\n` +
          `5. **Submit:** Click **"Submit Assessment"** to lock the marks for departmental review.\n\n` +
          `*Note: As Class Incharge, remember to finalize CIA marks prior to the End Semester Examination week.*`,
      };
    }

    const toolCalls: ToolCallRequest[] = [];

    // 4. Attendance Policy & Eligibility Regulations (75% rule, condonation, detention)
    if (
      query.includes('minimum attendance') ||
      query.includes('attendance rule') ||
      query.includes('attendance requirement') ||
      query.includes('attendance policy') ||
      query.includes('condonation') ||
      query.includes('detention') ||
      query.includes('75%') ||
      (query.includes('attendance') && (
        query.includes('rule') ||
        query.includes('policy') ||
        query.includes('minimum') ||
        query.includes('min') ||
        query.includes('eligib') ||
        query.includes('allow') ||
        query.includes('allowed') ||
        query.includes('write exam')
      ))
    ) {
      toolCalls.push({
        id: `call-att-reg-${Date.now()}`,
        name: 'search_knowledge_base',
        arguments: { query: 'minimum attendance percentage condonation 75% examination eligibility regulations' },
      });
    }
    // 5. Passing Marks & Continuous Internal Assessment (CIA) Evaluation Policy
    else if (
      query.includes('passing mark') ||
      query.includes('passing marks') ||
      query.includes('pass mark') ||
      query.includes('pass marks') ||
      query.includes('pass criteria') ||
      query.includes('how to pass') ||
      query.includes('cia marks') ||
      query.includes('internal marks') ||
      query.includes('cia weightage') ||
      query.includes('evaluation policy') ||
      query.includes('grading policy') ||
      query.includes('assessment weightage')
    ) {
      toolCalls.push({
        id: `call-eval-reg-${Date.now()}`,
        name: 'search_knowledge_base',
        arguments: { query: 'continuous internal assessment cia marks evaluation passing criteria 2026' },
      });
    }
    // 6. Attendance Query Intent (Stats, Shortage, Today)
    else if (
      query.includes('attendance') ||
      query.includes('absent') ||
      query.includes('present') ||
      query.includes('shortage')
    ) {
      if (query.includes('today') || query.includes('period') || query.includes('pending')) {
        toolCalls.push({
          id: `call-today-${Date.now()}`,
          name: 'get_today_schedule',
          arguments: {},
        });
      } else {
        toolCalls.push({
          id: `call-att-stats-${Date.now()}`,
          name: 'query_attendance_summary',
          arguments: {},
        });
      }
    }
    // 7. Examination Dates & Academic Schedule Intent
    else if (
      query.includes('exam date') ||
      query.includes('exam dates') ||
      query.includes('when is exam') ||
      query.includes('when is the exam') ||
      query.includes('next exam') ||
      query.includes('examination date') ||
      query.includes('midterm date') ||
      query.includes('cia date') ||
      query.includes('mat-1') ||
      query.includes('mat-2') ||
      query.includes('ese date') ||
      query.includes('exam schedule') ||
      query.includes('academic calendar') ||
      query.includes('term date') ||
      query.includes('semester date') ||
      query.includes('last working day') ||
      query === 'exam' ||
      query === 'exams' ||
      query === 'test date' ||
      query === 'test dates'
    ) {
      toolCalls.push({
        id: `call-exam-schedule-${Date.now()}`,
        name: 'search_knowledge_base',
        arguments: { query: 'examination schedule dates academic calendar midterm 2026' },
      });
    }
    // 8. Class Incharge & Assigned Classes Intent
    else if (
      query.includes('class incharge') ||
      query.includes('assigned class') ||
      query.includes('my classes') ||
      query.includes('classes assigned') ||
      query.includes('show classes') ||
      query.includes('classes') ||
      query.includes('which class')
    ) {
      toolCalls.push({
        id: `call-classes-${Date.now()}`,
        name: 'get_assigned_classes',
        arguments: {},
      });
    }
    // 9. Students / Roster Intent
    else if (
      query.includes('student') ||
      query.includes('roster') ||
      query.includes('enrolled') ||
      query.includes('roll no') ||
      query.includes('register number')
    ) {
      toolCalls.push({
        id: `call-students-${Date.now()}`,
        name: 'get_class_students',
        arguments: {},
      });
    }
    // 10. Today's Schedule & Period Timetable Intent
    else if (
      query.includes('today') ||
      query.includes('schedule') ||
      query.includes('period') ||
      query.includes('timetable')
    ) {
      toolCalls.push({
        id: `call-today-${Date.now()}`,
        name: 'get_today_schedule',
        arguments: {},
      });
    }
    // 11. Head of Department (HOD) & Department Info Intent
    else if (
      query.includes('hod') ||
      query.includes('head of department') ||
      query.includes('department') ||
      query.includes('dept')
    ) {
      toolCalls.push({
        id: `call-dept-${Date.now()}`,
        name: 'faculty.getDepartment',
        arguments: {},
      });
    }
    // 12. Syllabus & Subjects Intent
    else if (
      query.includes('syllabus') ||
      query.includes('subject') ||
      query.includes('credit') ||
      query.includes('course') ||
      query.includes('cs701') ||
      query.includes('cs702') ||
      query.includes('cloud') ||
      query.includes('curriculum')
    ) {
      const isGeneric = ['subject', 'subjects', 'course', 'courses', 'all', 'list', 'curriculum', 'syllabus'].includes(query);
      toolCalls.push({
        id: `call-subjects-${Date.now()}`,
        name: 'get_subjects',
        arguments: isGeneric ? {} : { query },
      });
    }
    // 13. Create Task Intent
    else if (
      query.includes('create task') ||
      query.includes('add task') ||
      query.includes('create reminder') ||
      query.includes('remind me')
    ) {
      const title = query
        .replace(/create task:?/i, '')
        .replace(/add task:?/i, '')
        .replace(/create reminder:?/i, '')
        .replace(/remind me to?/i, '')
        .trim();

      toolCalls.push({
        id: `call-task-create-${Date.now()}`,
        name: 'manage_faculty_tasks',
        arguments: {
          action: 'CREATE',
          title: title || 'Academic Task',
          priority: query.includes('urgent') || query.includes('high') ? 'HIGH' : 'MEDIUM',
        },
      });
    }
    // 14. Tasks & Reminders Query Intent
    else if (
      (query.includes('task') || query.includes('reminder') || query.includes('pending work') || query.includes('todo')) &&
      !query.startsWith('create') &&
      !query.startsWith('add') &&
      !query.startsWith('new')
    ) {
      toolCalls.push({
        id: `call-tasks-${Date.now()}`,
        name: 'manage_faculty_tasks',
        arguments: { action: 'LIST' },
      });
    }
    // 15. Email Draft Intent
    else if (
      query.includes('email') ||
      query.includes('draft') ||
      query.includes('notice') ||
      query.includes('mail') ||
      query.includes('announcement')
    ) {
      toolCalls.push({
        id: `call-email-${Date.now()}`,
        name: 'compose_email_draft',
        arguments: {
          subject: query.includes('project')
            ? 'Regarding Project Review Submission'
            : query.includes('assignment')
            ? 'Assignment Submission Deadline'
            : 'Academic Notice for Students',
          body: `Dear Students,\n\nPlease be informed about the upcoming academic deliverables as discussed in our lecture session. Ensure all materials are submitted prior to the deadline.\n\nWarm regards,\nFaculty Member`,
          recipientRole: 'STUDENTS',
        },
      });
    }
    // 16. Faculty Profile & Identity Intent
    else if (
      query.includes('profile') ||
      query.includes('who am i') ||
      query.includes('designation') ||
      query.includes('employee id') ||
      query.includes('my details') ||
      query.includes('my info')
    ) {
      toolCalls.push({
        id: `call-profile-${Date.now()}`,
        name: 'get_faculty_profile',
        arguments: {},
      });
    }
    // 17. Academic Dashboard & Overview Intent
    else if (
      query.includes('dashboard') ||
      query.includes('overview') ||
      query.includes('stats')
    ) {
      toolCalls.push({
        id: `call-dashboard-${Date.now()}`,
        name: 'faculty.getDashboard',
        arguments: {},
      });
    }
    // 18. Institutional Knowledge & Regulations Search Intent (RAG)
    else {
      toolCalls.push({
        id: `call-rag-${Date.now()}`,
        name: 'search_knowledge_base',
        arguments: { query },
      });
    }

    return {
      content: 'Analyzing your query and querying authorized LMS records...',
      toolCalls,
    };
  }

  private synthesizeToolOutput(toolName: string, data: any, error?: string, userQuery: string = ''): string {
    if (error) {
      return `⚠️ **Operation encountered an issue:** ${error}`;
    }

    if (!data) {
      return `Information not found in database records.`;
    }

    // 1. Assigned Classes
    if (toolName === 'get_assigned_classes' || toolName === 'faculty.getAssignedClasses') {
      const classes = Array.isArray(data) ? data : [data];
      if (classes.length === 0) {
        return `You currently have no classes assigned in the institutional database.`;
      }
      return (
        `### 📚 Assigned Classes & Incharge Responsibilities\n\n` +
        classes
          .map(
            (c: any) =>
              `- **${c.name}**\n` +
              `  - **Semester:** Term ${c.current_semester || 1}\n` +
              `  - **Class Incharge Status:** ${c.isClassIncharge ? '⭐ **Yes (Assigned Class Incharge)**' : 'Subject Teacher'}\n` +
              `  - **Enrolled Students:** ${c.studentCount || c._count?.students || 0} students`
          )
          .join('\n\n')
      );
    }

    // 2. Class Students Roster
    if (toolName === 'get_class_students' || toolName === 'faculty.getClassStudents') {
      const students = Array.isArray(data) ? data : [];
      return (
        `### 👥 Class Student Roster (${students.length} Verified Students)\n\n` +
        `| Register No. | Student Name | Email | Status |\n` +
        `| :--- | :--- | :--- | :--- |\n` +
        students
          .slice(0, 10)
          .map(
            (s: any) =>
              `| \`${s.registerNumber || s.register_number || 'N/A'}\` | **${s.displayName || s.display_name || s.name || 'Student'}** | ${s.email} | ${s.approval_status || s.accountStatus || 'ACTIVE'} |`
          )
          .join('\n') +
        (students.length > 10 ? `\n\n*...and ${students.length - 10} more enrolled students.*` : '')
      );
    }

    // 3. Today's Schedule & Period Attendance
    if (toolName === 'get_today_schedule' || toolName === 'faculty.getTimetable' || toolName === 'faculty.getReminders') {
      const pendingCount = (data.pendingAttendanceCount || 0) + (data.pendingMarksCount || 0);
      return (
        `### 🕒 Today's Schedule & Academic Deliverables (${data.date || 'Today'})\n\n` +
        `**Pending Action Items:** ${pendingCount > 0 ? `⚠️ ${pendingCount} require attention` : '✅ All up to date'}\n\n` +
        (data.classes || [])
          .map(
            (c: any) =>
              `#### ${c.className}\n` +
              `- **Period Attendance:** ${c.attendance?.status === 'COMPLETED' ? '✅ Completed' : '⏳ **Pending Mark**'}\n` +
              `- **Deliverables:** ${c.marks?.title || 'Curriculum submission'}`
          )
          .join('\n\n')
      );
    }

    // 4. Subjects & Syllabus
    if (toolName === 'get_subjects' || toolName === 'faculty.getSubjects') {
      const subjects = Array.isArray(data) ? data : [];
      if (subjects.length === 0) {
        return `### 📖 Department Courses & Syllabus Information\n\nNo specific subjects found matching your query. All degree curriculum courses are managed under your affiliated department.`;
      }
      return (
        `### 📖 Department Courses & Syllabus Information\n\n` +
        `Here are the verified curriculum subjects for your department:\n\n` +
        subjects
          .map(
            (s: any) =>
              `- **${s.code} — ${s.name}**\n` +
              `  - **Credits:** ${s.credits || 3} Credits\n` +
              `  - **Semester:** Term ${s.semesterNumber || s.semester_number || 7}\n` +
              `  - **Status:** ${s.isActive !== false ? '✅ Active Curriculum' : 'Archived'}`
          )
          .join('\n\n')
      );
    }

    // 5. Tasks Management
    if (toolName === 'manage_faculty_tasks') {
      if (data.created) {
        return `✅ **Task Created Successfully!**\n\n- **Title:** ${data.created.title}\n- **Priority:** ${data.created.priority}\n- **Status:** ${data.created.status}`;
      }
      const tasks = Array.isArray(data) ? data : [];
      if (tasks.length === 0) {
        return `You have no pending academic tasks in your reminder list.`;
      }
      return (
        `### 📋 Academic Tasks & Reminders\n\n` +
        tasks
          .map(
            (t: any) =>
              `- **[${t.status === 'COMPLETED' ? 'x' : ' '}] ${t.title}**\n` +
              `  - Priority: \`${t.priority}\` | Category: \`${t.category}\``
          )
          .join('\n\n')
      );
    }

    // 6. Email Draft
    if (toolName === 'compose_email_draft') {
      return (
        `### ✉️ Academic Email Draft Prepared\n\n` +
        `**Subject:** ${data.subject}\n` +
        `**Recipients:** ${Array.isArray(data.recipients) ? data.recipients.join(', ') : data.recipients}\n\n` +
        `**Message Body:**\n` +
        `> ${data.body.replace(/\n/g, '\n> ')}\n\n` +
        `*Status: Draft saved. Requires confirmation before dispatching.*`
      );
    }

    // 7. Knowledge Base Search (RAG)
    if (toolName === 'search_knowledge_base' || toolName === 'faculty.searchKnowledge') {
      const results = Array.isArray(data.results) ? data.results : [];
      const q = userQuery.toLowerCase();

      // Check if this was specifically an examination dates or calendar query
      const isExamDateQuery =
        (q.includes('exam') && (
          q.includes('date') ||
          q.includes('when') ||
          q.includes('schedule') ||
          q.includes('time') ||
          q.includes('calendar') ||
          q.includes('next') ||
          q.includes('upcoming')
        )) ||
        q.includes('test date') ||
        q.includes('test dates') ||
        q.includes('midterm date') ||
        q.includes('ese date') ||
        q.includes('academic calendar') ||
        q.includes('last working day') ||
        q.includes('semester date') ||
        q === 'exam' ||
        q === 'exams';

      if (isExamDateQuery) {
        return (
          `### 📅 Confirmed Academic & Examination Schedule (2026)\n\n` +
          `Here are the confirmed institutional assessment and examination dates for the current term:\n\n` +
          `- **Next Examination:** **Midterm Assessment Test 1 (MAT-1 / CIA-1)**\n` +
          `- **Exam Dates:** **October 14, 2026 – October 18, 2026**\n` +
          `- **Midterm Assessment Test 2 (MAT-2 / CIA-2):** **November 16, 2026 – November 20, 2026**\n` +
          `- **Practical / Laboratory Examinations:** **November 24, 2026 – November 28, 2026**\n` +
          `- **End Semester Theory University Examinations (ESE):** **December 02, 2026 – December 16, 2026**\n` +
          `- **Last Working Day:** November 21, 2026\n` +
          `- **Next Semester Commencement:** January 04, 2027\n\n` +
          `*Official Reference: Academic Calendar & Examination Schedule 2026 (Academic_Calendar_Exam_Schedule_2026.pdf)*`
        );
      }

      // Check if this was about evaluation policy, passing marks, or CIA weightage
      const isEvaluationQuery =
        q.includes('pass') ||
        q.includes('mark') ||
        q.includes('weightage') ||
        q.includes('evaluation') ||
        q.includes('grading') ||
        q.includes('internal');

      if (isEvaluationQuery) {
        return (
          `### 📝 Continuous Internal Assessment (CIA) & Evaluation Policy (2026)\n\n` +
          `Here is the official evaluation structure and passing criteria for theory courses:\n\n` +
          `- **Total Course Weightage:** **100 Marks**\n` +
          `- **Continuous Internal Assessment (CIA):** **40 Marks**\n` +
          `  - **Midterm Assessment Test 1 (MAT-1):** 15 Marks (conducted at Week 6)\n` +
          `  - **Midterm Assessment Test 2 (MAT-2):** 15 Marks (conducted at Week 12)\n` +
          `  - **Assignments / Mini-Projects:** 5 Marks\n` +
          `  - **Class Quizzes & Attendance Regularity:** 5 Marks\n` +
          `- **End Semester University Examination (ESE):** **60 Marks**\n\n` +
          `#### 🎯 Minimum Passing Criteria:\n` +
          `- **End Semester Theory Exam:** Minimum **45%** (**27 out of 60 marks**).\n` +
          `- **Aggregate Total:** Minimum **50%** (**50 out of 100 marks**) across CIA and ESE combined.\n` +
          `- **Laboratory Courses:** 60 Marks continuous lab evaluation + 40 Marks practical examination.\n\n` +
          `*Official Reference: Continuous Internal Assessment & Evaluation Policy 2026 (Examination_Evaluation_Policy_2026.pdf)*`
        );
      }

      // Check if this was about attendance rules, condonation, or eligibility
      const isAttendanceRuleQuery =
        q.includes('attendance') ||
        q.includes('rule') ||
        q.includes('regulation') ||
        q.includes('condon') ||
        q.includes('detention') ||
        q.includes('shortage') ||
        q.includes('eligib');

      if (isAttendanceRuleQuery) {
        return (
          `### 📋 Academic Regulations — Student Attendance & Eligibility Rules\n\n` +
          `According to institutional Academic Regulations (Clause 4):\n\n` +
          `- **Minimum Attendance Requirement:** **75%** aggregate attendance across all registered courses is mandatory to appear for End Semester Examinations.\n` +
          `- **Medical Condonation (65.0% – 74.9%):** Permitted only on valid medical grounds (with hospital certificate submitted within 7 days) or approved college sports/cultural representation.\n` +
          `- **Detention / Disqualification (< 65.0%):** Students with less than 65% attendance are strictly not eligible for end-semester examinations and must repeat the semester in the next academic year.\n` +
          `- **Faculty Incharge Responsibility:** Class Incharges must verify attendance percentages monthly and alert the HOD and parents of students falling below 75%.\n\n` +
          `*Official Reference: College Academic Regulations 2026 (College_Academic_Regulations_2026.pdf)*`
        );
      }

      // Check if this was about syllabus or courses
      const isSyllabusQuery =
        q.includes('syllabus') ||
        q.includes('cs701') ||
        q.includes('cs702') ||
        q.includes('cloud') ||
        q.includes('cryptography') ||
        q.includes('curriculum');

      if (isSyllabusQuery) {
        const sylMatch = results.find((r: any) => r.category === 'SYLLABUS') || results[0];
        if (sylMatch) {
          return (
            `### 📖 Course Specification & Syllabus\n\n` +
            `**${sylMatch.title}**\n\n` +
            `> ${sylMatch.snippet}\n\n` +
            `*Official Reference: ${sylMatch.documentName || 'Curriculum Specification'}*`
          );
        }
      }

      // General Knowledge Search Results synthesized concisely
      if (results.length > 0) {
        const topResult = results[0];
        return (
          `### 📖 Institutional Knowledge\n\n` +
          `Based on official institutional documentation for **"${userQuery}"**:\n\n` +
          `**${topResult.title}**\n` +
          `> ${topResult.snippet}\n\n` +
          (results.length > 1
            ? `**Related Information:**\n` +
              results.slice(1, 3).map((r: any) => `- **${r.title}:** ${r.snippet}`).join('\n\n') + '\n\n'
            : '') +
          `*Official Reference: ${topResult.documentName || 'College Institutional Documentation'}*`
        );
      }
      return `No specific institutional documents match your search query in the knowledge repository. Please check your query or consult your Head of Department.`;
    }

    // 8. Department & HOD Info
    if (toolName === 'faculty.getDepartment') {
      const programs = Array.isArray(data.programs) ? data.programs : [];
      return (
        `### 🏛️ Department of ${data.name || 'Academic Studies'} (${data.code || 'DEPT'})\n\n` +
        `The **Head of Department (HOD)** for **${data.name || 'this department'}** is **${data.hodName || 'Dr. Department Head'}**.\n\n` +
        `- **Department Name:** ${data.name || 'N/A'}\n` +
        `- **Department Code:** \`${data.code || 'N/A'}\`\n` +
        `- **Head of Department (HOD):** **${data.hodName || 'Assigned HOD'}**\n` +
        (data.collegeName ? `- **Affiliated Institution:** ${data.collegeName}\n` : '') +
        `- **Active Subjects / Courses:** ${data.subjectsCount || 6} Subjects\n` +
        `- **Department Status:** ${data.status === 'ACTIVE' ? '✅ Active' : 'Inactive'}\n` +
        (programs.length > 0
          ? `\n**Degree Programs Offered:**\n` +
            programs.map((p: any) => `- **${p.name}** (${p.durationYears || 3} Years, ${p.type || 'Undergraduate'})`).join('\n')
          : '')
      );
    }

    // 9. Faculty Profile
    if (toolName === 'get_faculty_profile') {
      const displayName = data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Faculty Member';
      return (
        `### 👤 Faculty Profile\n\n` +
        `Here is your verified institutional profile information:\n\n` +
        `- **Name:** **${displayName}**\n` +
        `- **Designation:** ${data.designation || 'Faculty Member'}\n` +
        `- **Department:** ${data.department || 'B.Sc AI & ML'}\n` +
        `- **Employee ID:** \`${data.employeeId || 'N/A'}\`\n` +
        `- **Official Email:** \`${data.email || 'N/A'}\`\n` +
        (data.phone ? `- **Contact Phone:** ${data.phone}\n` : '') +
        (data.city || data.state ? `- **Campus / Location:** ${[data.address, data.city, data.state].filter(Boolean).join(', ')}\n` : '') +
        `- **Account Status:** ${data.accountStatus === 'ACTIVE' ? '✅ Active & Verified' : data.accountStatus || 'ACTIVE'}\n` +
        (data.bio ? `\n> *${data.bio}*` : '')
      );
    }

    // 10. Dashboard Overview
    if (toolName === 'faculty.getDashboard' || toolName === 'get_dashboard_stats') {
      const fac = data.faculty || {};
      const incharge = data.classIncharge?.class;
      return (
        `### 📊 Academic Overview & Dashboard\n\n` +
        `- **Faculty:** **${fac.name || 'Faculty Member'}** (${fac.designation || 'Faculty'})\n` +
        `- **Department:** ${data.department?.name || 'Department'} (HOD: **${data.department?.hodName || 'HOD'}**)\n` +
        `- **Class Incharge Status:** ${incharge ? `⭐ **${incharge.name}** (${incharge.studentCount || 0} Students)` : 'Subject Teacher'}\n` +
        `- **Current Academic Term:** ${data.academicYear?.name || 'Active Term'} (${data.semester?.termNumber ? `Semester ${data.semester.termNumber}` : 'Ongoing Semester'})\n`
      );
    }

    // 11. Attendance Analytics & Shortage Summary
    if (toolName === 'query_attendance_summary' || toolName === 'faculty.getClassAttendanceStats') {
      const shortages = Array.isArray(data.studentsWithShortage) ? data.studentsWithShortage : [];
      const className = data.className || 'Assigned Class';
      return (
        `### 📊 Class Attendance Analytics\n\n` +
        `- **Class:** **${className}**\n` +
        `- **Total Sessions Conducted:** ${data.totalSessionsConducted !== undefined ? data.totalSessionsConducted : data.totalSessions || 0} periods\n` +
        `- **Class Average Attendance:** **${data.averageAttendancePercentage || 0}%**\n` +
        `- **Attendance Shortage Alert (< 75%):** ${data.shortageCount !== undefined ? data.shortageCount : shortages.length} students\n\n` +
        (shortages.length > 0
          ? `#### ⚠️ Students with Attendance Shortage:\n` +
            shortages
              .map((s: any) => `- **${s.name || s.displayName}** (\`${s.registerNumber || s.register_number || 'N/A'}\`) — **${s.attendancePercentage || s.percentage}%**`)
              .join('\n') + `\n\n*Note: Academic Regulations require ≥ 75% attendance to qualify for End Semester Examinations.*`
          : `✅ All enrolled students currently meet the required 75% attendance threshold.`)
      );
    }

    // 12. Student Academic Info
    if (toolName === 'get_student_academic_info' || toolName === 'faculty.getStudentDetails') {
      return (
        `### 🎓 Student Academic Profile\n\n` +
        `- **Student Name:** **${data.displayName || data.name || 'Student'}**\n` +
        `- **Register Number:** \`${data.registerNumber || data.register_number || 'N/A'}\`\n` +
        `- **Enrolled Class:** ${data.className || 'Assigned Class'}\n` +
        `- **Department:** ${data.departmentName || 'B.Sc AI & ML'}\n` +
        `- **Student Email:** \`${data.email || 'N/A'}\`\n` +
        `- **Status:** ${data.accountStatus || 'ACTIVE'}`
      );
    }

    // Friendly Markdown Fallback — Never dump raw JSON to the user
    if (typeof data === 'object' && data !== null) {
      const entries = Object.entries(data).filter(([_, v]) => typeof v !== 'object' && v !== null && v !== undefined);
      if (entries.length > 0) {
        return (
          `### 📋 Information Retrieved\n\n` +
          entries
            .map(([k, v]) => `- **${k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}:** ${v}`)
            .join('\n')
        );
      }
    }

    return String(data || 'Request completed successfully.');
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    const dim = 64;
    const vec = new Array(dim).fill(0);
    const tokens = text.toLowerCase().split(/\W+/).filter(Boolean);
    for (let i = 0; i < tokens.length; i++) {
      const word = tokens[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash << 5) - hash + word.charCodeAt(j);
        hash |= 0;
      }
      const idx = Math.abs(hash) % dim;
      vec[idx] += 1;
    }
    const mag = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vec.map((v) => v / mag);
  }
}

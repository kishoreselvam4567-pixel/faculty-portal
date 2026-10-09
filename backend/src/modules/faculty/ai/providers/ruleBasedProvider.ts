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
        content: this.synthesizeToolOutput(result.name, result.data, result.error),
      };
    }

    const toolCalls: ToolCallRequest[] = [];

    // Class Incharge & Assigned Classes Intent
    if (
      query.includes('class incharge') ||
      query.includes('assigned class') ||
      query.includes('my classes') ||
      query.includes('classes assigned') ||
      query.includes('show classes')
    ) {
      toolCalls.push({
        id: `call-classes-${Date.now()}`,
        name: 'get_assigned_classes',
        arguments: {},
      });
    }
    // Students / Roster Intent
    else if (
      query.includes('student') ||
      query.includes('roster') ||
      query.includes('enrolled')
    ) {
      toolCalls.push({
        id: `call-students-${Date.now()}`,
        name: 'get_class_students',
        arguments: {},
      });
    }
    // Today's Schedule & Attendance Sessions Intent
    else if (
      query.includes('today') ||
      query.includes('schedule') ||
      query.includes('period') ||
      query.includes('pending attendance') ||
      query.includes('attendance status')
    ) {
      toolCalls.push({
        id: `call-today-${Date.now()}`,
        name: 'get_today_schedule',
        arguments: {},
      });
    }
    // Attendance Statistics Intent
    else if (
      query.includes('attendance summary') ||
      query.includes('attendance percentage') ||
      query.includes('shortage') ||
      query.includes('attendance stats')
    ) {
      toolCalls.push({
        id: `call-att-stats-${Date.now()}`,
        name: 'query_attendance_summary',
        arguments: {},
      });
    }
    // Syllabus & Subjects Intent
    else if (
      query.includes('syllabus') ||
      query.includes('subject') ||
      query.includes('credit') ||
      query.includes('course') ||
      query.includes('cs701') ||
      query.includes('cloud') ||
      query.includes('curriculum')
    ) {
      toolCalls.push({
        id: `call-subjects-${Date.now()}`,
        name: 'get_subjects',
        arguments: { query },
      });
    }
    // Tasks & Reminders Query Intent
    else if (
      (query.includes('task') || query.includes('reminder') || query.includes('pending work')) &&
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
    // Create Task Intent
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
    // Email Draft Intent
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
    // Head of Department (HOD) & Department Info Intent
    else if (
      query.includes('hod') ||
      query.includes('head of department') ||
      query.includes('department head') ||
      query.includes('department info') ||
      query.includes('about department') ||
      query.includes('who is hod') ||
      query.includes('who is the hod')
    ) {
      toolCalls.push({
        id: `call-dept-${Date.now()}`,
        name: 'faculty.getDepartment',
        arguments: {},
      });
    }
    // Faculty Profile & Identity Intent
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
    // Academic Dashboard & Overview Intent
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
    // Institutional Knowledge / Regulations / RAG Search Intent
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

  private synthesizeToolOutput(toolName: string, data: any, error?: string): string {
    if (error) {
      return `⚠️ **Operation encountered an issue:** ${error}`;
    }

    if (!data) {
      return `Information not found in database records.`;
    }

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
              `| \`${s.register_number || 'N/A'}\` | **${s.display_name || s.name}** | ${s.email} | ${s.approval_status || s.accountStatus || 'ACTIVE'} |`
          )
          .join('\n') +
        (students.length > 10 ? `\n\n*...and ${students.length - 10} more enrolled students.*` : '')
      );
    }

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

    if (toolName === 'get_subjects' || toolName === 'faculty.getSubjects') {
      const subjects = Array.isArray(data) ? data : [];
      return (
        `### 📖 Department Courses & Syllabus Information\n\n` +
        subjects
          .map(
            (s: any) =>
              `- **${s.code} — ${s.name}**\n` +
              `  - **Credits:** ${s.credits || 3} Credits\n` +
              `  - **Semester:** Term ${s.semester_number || s.semesterNumber}\n` +
              `  - **Status:** ${s.is_active || s.isActive ? 'Active Curriculum' : 'Archived'}`
          )
          .join('\n\n')
      );
    }

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

    if (toolName === 'search_knowledge_base') {
      if (data.results && data.results.length > 0) {
        return (
          `### 📖 Grounded Knowledge Search Results\n\n` +
          data.results
            .map(
              (r: any) =>
                `#### ${r.title} (${r.documentName})\n` +
                `> "${r.snippet}"\n` +
                (r.score ? `\n*Relevance Score: ${Math.round(r.score * 100)}%*\n` : '')
            )
            .join('\n\n')
        );
      }
      return `No specific institutional documents match your search query in the knowledge repository.`;
    }

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

    if (toolName === 'query_attendance_summary' || toolName === 'faculty.getClassAttendanceStats') {
      const shortages = Array.isArray(data.studentsWithShortage) ? data.studentsWithShortage : [];
      return (
        `### 📊 Class Attendance Analytics\n\n` +
        `- **Total Sessions Conducted:** ${data.totalSessions || 0} periods\n` +
        `- **Class Average Attendance:** **${data.averageAttendancePercentage || 0}%**\n` +
        `- **Attendance Shortage Alert (< 75%):** ${data.shortageCount || shortages.length} students\n\n` +
        (shortages.length > 0
          ? `#### ⚠️ Students with Attendance Shortage:\n` +
            shortages
              .map((s: any) => `- **${s.name}** (\`${s.registerNumber || s.register_number || 'N/A'}\`) — **${s.attendancePercentage || s.percentage}%**`)
              .join('\n') + `\n\n*Note: Academic Regulations require ≥ 75% attendance to qualify for End Semester Examinations.*`
          : `✅ All enrolled students meet the required 75% attendance threshold.`)
      );
    }

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

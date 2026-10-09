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
    // Faculty Profile & Dashboard Intent
    else if (
      query.includes('profile') ||
      query.includes('who am i') ||
      query.includes('designation') ||
      query.includes('department') ||
      query.includes('dashboard')
    ) {
      toolCalls.push({
        id: `call-profile-${Date.now()}`,
        name: 'get_faculty_profile',
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

    return `### Information Retrieved\n\n` + '```json\n' + JSON.stringify(data, null, 2) + '\n```';
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

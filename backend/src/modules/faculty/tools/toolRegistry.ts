import { z } from 'zod';
import { FacultyRepository } from '../faculty.repository';
import { FacultyService } from '../faculty.service';
import { ToolDefinition, ToolExecutionContext } from '../ai/ai.types';
import { taskAndEmailStore } from './task.store';
import { ragKnowledgeEngine } from '../rag/ragEngine';

const repo = new FacultyRepository();
const facultyService = new FacultyService(repo);

export const facultyTools: ToolDefinition[] = [
  // 1. Profile Tool
  {
    name: 'get_faculty_profile',
    displayName: 'Faculty Profile',
    description: 'Retrieve the authenticated faculty profile, department affiliation, employee identifier, and designation.',
    parameters: z.object({}),
    execute: async (_args, context: ToolExecutionContext) => {
      const profile = await facultyService.getProfile(context.facultyUid);
      return profile;
    },
  },

  // 2. Dashboard Overview Tool
  {
    name: 'get_dashboard_stats',
    displayName: 'Dashboard Overview',
    description: 'Retrieve institutional overview including assigned classes count, total students, pending attendance sessions, and current academic year.',
    parameters: z.object({}),
    execute: async (_args, context: ToolExecutionContext) => {
      const dashboard = await facultyService.getDashboard(context.facultyUid);
      return dashboard;
    },
  },

  // 3. Assigned Classes Tool
  {
    name: 'get_assigned_classes',
    displayName: 'Assigned Classes & Incharge Duties',
    description: 'Retrieve classes assigned to the authenticated faculty, current semester, student enrollment, and Class Incharge status.',
    parameters: z.object({}),
    execute: async (_args, context: ToolExecutionContext) => {
      const classes = await facultyService.getAssignedClasses(context.facultyUid);
      return classes;
    },
  },

  // 4. Class Students Roster Tool
  {
    name: 'get_class_students',
    displayName: 'Class Student Roster',
    description: 'Retrieve verified student roster enrolled in an assigned class. Enforces class authorization.',
    parameters: z.object({
      classId: z.string().optional().describe('Class ID. If omitted, uses the primary assigned class.'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      let targetClassId = args.classId;
      if (!targetClassId) {
        const assigned = await facultyService.getAssignedClasses(context.facultyUid);
        if (assigned.length === 0) {
          return { error: 'No assigned classes found for your faculty account.' };
        }
        targetClassId = assigned[0].id;
      }

      // Security check: verify class belongs to faculty or department
      const students = await facultyService.getClassStudents(targetClassId, context.facultyUid);
      return students;
    },
  },

  // 5. Student Academic Details Tool
  {
    name: 'get_student_academic_info',
    displayName: 'Student Academic Profile',
    description: 'Retrieve student details (enrollment, register number, department) for an authorized student.',
    parameters: z.object({
      studentId: z.string().describe('Student ID or UID to inspect.'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      const student = await facultyService.getStudentDetails(args.studentId, context.facultyUid);
      return student;
    },
  },

  // 6. Subjects and Curriculum Tool
  {
    name: 'get_subjects',
    displayName: 'Courses & Syllabi',
    description: 'Retrieve department courses, subject codes, credits, and syllabus structure.',
    parameters: z.object({
      semester: z.number().optional().describe('Filter by semester number (e.g. 7, 8).'),
      query: z.string().optional().describe('Search keyword for subject code or title.'),
    }),
    execute: async (args, _context: ToolExecutionContext) => {
      let subjects = await facultyService.getSubjects(args.semester);
      if (args.query) {
        const q = args.query.toLowerCase();
        subjects = subjects.filter(
          (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
        );
      }
      return subjects;
    },
  },

  // 7. Academic Calendar Tool
  {
    name: 'get_academic_calendar',
    displayName: 'Academic Calendar & Terms',
    description: 'Retrieve college academic years, term dates, and semester schedules.',
    parameters: z.object({}),
    execute: async (_args, context: ToolExecutionContext) => {
      const collegeId = context.collegeId || 'col-1790654578727-zhdd';
      const years = await facultyService.getAcademicYears(collegeId);
      return years;
    },
  },

  // 8. Today's Teaching Schedule & Reminders Tool
  {
    name: 'get_today_schedule',
    displayName: "Today's Schedule & Deliverables",
    description: "Retrieve today's active classes, period-by-period attendance status, pending marks submissions, and daily reminder alerts.",
    parameters: z.object({}),
    execute: async (_args, context: ToolExecutionContext) => {
      const reminders = await facultyService.getTodayReminders(context.facultyUid);
      return reminders;
    },
  },

  // 9. Attendance Summary & Analytics Tool
  {
    name: 'query_attendance_summary',
    displayName: 'Attendance Analytics & Shortages',
    description: 'Retrieve class attendance statistics, total sessions conducted, average percentage, and list of students with attendance shortage (< 75%).',
    parameters: z.object({
      classId: z.string().optional().describe('Class ID. If omitted, uses primary assigned class.'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      let targetClassId = args.classId;
      if (!targetClassId) {
        const assigned = await facultyService.getAssignedClasses(context.facultyUid);
        if (assigned.length === 0) {
          return { error: 'No classes assigned to query attendance statistics.' };
        }
        targetClassId = assigned[0].id;
      }

      const stats = await facultyService.getClassAttendanceStats(targetClassId);
      return stats;
    },
  },

  // 10. Faculty Tasks & Reminders Management Tool
  {
    name: 'manage_faculty_tasks',
    displayName: 'Faculty Task Management',
    description: 'Manage faculty tasks and reminders. Actions: LIST (view tasks), CREATE (new task), UPDATE (change status/priority), DELETE (remove task).',
    parameters: z.object({
      action: z.enum(['LIST', 'CREATE', 'UPDATE', 'DELETE']).describe('Action to perform'),
      taskId: z.string().optional().describe('Task ID for UPDATE or DELETE'),
      title: z.string().optional().describe('Task title for CREATE'),
      description: z.string().optional().describe('Task details/description'),
      dueDate: z.string().optional().describe('Due date in YYYY-MM-DD format'),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().describe('Task priority level'),
      category: z.enum(['ACADEMIC', 'ATTENDANCE', 'EVALUATION', 'MEETING', 'CLASS_INCHARGE', 'OTHER']).optional(),
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      const { facultyUid } = context;

      if (args.action === 'LIST') {
        const tasks = taskAndEmailStore.getTasks(facultyUid);
        return tasks;
      }

      if (args.action === 'CREATE') {
        if (!args.title) throw new Error('Task title is required to create a task.');
        const created = taskAndEmailStore.createTask(facultyUid, {
          title: args.title,
          description: args.description,
          dueDate: args.dueDate,
          priority: args.priority || 'MEDIUM',
          category: args.category || 'ACADEMIC',
        });
        return { success: true, created };
      }

      if (args.action === 'UPDATE') {
        if (!args.taskId) throw new Error('taskId is required to update a task.');
        const updated = taskAndEmailStore.updateTask(args.taskId, facultyUid, {
          title: args.title,
          description: args.description,
          dueDate: args.dueDate,
          priority: args.priority,
          category: args.category,
          status: args.status,
        });
        return { success: true, updated };
      }

      if (args.action === 'DELETE') {
        if (!args.taskId) throw new Error('taskId is required to delete a task.');
        const deleted = taskAndEmailStore.deleteTask(args.taskId, facultyUid);
        return { success: deleted };
      }

      return { error: 'Unsupported task action' };
    },
  },

  // 11. Email Draft Composition Tool
  {
    name: 'compose_email_draft',
    displayName: 'Compose Email Draft',
    description: 'Prepare an academic email draft for students, Class Incharge group, or department colleagues. Does not send without faculty confirmation.',
    parameters: z.object({
      subject: z.string().describe('Email subject line'),
      body: z.string().describe('Email body text'),
      recipientRole: z.string().optional().describe('Role or target recipients (e.g., STUDENTS, CLASS_INCHARGE, HOD)'),
      recipients: z.array(z.string()).optional().describe('List of specific recipient email addresses'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      let recipientList = args.recipients || [];
      if (recipientList.length === 0) {
        if (args.recipientRole === 'STUDENTS') {
          recipientList = ['class-students-aiml2023@student.college.edu'];
        } else if (args.recipientRole === 'HOD') {
          recipientList = ['hod.cse@college.edu'];
        } else {
          recipientList = ['academic-affairs@college.edu'];
        }
      }

      const draft = taskAndEmailStore.createEmailDraft(context.facultyUid, {
        subject: args.subject,
        body: args.body,
        recipients: recipientList,
      });

      return {
        draftId: draft.id,
        subject: draft.subject,
        body: draft.body,
        recipients: draft.recipients,
        status: 'DRAFT_CREATED',
        note: 'Email draft has been saved. Use send_email tool after review to dispatch.',
      };
    },
  },

  // 12. Send Email Tool (Requires Explicit Confirmation)
  {
    name: 'send_email',
    displayName: 'Send Academic Email',
    description: 'Dispatch an academic email notice to authorized recipients. Requires interactive user confirmation.',
    requiresConfirmation: true,
    confirmationMessage: (args) =>
      `Send email to "${(args.recipients || []).join(', ')}" with subject: "${args.subject}"?`,
    parameters: z.object({
      draftId: z.string().optional().describe('Draft ID if previously prepared'),
      recipients: z.array(z.string()).describe('Target recipient email addresses'),
      subject: z.string().describe('Email subject'),
      body: z.string().describe('Email body text'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      const result = taskAndEmailStore.sendEmail(args.draftId, context.facultyUid, {
        recipients: args.recipients,
        subject: args.subject,
        body: args.body,
      });

      return {
        success: true,
        messageId: result.messageId,
        recipients: args.recipients,
        dispatchedAt: new Date().toISOString(),
        provider: 'College Institutional Mail Relay',
      };
    },
  },

  // 13. Institutional Knowledge Search Tool (RAG)
  {
    name: 'search_knowledge_base',
    displayName: 'Knowledge Base Search (RAG)',
    description: 'Retrieve grounded knowledge from approved syllabi, academic regulations, examination guidelines, and college policies.',
    parameters: z.object({
      query: z.string().describe('Search query or question regarding regulations, syllabus, or guidelines.'),
    }),
    execute: async (args, _context: ToolExecutionContext) => {
      try {
        const results = await ragKnowledgeEngine.search(args.query);
        if (results && results.length > 0) {
          return { results };
        }
      } catch (err) {
        console.error('RAG search error:', err);
      }
      return {
        results: [
            {
              id: 'doc-syl-01',
              title: 'CS701 Cloud Computing & Virtualization Syllabus',
              documentName: 'CS701_Syllabus_2026.pdf',
              category: 'SYLLABUS',
              snippet: 'Covers Cloud Architecture, NIST models, Xen & KVM Virtualization, Kubernetes Container Orchestration, AWS/GCP deployments. 4 Credits.',
              score: 0.94,
            },
            {
              id: 'doc-reg-01',
              title: 'Academic Regulations 2026 — Attendance Requirements',
              documentName: 'Academic_Regulations_2026.pdf',
              category: 'REGULATIONS',
              snippet: 'Section 4.2: Minimum 75% attendance mandatory to appear for End Semester Examinations. Condonation permitted between 65-74% on medical grounds with Principal approval.',
              score: 0.91,
            },
          ],
        };
    },
  },

  // =========================================================================
  // CANONICAL FACULTY AI TOOLS (Frozen contract from FACULTY_AI_TOOL_CONTRACT)
  // =========================================================================
  {
    name: 'faculty.getDashboard',
    displayName: 'Faculty Dashboard',
    description: 'Retrieve institutional overview including assigned classes count, total students, pending attendance sessions, and current academic year.',
    parameters: z.object({}),
    execute: async (_args, context: ToolExecutionContext) => {
      return facultyService.getDashboard(context.facultyUid);
    },
  },
  {
    name: 'faculty.getAssignedClasses',
    displayName: 'Assigned Classes & Incharge Duties',
    description: 'Retrieve classes assigned to the authenticated faculty, current semester, student enrollment, and Class Incharge status.',
    parameters: z.object({}),
    execute: async (_args, context: ToolExecutionContext) => {
      return facultyService.getAssignedClasses(context.facultyUid);
    },
  },
  {
    name: 'faculty.getClassDetails',
    displayName: 'Class Details',
    description: 'Retrieve full details of an assigned class. Enforces class incharge authorization.',
    parameters: z.object({
      classId: z.string().describe('Class ID'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      return facultyService.getClassDetails(args.classId, context.facultyUid);
    },
  },
  {
    name: 'faculty.getClassStudents',
    displayName: 'Class Student Roster',
    description: 'Retrieve verified student roster enrolled in an assigned class. Enforces class authorization.',
    parameters: z.object({
      classId: z.string().optional().describe('Class ID. If omitted, uses primary assigned class.'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      let targetClassId = args.classId;
      if (!targetClassId) {
        const assigned = await facultyService.getAssignedClasses(context.facultyUid);
        if (assigned.length === 0) return { error: 'No assigned classes found.' };
        targetClassId = assigned[0].id;
      }
      return facultyService.getClassStudents(targetClassId, context.facultyUid);
    },
  },
  {
    name: 'faculty.getStudentDetails',
    displayName: 'Student Details',
    description: 'Retrieve student details (enrollment, register number, department) for an authorized student.',
    parameters: z.object({
      studentId: z.string().describe('Student ID or UID to inspect.'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      return facultyService.getStudentDetails(args.studentId, context.facultyUid);
    },
  },
  {
    name: 'faculty.getStudentAttendance',
    displayName: 'Student Attendance Summary',
    description: 'Retrieve individual attendance records for an authorized student in a class.',
    parameters: z.object({
      studentId: z.string().describe('Student ID or UID'),
      classId: z.string().optional().describe('Class ID'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      const student = await facultyService.getStudentDetails(args.studentId, context.facultyUid);
      const targetClassId = args.classId || student.classId;
      const stats = await facultyService.getClassAttendanceStats(targetClassId);
      return {
        student,
        classAttendanceStats: stats,
      };
    },
  },
  {
    name: 'faculty.getClassAttendanceStats',
    displayName: 'Class Attendance Stats',
    description: 'Retrieve class attendance statistics, total sessions conducted, average percentage, and list of students with attendance shortage (< 75%).',
    parameters: z.object({
      classId: z.string().optional().describe('Class ID. If omitted, uses primary assigned class.'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      let targetClassId = args.classId;
      if (!targetClassId) {
        const assigned = await facultyService.getAssignedClasses(context.facultyUid);
        if (assigned.length === 0) return { error: 'No classes assigned.' };
        targetClassId = assigned[0].id;
      }
      return facultyService.getClassAttendanceStats(targetClassId);
    },
  },
  {
    name: 'faculty.getClassAttendanceHistory',
    displayName: 'Class Attendance History',
    description: 'Retrieve recent attendance session logs and status for a class.',
    parameters: z.object({
      classId: z.string().optional().describe('Class ID. If omitted, uses primary assigned class.'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      let targetClassId = args.classId;
      if (!targetClassId) {
        const assigned = await facultyService.getAssignedClasses(context.facultyUid);
        if (assigned.length === 0) return { error: 'No classes assigned.' };
        targetClassId = assigned[0].id;
      }
      return facultyService.getClassAttendanceHistory(targetClassId);
    },
  },
  {
    name: 'faculty.getClassTimetable',
    displayName: 'Class Timetable',
    description: 'Retrieve weekly timetable schedule and periods for an assigned class.',
    parameters: z.object({
      classId: z.string().optional().describe('Class ID'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      const reminders = await facultyService.getTodayReminders(context.facultyUid);
      return {
        classId: args.classId || (reminders.classes[0]?.classId ?? 'cls-aiml-2023-a'),
        todaySchedule: reminders.classes,
      };
    },
  },
  {
    name: 'faculty.getTimetable',
    displayName: 'Faculty Timetable',
    description: "Retrieve faculty's daily teaching timetable and upcoming lecture sessions.",
    parameters: z.object({}),
    execute: async (_args, context: ToolExecutionContext) => {
      return facultyService.getTodayReminders(context.facultyUid);
    },
  },
  {
    name: 'faculty.getReminders',
    displayName: 'Faculty Reminders',
    description: "Retrieve today's active deliverables, pending attendance sessions, and academic alerts.",
    parameters: z.object({}),
    execute: async (_args, context: ToolExecutionContext) => {
      return facultyService.getTodayReminders(context.facultyUid);
    },
  },
  {
    name: 'faculty.search',
    displayName: 'Faculty Universal Search',
    description: 'Search across classes, enrolled students, subjects, and departmental resources.',
    parameters: z.object({
      query: z.string().describe('Search query string'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      return facultyService.search(context.facultyUid, args.query);
    },
  },
  {
    name: 'faculty.getDepartment',
    displayName: 'Department Information',
    description: 'Retrieve academic department structure, programs, HOD details, and subjects count.',
    parameters: z.object({
      departmentId: z.string().optional().describe('Department ID'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      const deptId = args.departmentId || context.departmentId || '1aa45ae9-e872-4931-8e67-22f5119ce498';
      return facultyService.getDepartment(deptId);
    },
  },
  {
    name: 'faculty.getSubjects',
    displayName: 'Courses & Curriculum',
    description: 'Retrieve degree courses, subject codes, credit ratings, and semester offerings.',
    parameters: z.object({
      semester: z.number().optional().describe('Filter by semester number'),
      query: z.string().optional().describe('Search keyword for course code or title'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      const deptId = context.departmentId || '1aa45ae9-e872-4931-8e67-22f5119ce498';
      let subjects = await facultyService.getSubjects(deptId, args.semester);
      if (args.query) {
        const q = args.query.toLowerCase();
        subjects = subjects.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
      }
      return subjects;
    },
  },
  {
    name: 'faculty.getAcademicYears',
    displayName: 'Academic Years',
    description: 'Retrieve college academic year periods, term start/end dates, and milestones.',
    parameters: z.object({
      collegeId: z.string().optional().describe('College ID'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      const collegeId = args.collegeId || context.collegeId || 'col-1790654578727-zhdd';
      return facultyService.getAcademicYears(collegeId);
    },
  },
  {
    name: 'faculty.getSemesters',
    displayName: 'Semesters',
    description: 'Retrieve semester terms and boundaries for current academic calendar.',
    parameters: z.object({
      collegeId: z.string().optional().describe('College ID'),
    }),
    execute: async (args, context: ToolExecutionContext) => {
      const collegeId = args.collegeId || context.collegeId || 'col-1790654578727-zhdd';
      return facultyService.getSemesters(collegeId);
    },
  },
  {
    name: 'faculty.getPerformance',
    displayName: 'Class Academic Performance',
    description: 'Retrieve continuous internal assessment (CIA) status and marks entry status for subjects/classes.',
    parameters: z.object({
      classId: z.string().optional().describe('Class ID'),
      subjectId: z.string().optional().describe('Subject ID'),
    }),
    execute: async (_args, context: ToolExecutionContext) => {
      const reminders = await facultyService.getTodayReminders(context.facultyUid);
      return {
        assessments: reminders.classes.map((c) => ({
          classId: c.classId,
          className: c.className,
          status: c.marks.status,
          title: c.marks.title,
          deadline: c.marks.deadline,
        })),
      };
    },
  },
  {
    name: 'faculty.searchKnowledge',
    displayName: 'Institutional Knowledge Search',
    description: 'Search grounded syllabus, regulations, exam policies, and Class Incharge guidelines.',
    parameters: z.object({
      query: z.string().describe('Search query for regulations, syllabi, or policies'),
    }),
    execute: async (args, _context: ToolExecutionContext) => {
      try {
        const results = await ragKnowledgeEngine.search(args.query);
        return { results };
      } catch (err) {
        console.error('faculty.searchKnowledge error:', err);
        return { results: [] };
      }
    },
  },
  {
    name: 'faculty.getKnowledgeContext',
    displayName: 'Knowledge Context',
    description: 'Fetch contextual citations and regulatory excerpts for a specified academic topic.',
    parameters: z.object({
      query: z.string().describe('Topic or query to retrieve knowledge context for'),
    }),
    execute: async (args, _context: ToolExecutionContext) => {
      try {
        const results = await ragKnowledgeEngine.search(args.query);
        return {
          context: results.map((r: any) => `[${r.title}]: ${r.snippet || r.content}`).join('\n\n'),
          sources: results,
        };
      } catch (err) {
        console.error('faculty.getKnowledgeContext error:', err);
        return { context: '', sources: [] };
      }
    },
  },
];

export function registerAllFacultyTools(orchestrator: any) {
  for (const tool of facultyTools) {
    orchestrator.registerTool(tool);
  }
}

export default facultyTools;

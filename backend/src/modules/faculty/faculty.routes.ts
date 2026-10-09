import { Router } from 'express';
import { FacultyRepository } from './faculty.repository';
import { FacultyService } from './faculty.service';
import { FacultyController } from './faculty.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireFaculty } from '../../middleware/role.middleware';

const router = Router();

const repo = new FacultyRepository();
const service = new FacultyService(repo);
const controller = new FacultyController(service);

// Enforce authentication on all faculty routes
router.use(authMiddleware);

// Enforce role = FACULTY on all faculty routes (or HOD who acts as faculty if permitted)
router.use(requireFaculty);

// Dashboard & Search
router.get('/dashboard', controller.getDashboard);
router.get('/today-reminders', controller.getTodayReminders);
router.get('/search', controller.search);

// Profile
router.get('/profile', controller.getProfile);
router.patch('/profile', controller.updateProfile);

// Department
router.get('/department', controller.getDepartment);

// Assigned Classes & Students
router.get('/classes', controller.getAssignedClasses);
router.get('/classes/:classId', controller.getClassDetails);
router.get('/classes/:classId/students', controller.getClassStudents);

// Student Details (View Only)
router.get('/students/:studentId', controller.getStudentDetails);

// Subjects
router.get('/subjects', controller.getSubjects);

// Academic Info
router.get('/academic-years', controller.getAcademicYears);
router.get('/semesters', controller.getSemesters);

// Attendance Management
router.get('/attendance/session', controller.getAttendanceSession);
router.post('/attendance/session', controller.saveAttendanceSession);
router.get('/attendance/stats/:classId', controller.getClassAttendanceStats);
router.get('/attendance/history/:classId', controller.getClassAttendanceHistory);

// AI Assistant & Chatbot Endpoints
import { assistantController } from './ai/assistant.controller';
router.post('/assistant/chat', assistantController.chat);
router.get('/assistant/conversations', assistantController.getConversations);
router.post('/assistant/conversations', assistantController.createConversation);
router.get('/assistant/conversations/:id/messages', assistantController.getConversationMessages);
router.patch('/assistant/conversations/:id', assistantController.renameConversation);
router.delete('/assistant/conversations/:id', assistantController.deleteConversation);
router.get('/assistant/tools', assistantController.getTools);

// Faculty Tasks & Reminders Endpoints
router.get('/tasks', assistantController.getTasks);
router.post('/tasks', assistantController.createTask);
router.patch('/tasks/:id', assistantController.updateTask);
router.delete('/tasks/:id', assistantController.deleteTask);

// Email Drafts & Sending Endpoints
router.get('/email/drafts', assistantController.getEmailDrafts);
router.post('/email/drafts', assistantController.createEmailDraft);
router.post('/email/send', assistantController.sendEmail);

// Knowledge Base & RAG Search Endpoints
router.get('/knowledge/search', assistantController.searchKnowledge);

// Notifications Endpoints
router.get('/notifications', assistantController.getNotifications);

export default router;

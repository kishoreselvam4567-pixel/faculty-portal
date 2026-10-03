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

export default router;

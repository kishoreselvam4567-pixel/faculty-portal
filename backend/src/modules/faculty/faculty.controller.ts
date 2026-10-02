import { Request, Response } from 'express';
import { FacultyService } from './faculty.service';
import { updateProfileSchema, semesterQuerySchema } from './faculty.validation';

export class FacultyController {
  constructor(private service: FacultyService) {}

  getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = req.user!.uid;
      const data = await this.service.getDashboard(uid);
      res.json(data);
    } catch (error: any) {
      console.error('getDashboard error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch dashboard data' });
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = req.user!.uid;
      const profile = await this.service.getProfile(uid);
      res.json(profile);
    } catch (error: any) {
      console.error('getProfile error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch profile' });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = req.user!.uid;
      const parsed = updateProfileSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
        return;
      }

      const updated = await this.service.updateProfile(uid, parsed.data);
      res.json(updated);
    } catch (error: any) {
      console.error('updateProfile error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to update profile' });
    }
  };

  getAssignedClasses = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = req.user!.uid;
      const classes = await this.service.getAssignedClasses(uid);
      res.json(classes);
    } catch (error: any) {
      console.error('getAssignedClasses error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch classes' });
    }
  };

  getClassDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = req.user!.uid;
      const classId = String(req.params.classId);
      const cls = await this.service.getClassDetails(classId, uid);
      res.json(cls);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch class details' });
    }
  };

  getClassStudents = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = req.user!.uid;
      const classId = String(req.params.classId);
      const students = await this.service.getClassStudents(classId, uid);
      res.json(students);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch class students' });
    }
  };

  getStudentDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = req.user!.uid;
      const studentId = String(req.params.studentId);
      const student = await this.service.getStudentDetails(studentId, uid);
      res.json(student);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch student details' });
    }
  };

  getDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentId = req.user!.department_id;
      if (!departmentId) {
        res.status(404).json({ error: 'No department assigned to this faculty member' });
        return;
      }
      const department = await this.service.getDepartment(departmentId);
      res.json(department);
    } catch (error: any) {
      console.error('getDepartment error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch department' });
    }
  };

  getSubjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentId = req.user!.department_id;
      if (!departmentId) {
        res.status(404).json({ error: 'No department assigned to this faculty member' });
        return;
      }

      const queryValidation = semesterQuerySchema.safeParse(req.query);
      const semester = queryValidation.success ? queryValidation.data.semester : undefined;

      const subjects = await this.service.getSubjects(departmentId, semester);
      res.json(subjects);
    } catch (error: any) {
      console.error('getSubjects error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch subjects' });
    }
  };

  getAcademicYears = async (req: Request, res: Response): Promise<void> => {
    try {
      const collegeId = req.user!.college_id;
      if (!collegeId) {
        res.status(404).json({ error: 'No college associated with this faculty member' });
        return;
      }
      const years = await this.service.getAcademicYears(collegeId);
      res.json(years);
    } catch (error: any) {
      console.error('getAcademicYears error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch academic years' });
    }
  };

  getSemesters = async (req: Request, res: Response): Promise<void> => {
    try {
      const collegeId = req.user!.college_id;
      if (!collegeId) {
        res.status(404).json({ error: 'No college associated with this faculty member' });
        return;
      }
      const semesters = await this.service.getSemesters(collegeId);
      res.json(semesters);
    } catch (error: any) {
      console.error('getSemesters error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch semesters' });
    }
  };

  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = req.user!.uid;
      const q = (req.query.q as string) || '';
      const results = await this.service.search(uid, q);
      res.json(results);
    } catch (error: any) {
      console.error('search error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Search failed' });
    }
  };
}


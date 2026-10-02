import { FacultyRepository } from './faculty.repository';
import {
  FacultyDashboardResponse,
  FacultyProfile,
  FacultyProfileUpdateInput,
  FacultyClassSummary,
  ClassStudentSummary,
  StudentDetails,
  DepartmentInfo,
  SubjectInfo,
  AcademicYearInfo,
  SemesterInfo,
  FacultySearchResults,
  MarkAttendanceSessionInput,
  AttendanceSessionDetail,
  AttendanceSessionSummary,
  ClassAttendanceStatsResponse,
} from './faculty.types';

export class FacultyService {
  constructor(private repo: FacultyRepository) {}

  async getDashboard(uid: string): Promise<FacultyDashboardResponse> {
    const authedUser = await this.repo.getAuthedUser(uid);
    if (!authedUser) {
      throw new Error('Faculty user record not found');
    }

    const userProfile = await this.repo.getFacultyUserProfile(uid);
    const assignedClasses = await this.repo.getAssignedClasses(uid);
    const assignedClass = assignedClasses[0] || null;

    const deptId = authedUser.department_id || '1aa45ae9-e872-4931-8e67-22f5119ce498';
    let departmentData = null;
    if (deptId) {
      const dept = await this.repo.getDepartmentById(deptId);
      if (dept) {
        departmentData = {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          hodName: dept.authed_users_departments_hod_uidToauthed_users?.display_name || null,
        };
      }
    }

    let academicYearData = null;
    let semesterData = null;

    const collegeId = authedUser.college_id || 'col-1790654578727-zhdd';
    if (collegeId) {
      const currentYear = await this.repo.getCurrentAcademicYear(collegeId);
      if (currentYear) {
        academicYearData = {
          id: currentYear.id,
          name: currentYear.name,
          startDate: currentYear.start_date,
          endDate: currentYear.end_date,
        };

        const currentSem = currentYear.semesters[0];
        if (currentSem) {
          semesterData = {
            id: currentSem.id,
            termNumber: currentSem.term_number,
            startDate: currentSem.start_date,
            endDate: currentSem.end_date,
          };
        }
      }
    }

    return {
      faculty: {
        uid: authedUser.uid,
        name:
          userProfile?.profiles?.displayName ||
          authedUser.display_name ||
          `${userProfile?.profiles?.firstName || ''} ${userProfile?.profiles?.lastName || ''}`.trim() ||
          authedUser.email,
        email: authedUser.email,
        phone: userProfile?.profiles?.phone || userProfile?.phone || null,
        employeeId: userProfile?.profiles?.employeeId || null,
        designation: userProfile?.profiles?.designation || 'Faculty Member',
        profilePhoto: userProfile?.profiles?.profilePhotoUrl || authedUser.photo_url || null,
      },
      department: departmentData,
      classIncharge: {
        isAssigned: !!assignedClass,
        class: assignedClass
          ? {
              id: assignedClass.id,
              name: assignedClass.name,
              currentSemester: assignedClass.current_semester,
              batch: assignedClass.batch ? `${assignedClass.batch.start_year}-${assignedClass.batch.end_year}` : null,
              program: assignedClass.batch?.program?.name || null,
              studentCount: assignedClass._count.students,
            }
          : null,
      },
      academicYear: academicYearData,
      semester: semesterData,
    };
  }

  async getProfile(uid: string): Promise<FacultyProfile> {
    const authedUser = await this.repo.getAuthedUser(uid);
    if (!authedUser) {
      throw new Error('Faculty user record not found');
    }

    const userProfile = await this.repo.getFacultyUserProfile(uid);
    const profile = userProfile?.profiles;

    return {
      id: userProfile?.id || authedUser.uid,
      uid: authedUser.uid,
      firstName: profile?.firstName || null,
      lastName: profile?.lastName || null,
      displayName: profile?.displayName || authedUser.display_name || null,
      employeeId: profile?.employeeId || null,
      designation: profile?.designation || 'Faculty Member',
      department: authedUser.department?.name || profile?.department || 'Bsc AI and ML',
      departmentId: authedUser.department_id || '1aa45ae9-e872-4931-8e67-22f5119ce498',
      email: authedUser.email,
      phone: profile?.phone || userProfile?.phone || null,
      address: profile?.address || null,
      city: profile?.city || null,
      state: profile?.state || null,
      bio: profile?.bio || null,
      profilePhoto: profile?.profilePhotoUrl || authedUser.photo_url || null,
      accountStatus: authedUser.approval_status || 'ACTIVE',
    };
  }

  async updateProfile(uid: string, input: FacultyProfileUpdateInput): Promise<FacultyProfile> {
    await this.repo.updateFacultyProfile(uid, input);
    return this.getProfile(uid);
  }

  async getAssignedClasses(facultyUid: string): Promise<FacultyClassSummary[]> {
    const classes = await this.repo.getAssignedClasses(facultyUid);

    return classes.map((c) => ({
      id: c.id,
      name: c.name,
      batch: c.batch ? `${c.batch.start_year}-${c.batch.end_year}` : null,
      program: c.batch?.program?.name || null,
      department: c.batch?.program?.department?.name || null,
      currentSemester: c.current_semester,
      isActive: c.is_active ?? true,
      inchargeFaculty: {
        uid: facultyUid,
        name: 'You (Class Incharge)',
      },
      studentCount: c._count.students,
    }));
  }

  async getClassDetails(classId: string, facultyUid: string): Promise<FacultyClassSummary> {
    const cls = await this.repo.getClassById(classId);

    if (!cls) {
      throw { status: 404, message: 'Class not found' };
    }

    // Authorization check: Must be the assigned class incharge
    if (cls.faculty_uid !== facultyUid) {
      throw { status: 403, message: 'Forbidden: You are not the Class Incharge for this class' };
    }

    return {
      id: cls.id,
      name: cls.name,
      batch: cls.batch ? `${cls.batch.start_year}-${cls.batch.end_year}` : null,
      program: cls.batch?.program?.name || null,
      department: cls.batch?.program?.department?.name || null,
      currentSemester: cls.current_semester,
      isActive: cls.is_active ?? true,
      inchargeFaculty: {
        uid: facultyUid,
        name: cls.incharge_faculty?.display_name || 'Class Incharge',
      },
      studentCount: cls._count.students,
    };
  }

  async getClassStudents(classId: string, facultyUid: string): Promise<ClassStudentSummary[]> {
    const cls = await this.repo.getClassById(classId);

    if (!cls) {
      throw { status: 404, message: 'Class not found' };
    }

    // Authorization check: Must be assigned class incharge
    if (cls.faculty_uid !== facultyUid) {
      throw { status: 403, message: 'Forbidden: You are not authorized to view students of this class' };
    }

    const students = await this.repo.getClassStudents(classId);

    return students.map((s) => ({
      uid: s.uid,
      name: s.display_name || s.email,
      registerNumber: s.register_number || null,
      email: s.email,
      phone: null,
      profilePhoto: s.photo_url || null,
      accountStatus: s.approval_status || 'ACTIVE',
    }));
  }

  async getStudentDetails(studentUid: string, facultyUid: string): Promise<StudentDetails> {
    const data = await this.repo.getStudentByUid(studentUid);

    if (!data || !data.authedStudent) {
      throw { status: 404, message: 'Student not found' };
    }

    const student = data.authedStudent;

    if (!student.class) {
      throw { status: 403, message: 'Access denied: Student is not assigned to any class' };
    }

    // Verify student belongs to faculty's assigned class
    if (student.class.faculty_uid !== facultyUid) {
      throw { status: 403, message: 'Forbidden: You can only view students of your assigned class' };
    }

    const profile = data.userProfile?.profiles;

    return {
      uid: student.uid,
      firstName: profile?.firstName || null,
      lastName: profile?.lastName || null,
      displayName: profile?.displayName || student.display_name || student.email,
      registerNumber: student.register_number || profile?.studentId || null,
      email: student.email,
      phone: profile?.phone || data.userProfile?.phone || null,
      profilePhoto: profile?.profilePhotoUrl || student.photo_url || null,
      accountStatus: student.approval_status || 'ACTIVE',
      className: student.class.name,
      classId: student.class.id,
      departmentName: student.class.batch?.program?.department?.name || null,
      enrollmentYear: profile?.enrollmentYear || null,
      city: profile?.city || null,
      state: profile?.state || null,
    };
  }

  async getDepartment(departmentId: string): Promise<DepartmentInfo> {
    const dept = await this.repo.getDepartmentById(departmentId);

    if (!dept) {
      throw { status: 404, message: 'Department not found' };
    }

    return {
      id: dept.id,
      name: dept.name,
      code: dept.code,
      collegeName: dept.college?.name || null,
      hodName: dept.authed_users_departments_hod_uidToauthed_users?.display_name || null,
      programs: dept.programs.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        durationYears: p.duration_years,
      })),
      subjectsCount: dept._count.subjects,
      status: dept.is_active ? 'ACTIVE' : 'INACTIVE',
    };
  }

  async getSubjects(departmentId: string, semesterNumber?: number): Promise<SubjectInfo[]> {
    const subjects = await this.repo.getDepartmentSubjects(departmentId, semesterNumber);

    return subjects.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      credits: s.credits ?? 3,
      semesterNumber: s.semester_number,
      isActive: s.is_active ?? true,
      departmentId: s.department_id,
    }));
  }

  async getAcademicYears(collegeId: string): Promise<AcademicYearInfo[]> {
    const years = await this.repo.getAcademicYears(collegeId);

    return years.map((y) => ({
      id: y.id,
      name: y.name,
      startDate: y.start_date,
      endDate: y.end_date,
      isCurrent: y.is_current ?? false,
      status: 'ACTIVE',
    }));
  }

  async getSemesters(collegeId: string): Promise<SemesterInfo[]> {
    const semesters = await this.repo.getSemesters(collegeId);

    return semesters.map((s) => ({
      id: s.id,
      academicYearId: s.academic_year_id,
      academicYearName: s.academic_year.name,
      termNumber: s.term_number,
      startDate: s.start_date,
      endDate: s.end_date,
      isCurrent: false,
    }));
  }

  async search(uid: string, query: string): Promise<FacultySearchResults> {
    return this.repo.searchAll(uid, query);
  }

  async getAttendanceSession(classId: string, date: string, period: string): Promise<AttendanceSessionDetail> {
    return this.repo.getAttendanceSession(classId, date, period);
  }

  async saveAttendanceSession(facultyUid: string, input: MarkAttendanceSessionInput) {
    return this.repo.saveAttendanceSession(facultyUid, input);
  }

  async getClassAttendanceStats(classId: string): Promise<ClassAttendanceStatsResponse> {
    return this.repo.getClassAttendanceStats(classId);
  }

  async getClassAttendanceHistory(classId: string): Promise<AttendanceSessionSummary[]> {
    return this.repo.getClassAttendanceHistory(classId);
  }
}



export interface FacultyDashboardData {
  faculty: {
    uid: string;
    name: string;
    email: string;
    phone: string | null;
    employeeId: string | null;
    designation: string | null;
    profilePhoto: string | null;
  };
  department: {
    id: string | null;
    name: string | null;
    code: string | null;
    hodName: string | null;
  } | null;
  classIncharge: {
    isAssigned: boolean;
    class: {
      id: string;
      name: string;
      currentSemester: number | null;
      batch: string | null;
      program: string | null;
      studentCount: number;
    } | null;
  };
  academicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
  semester: {
    id: string;
    termNumber: number;
    startDate: string;
    endDate: string;
  } | null;
}

export interface FacultyProfile {
  id: string;
  uid: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  employeeId: string | null;
  designation: string | null;
  department: string | null;
  departmentId: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  profilePhoto: string | null;
  accountStatus: string;
}

export interface FacultyProfileUpdateInput {
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  bio?: string | null;
  profilePhoto?: string | null;
}

export interface FacultyClassSummary {
  id: string;
  name: string;
  batch: string | null;
  program: string | null;
  department: string | null;
  currentSemester: number | null;
  isActive: boolean;
  inchargeFaculty: {
    uid: string;
    name: string;
  } | null;
  studentCount: number;
}

export interface ClassStudentSummary {
  uid: string;
  name: string;
  registerNumber: string | null;
  email: string;
  phone: string | null;
  profilePhoto: string | null;
  accountStatus: string;
}

export interface StudentDetails {
  uid: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  registerNumber: string | null;
  email: string;
  phone: string | null;
  profilePhoto: string | null;
  accountStatus: string;
  className: string;
  classId: string;
  departmentName: string | null;
  enrollmentYear: number | null;
  city: string | null;
  state: string | null;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  code: string;
  collegeName: string | null;
  hodName: string | null;
  programs: Array<{
    id: string;
    name: string;
    type: string;
    durationYears: number;
  }>;
  subjectsCount: number;
  status: string;
}

export interface SubjectInfo {
  id: string;
  name: string;
  code: string;
  credits: number;
  semesterNumber: number;
  isActive: boolean;
  departmentId: string;
}

export interface AcademicYearInfo {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: string;
}

export interface SemesterInfo {
  id: string;
  academicYearId: string;
  academicYearName: string;
  termNumber: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface FacultySearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'class' | 'student' | 'subject' | 'academic' | 'page';
  url: string;
  meta?: string;
}

export interface FacultySearchResults {
  classes: FacultySearchResultItem[];
  students: FacultySearchResultItem[];
  subjects: FacultySearchResultItem[];
  academicYears: FacultySearchResultItem[];
}


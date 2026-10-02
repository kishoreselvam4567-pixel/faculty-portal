import axios from 'axios';
import {
  FacultyDashboardData,
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
} from '../types/faculty.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Firebase token or dev UID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('faculty_auth_token');
  const devUid = localStorage.getItem('faculty_dev_uid') || 'D679ftp5r9QC8zzybJkGAokVZ2d2';

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (devUid) {
    config.headers['x-dev-uid'] = devUid;
  }
  return config;
});

export const facultyApi = {
  // Dashboard
  getDashboard: async (): Promise<FacultyDashboardData> => {
    const res = await api.get<FacultyDashboardData>('/faculty/dashboard');
    return res.data;
  },

  // Profile
  getProfile: async (): Promise<FacultyProfile> => {
    const res = await api.get<FacultyProfile>('/faculty/profile');
    return res.data;
  },

  updateProfile: async (data: FacultyProfileUpdateInput): Promise<FacultyProfile> => {
    const res = await api.patch<FacultyProfile>('/faculty/profile', data);
    return res.data;
  },

  // Department
  getDepartment: async (): Promise<DepartmentInfo> => {
    const res = await api.get<DepartmentInfo>('/faculty/department');
    return res.data;
  },

  // Classes
  getAssignedClasses: async (): Promise<FacultyClassSummary[]> => {
    const res = await api.get<FacultyClassSummary[]>('/faculty/classes');
    return res.data;
  },

  getClassDetails: async (classId: string): Promise<FacultyClassSummary> => {
    const res = await api.get<FacultyClassSummary>(`/faculty/classes/${classId}`);
    return res.data;
  },

  getClassStudents: async (classId: string): Promise<ClassStudentSummary[]> => {
    const res = await api.get<ClassStudentSummary[]>(`/faculty/classes/${classId}/students`);
    return res.data;
  },

  // Students
  getStudentDetails: async (studentId: string): Promise<StudentDetails> => {
    const res = await api.get<StudentDetails>(`/faculty/students/${studentId}`);
    return res.data;
  },

  // Subjects
  getSubjects: async (semester?: number): Promise<SubjectInfo[]> => {
    const params = semester ? { semester } : {};
    const res = await api.get<SubjectInfo[]>('/faculty/subjects', { params });
    return res.data;
  },

  // Academic
  getAcademicYears: async (): Promise<AcademicYearInfo[]> => {
    const res = await api.get<AcademicYearInfo[]>('/faculty/academic-years');
    return res.data;
  },

  getSemesters: async (): Promise<SemesterInfo[]> => {
    const res = await api.get<SemesterInfo[]>('/faculty/semesters');
    return res.data;
  },

  // Global search
  search: async (query: string): Promise<FacultySearchResults> => {
    const res = await api.get<FacultySearchResults>('/faculty/search', {
      params: { q: query },
    });
    return res.data;
  },

  // Dev user list
  getDevUsers: async () => {
    const res = await api.get('/auth/users-list');
    return res.data;
  },
};

export default api;

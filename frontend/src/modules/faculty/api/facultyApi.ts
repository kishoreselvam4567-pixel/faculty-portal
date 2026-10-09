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
  AttendanceSessionDetail,
  MarkAttendanceSessionInput,
  AttendanceSessionSummary,
  ClassAttendanceStatsResponse,
  TodayRemindersSummary,
  ChatConversationSummary,
  ChatMessage,
  ChatRequestPayload,
  ChatResponsePayload,
  FacultyTaskItem,
  FacultyEmailDraftItem,
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

  // Attendance
  getAttendanceSession: async (classId: string, date: string, period: string): Promise<AttendanceSessionDetail> => {
    const res = await api.get<AttendanceSessionDetail>('/faculty/attendance/session', {
      params: { classId, date, period },
    });
    return res.data;
  },

  saveAttendanceSession: async (input: MarkAttendanceSessionInput): Promise<{ success: boolean; count: number }> => {
    const res = await api.post<{ success: boolean; count: number }>('/faculty/attendance/session', input);
    return res.data;
  },

  getClassAttendanceStats: async (classId: string): Promise<ClassAttendanceStatsResponse> => {
    const res = await api.get<ClassAttendanceStatsResponse>(`/faculty/attendance/stats/${classId}`);
    return res.data;
  },

  getClassAttendanceHistory: async (classId: string): Promise<AttendanceSessionSummary[]> => {
    const res = await api.get<AttendanceSessionSummary[]>(`/faculty/attendance/history/${classId}`);
    return res.data;
  },

  // Today's Reminders
  getTodayReminders: async (): Promise<TodayRemindersSummary> => {
    const res = await api.get<TodayRemindersSummary>('/faculty/today-reminders');
    return res.data;
  },

  // AI Assistant Endpoints
  getConversations: async (): Promise<ChatConversationSummary[]> => {
    const res = await api.get<ChatConversationSummary[]>('/faculty/assistant/conversations');
    return res.data;
  },

  createConversation: async (title?: string): Promise<ChatConversationSummary> => {
    const res = await api.post<ChatConversationSummary>('/faculty/assistant/conversations', { title });
    return res.data;
  },

  getConversationMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const res = await api.get<ChatMessage[]>(`/faculty/assistant/conversations/${conversationId}/messages`);
    return res.data;
  },

  renameConversation: async (conversationId: string, title: string): Promise<ChatConversationSummary> => {
    const res = await api.patch<ChatConversationSummary>(`/faculty/assistant/conversations/${conversationId}`, { title });
    return res.data;
  },

  deleteConversation: async (conversationId: string): Promise<{ success: boolean }> => {
    const res = await api.delete<{ success: boolean }>(`/faculty/assistant/conversations/${conversationId}`);
    return res.data;
  },

  sendChatMessage: async (payload: ChatRequestPayload): Promise<ChatResponsePayload> => {
    const res = await api.post<ChatResponsePayload>('/faculty/assistant/chat', payload);
    return res.data;
  },

  // Tasks Management
  getTasks: async (): Promise<FacultyTaskItem[]> => {
    const res = await api.get<FacultyTaskItem[]>('/faculty/tasks');
    return res.data;
  },

  createTask: async (task: Partial<FacultyTaskItem>): Promise<FacultyTaskItem> => {
    const res = await api.post<FacultyTaskItem>('/faculty/tasks', task);
    return res.data;
  },

  updateTask: async (taskId: string, updates: Partial<FacultyTaskItem>): Promise<FacultyTaskItem> => {
    const res = await api.patch<FacultyTaskItem>(`/faculty/tasks/${taskId}`, updates);
    return res.data;
  },

  deleteTask: async (taskId: string): Promise<{ success: boolean }> => {
    const res = await api.delete<{ success: boolean }>(`/faculty/tasks/${taskId}`);
    return res.data;
  },

  // Email Drafts & Sending
  getEmailDrafts: async (): Promise<FacultyEmailDraftItem[]> => {
    const res = await api.get<FacultyEmailDraftItem[]>('/faculty/email/drafts');
    return res.data;
  },

  createEmailDraft: async (draft: Partial<FacultyEmailDraftItem>): Promise<FacultyEmailDraftItem> => {
    const res = await api.post<FacultyEmailDraftItem>('/faculty/email/drafts', draft);
    return res.data;
  },

  sendEmail: async (data: { draftId?: string; recipients: string[]; subject: string; body: string }): Promise<{ success: boolean; messageId?: string }> => {
    const res = await api.post<{ success: boolean; messageId?: string }>('/faculty/email/send', data);
    return res.data;
  },

  // Dev user list
  getDevUsers: async () => {
    const res = await api.get('/auth/users-list');
    return res.data;
  },
};

export default api;

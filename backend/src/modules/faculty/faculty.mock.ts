export interface MockProfile {
  id: string;
  displayName: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  profilePhotoUrl: string | null;
  updatedAt: Date;
}

export interface MockUser {
  id: string;
  firebaseUid: string;
  email: string;
  phone: string | null;
  collegeId: string;
  status: string;
  profiles: MockProfile | null;
}

export const devMockUsers: Record<string, any> = {
  'D679ftp5r9QC8zzybJkGAokVZ2d2': {
    uid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
    email: 'dr.karthik.cse@college.edu',
    display_name: 'Dr. Karthik S',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    role: 'FACULTY',
    college_id: 'col-01',
    department_id: 'dept-cse-01',
    register_number: null,
    approval_status: 'APPROVED',
    department: {
      id: 'dept-cse-01',
      name: 'Department of Computer Science & Engineering',
      code: 'CSE',
    },
    assigned_classes: [
      {
        id: 'cls-cse-2022-a',
        name: 'B.E CSE - IV Year Sec A',
        current_semester: 7,
      },
    ],
  },
  'FACULTY_MEENAKSHI_02': {
    uid: 'FACULTY_MEENAKSHI_02',
    email: 'meenakshi.raman@college.edu',
    display_name: 'Prof. Meenakshi Raman',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    role: 'FACULTY',
    college_id: 'col-01',
    department_id: 'dept-cse-01',
    register_number: null,
    approval_status: 'APPROVED',
    department: {
      id: 'dept-cse-01',
      name: 'Department of Computer Science & Engineering',
      code: 'CSE',
    },
    assigned_classes: [],
  },
  'HOD_ANNAMALAI_01': {
    uid: 'HOD_ANNAMALAI_01',
    email: 'hod.cse@college.edu',
    display_name: 'Dr. S. Annamalai (HOD)',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    role: 'HOD',
    college_id: 'col-01',
    department_id: 'dept-cse-01',
    register_number: null,
    approval_status: 'APPROVED',
    department: {
      id: 'dept-cse-01',
      name: 'Department of Computer Science & Engineering',
      code: 'CSE',
    },
    assigned_classes: [],
  },
};

export const devMockProfiles: Record<string, MockUser> = {
  'D679ftp5r9QC8zzybJkGAokVZ2d2': {
    id: 'user-fac-01',
    firebaseUid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
    email: 'dr.karthik.cse@college.edu',
    phone: '+91 98452 10982',
    collegeId: 'col-01',
    status: 'ACTIVE',
    profiles: {
      id: 'prof-01',
      displayName: 'Dr. Karthik S',
      phone: '+91 98452 10982',
      address: '42, Academic Staff Quarters, College Campus',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      bio: 'Associate Professor & Class Incharge. Specializes in Cloud Computing, Distributed Systems, and Microservices Architecture.',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      updatedAt: new Date(),
    },
  },
};

export const devMockDepartment = {
  id: 'dept-cse-01',
  name: 'Department of Computer Science & Engineering',
  code: 'CSE',
  college: {
    name: 'National College of Engineering & Technology',
  },
  programs: [
    { id: 'prog-01', name: 'B.E. Computer Science & Engineering', type: 'UG', duration_years: 4 },
    { id: 'prog-02', name: 'M.E. Computer Science & Engineering', type: 'PG', duration_years: 2 },
    { id: 'prog-03', name: 'Ph.D. in Computer Science', type: 'Doctoral', duration_years: 3 },
  ],
  authed_users_departments_hod_uidToauthed_users: {
    display_name: 'Dr. S. Annamalai, Ph.D.',
  },
  _count: {
    subjects: 24,
  },
};

export const devMockClass = {
  id: 'cls-cse-2022-a',
  batch_id: 'batch-2022-2026',
  name: 'B.E CSE - IV Year Sec A',
  current_semester: 7,
  faculty_uid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
  is_active: true,
  created_at: new Date('2022-08-01'),
  batch: {
    id: 'batch-2022-2026',
    start_year: 2022,
    end_year: 2026,
    is_active: true,
    program: {
      id: 'prog-01',
      name: 'B.E. Computer Science & Engineering',
      type: 'UG',
      department: {
        id: 'dept-cse-01',
        name: 'Department of Computer Science & Engineering',
        code: 'CSE',
      },
    },
  },
  incharge_faculty: {
    uid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
    display_name: 'Dr. Karthik S',
    email: 'dr.karthik.cse@college.edu',
  },
  _count: {
    students: 6,
  },
};

export const devMockStudents = [
  {
    uid: 'stu-710022104001',
    display_name: 'Aarav Sharma',
    email: 'aarav.sharma@student.college.edu',
    photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    register_number: '710022104001',
    approval_status: 'APPROVED',
    phone: '+91 98450 11001',
    className: 'B.E CSE - IV Year Sec A',
    classId: 'cls-cse-2022-a',
    departmentName: 'Computer Science & Engineering',
    enrollmentYear: 2022,
    city: 'Chennai',
    state: 'Tamil Nadu',
  },
  {
    uid: 'stu-710022104002',
    display_name: 'Diya Patel',
    email: 'diya.patel@student.college.edu',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    register_number: '710022104002',
    approval_status: 'APPROVED',
    phone: '+91 98450 11002',
    className: 'B.E CSE - IV Year Sec A',
    classId: 'cls-cse-2022-a',
    departmentName: 'Computer Science & Engineering',
    enrollmentYear: 2022,
    city: 'Coimbatore',
    state: 'Tamil Nadu',
  },
  {
    uid: 'stu-710022104003',
    display_name: 'Rohan Verma',
    email: 'rohan.verma@student.college.edu',
    photo_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    register_number: '710022104003',
    approval_status: 'APPROVED',
    phone: '+91 98450 11003',
    className: 'B.E CSE - IV Year Sec A',
    classId: 'cls-cse-2022-a',
    departmentName: 'Computer Science & Engineering',
    enrollmentYear: 2022,
    city: 'Bangalore',
    state: 'Karnataka',
  },
  {
    uid: 'stu-710022104004',
    display_name: 'Ananya Iyer',
    email: 'ananya.iyer@student.college.edu',
    photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    register_number: '710022104004',
    approval_status: 'APPROVED',
    phone: '+91 98450 11004',
    className: 'B.E CSE - IV Year Sec A',
    classId: 'cls-cse-2022-a',
    departmentName: 'Computer Science & Engineering',
    enrollmentYear: 2022,
    city: 'Madurai',
    state: 'Tamil Nadu',
  },
  {
    uid: 'stu-710022104005',
    display_name: 'Karthik Raja',
    email: 'karthik.raja@student.college.edu',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    register_number: '710022104005',
    approval_status: 'APPROVED',
    phone: '+91 98450 11005',
    className: 'B.E CSE - IV Year Sec A',
    classId: 'cls-cse-2022-a',
    departmentName: 'Computer Science & Engineering',
    enrollmentYear: 2022,
    city: 'Salem',
    state: 'Tamil Nadu',
  },
  {
    uid: 'stu-710022104006',
    display_name: 'Sneha Reddy',
    email: 'sneha.reddy@student.college.edu',
    photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
    register_number: '710022104006',
    approval_status: 'APPROVED',
    phone: '+91 98450 11006',
    className: 'B.E CSE - IV Year Sec A',
    classId: 'cls-cse-2022-a',
    departmentName: 'Computer Science & Engineering',
    enrollmentYear: 2022,
    city: 'Hyderabad',
    state: 'Telangana',
  },
];

export const devMockSubjects = [
  { id: 'sub-01', name: 'Cloud Computing & Virtualization', code: 'CS701', credits: 4, semester_number: 7, is_active: true, department_id: 'dept-cse-01' },
  { id: 'sub-02', name: 'Cryptography & Network Security', code: 'CS702', credits: 4, semester_number: 7, is_active: true, department_id: 'dept-cse-01' },
  { id: 'sub-03', name: 'Deep Learning & Neural Networks', code: 'CS703', credits: 3, semester_number: 7, is_active: true, department_id: 'dept-cse-01' },
  { id: 'sub-04', name: 'Cloud Computing Laboratory', code: 'CS711', credits: 2, semester_number: 7, is_active: true, department_id: 'dept-cse-01' },
  { id: 'sub-05', name: 'Security & Penetration Testing Lab', code: 'CS712', credits: 2, semester_number: 7, is_active: true, department_id: 'dept-cse-01' },
  { id: 'sub-06', name: 'Distributed Systems & Microservices', code: 'CS801', credits: 4, semester_number: 8, is_active: true, department_id: 'dept-cse-01' },
  { id: 'sub-07', name: 'Capstone Project Phase II', code: 'CS811', credits: 10, semester_number: 8, is_active: true, department_id: 'dept-cse-01' },
];

export const devMockAcademicYear = {
  id: 'ay-2025-2026',
  name: 'Academic Year 2025 - 2026',
  start_date: new Date('2025-06-01T00:00:00Z'),
  end_date: new Date('2026-05-31T00:00:00Z'),
  is_current: true,
  college_id: 'col-01',
  semesters: [
    {
      id: 'sem-07',
      term_number: 7,
      start_date: new Date('2025-06-15T00:00:00Z'),
      end_date: new Date('2025-11-30T00:00:00Z'),
      academic_year_id: 'ay-2025-2026',
    },
    {
      id: 'sem-08',
      term_number: 8,
      start_date: new Date('2025-12-15T00:00:00Z'),
      end_date: new Date('2026-05-15T00:00:00Z'),
      academic_year_id: 'ay-2025-2026',
    },
  ],
};

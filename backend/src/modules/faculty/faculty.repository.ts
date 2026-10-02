import { prisma, isDatabaseAvailable, markDatabaseUnavailable } from '../../lib/prisma';
import { FacultyProfileUpdateInput } from './faculty.types';

// Original authentic developer context for offline development
const defaultOriginalAuthedUser = {
  uid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
  email: 'amirthavarsshan0806@gmail.com',
  display_name: 'Amirtha Varsshan',
  photo_url: 'https://lh3.googleusercontent.com/a/ACg8ocIZT0mWV7ImfTPyYg-2U3ErKUqIgVhK-3I7hKa9mo63pVi5Rg=s96-c',
  role: 'FACULTY',
  college_id: 'col-1790654578727-zhdd',
  department_id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
  register_number: null,
  approval_status: 'ACTIVE',
  department: {
    id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
    name: 'Bsc AI and ML',
    code: 'AIML',
  },
  assigned_classes: [
    {
      id: 'cls-aiml-2023-a',
      name: 'B.Sc AI & ML - III Year Sec A',
      current_semester: 5,
    },
  ],
};

const defaultOriginalUserProfile: any = {
  id: 'usr-aiml-01',
  firebaseUid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
  email: 'amirthavarsshan0806@gmail.com',
  phone: '+91 98765 43210',
  collegeId: 'col-1790654578727-zhdd',
  status: 'ACTIVE',
  profiles: {
    id: 'prof-aiml-01',
    displayName: 'Amirtha Varsshan',
    firstName: 'Amirtha',
    lastName: 'Varsshan',
    phone: '+91 98765 43210',
    address: '42 Tech Campus Road',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    bio: 'Assistant Professor & Faculty Incharge, Department of B.Sc AI & ML. Specializing in Deep Learning and Natural Language Processing.',
    profilePhotoUrl: 'https://lh3.googleusercontent.com/a/ACg8ocIZT0mWV7ImfTPyYg-2U3ErKUqIgVhK-3I7hKa9mo63pVi5Rg=s96-c',
    employeeId: 'EMP-AIML-0806',
    designation: 'Assistant Professor',
    department: 'Bsc AI and ML',
    updatedAt: new Date(),
  },
};

const defaultOriginalClass = {
  id: 'cls-aiml-2023-a',
  name: 'B.Sc AI & ML - III Year Sec A',
  current_semester: 5,
  is_active: true,
  faculty_uid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
  batch: {
    id: 'batch-aiml-2023',
    start_year: 2023,
    end_year: 2026,
    program: {
      id: 'prog-aiml-01',
      name: 'B.Sc Artificial Intelligence & Machine Learning',
      department: {
        id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
        name: 'Bsc AI and ML',
        code: 'AIML',
      },
    },
  },
  incharge_faculty: {
    uid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
    display_name: 'Amirtha Varsshan',
    email: 'amirthavarsshan0806@gmail.com',
  },
  _count: {
    students: 36,
  },
};

const defaultOriginalStudents = [
  {
    uid: 'std-aiml-01',
    display_name: 'Aadhavan K',
    email: 'aadhavan.aiml23@college.edu',
    photo_url: null,
    register_number: '710023AIML001',
    approval_status: 'ACTIVE',
    classId: 'cls-aiml-2023-a',
    className: 'B.Sc AI & ML - III Year Sec A',
    enrollmentYear: 2023,
    phone: '+91 94431 12345',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    departmentName: 'Bsc AI and ML',
  },
  {
    uid: 'std-aiml-02',
    display_name: 'Bhavana S',
    email: 'bhavana.aiml23@college.edu',
    photo_url: null,
    register_number: '710023AIML002',
    approval_status: 'ACTIVE',
    classId: 'cls-aiml-2023-a',
    className: 'B.Sc AI & ML - III Year Sec A',
    enrollmentYear: 2023,
    phone: '+91 94431 12346',
    city: 'Chennai',
    state: 'Tamil Nadu',
    departmentName: 'Bsc AI and ML',
  },
  {
    uid: 'std-aiml-03',
    display_name: 'Dharun Kumar R',
    email: 'dharun.aiml23@college.edu',
    photo_url: null,
    register_number: '710023AIML003',
    approval_status: 'ACTIVE',
    classId: 'cls-aiml-2023-a',
    className: 'B.Sc AI & ML - III Year Sec A',
    enrollmentYear: 2023,
    phone: '+91 94431 12347',
    city: 'Erode',
    state: 'Tamil Nadu',
    departmentName: 'Bsc AI and ML',
  },
  {
    uid: 'std-aiml-04',
    display_name: 'Keerthana M',
    email: 'keerthana.aiml23@college.edu',
    photo_url: null,
    register_number: '710023AIML004',
    approval_status: 'ACTIVE',
    classId: 'cls-aiml-2023-a',
    className: 'B.Sc AI & ML - III Year Sec A',
    enrollmentYear: 2023,
    phone: '+91 94431 12348',
    city: 'Salem',
    state: 'Tamil Nadu',
    departmentName: 'Bsc AI and ML',
  },
  {
    uid: 'std-aiml-05',
    display_name: 'Praveen Raj V',
    email: 'praveen.aiml23@college.edu',
    photo_url: null,
    register_number: '710023AIML005',
    approval_status: 'ACTIVE',
    classId: 'cls-aiml-2023-a',
    className: 'B.Sc AI & ML - III Year Sec A',
    enrollmentYear: 2023,
    phone: '+91 94431 12349',
    city: 'Madurai',
    state: 'Tamil Nadu',
    departmentName: 'Bsc AI and ML',
  },
];

const defaultOriginalDepartment = {
  id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
  college_id: 'col-1790654578727-zhdd',
  name: 'Bsc AI and ML',
  code: 'AIML',
  is_active: true,
  college: {
    id: 'col-1790654578727-zhdd',
    name: 'College of Engineering & Technology',
  },
  programs: [
    {
      id: 'prog-aiml-01',
      name: 'B.Sc Artificial Intelligence & Machine Learning',
      type: 'UNDERGRADUATE',
      duration_years: 3,
    },
  ],
  authed_users_departments_hod_uidToauthed_users: {
    uid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
    display_name: 'Amirtha Varsshan',
  },
  _count: {
    subjects: 6,
  },
};

const defaultOriginalSubjects = [
  {
    id: 'sub-aiml-501',
    department_id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
    name: 'Machine Learning Techniques',
    code: 'AIML501',
    credits: 4,
    semester_number: 5,
    is_active: true,
  },
  {
    id: 'sub-aiml-502',
    department_id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
    name: 'Deep Learning Architectures',
    code: 'AIML502',
    credits: 4,
    semester_number: 5,
    is_active: true,
  },
  {
    id: 'sub-aiml-503',
    department_id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
    name: 'Natural Language Processing',
    code: 'AIML503',
    credits: 3,
    semester_number: 5,
    is_active: true,
  },
  {
    id: 'sub-aiml-504',
    department_id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
    name: 'Computer Vision & Robotics',
    code: 'AIML504',
    credits: 3,
    semester_number: 5,
    is_active: true,
  },
  {
    id: 'sub-aiml-505',
    department_id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
    name: 'AI Ethics and Governance',
    code: 'AIML505',
    credits: 2,
    semester_number: 5,
    is_active: true,
  },
  {
    id: 'sub-aiml-506',
    department_id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
    name: 'Applied Machine Learning Lab',
    code: 'AIML506P',
    credits: 2,
    semester_number: 5,
    is_active: true,
  },
];

const defaultOriginalAcademicYear = {
  id: 'ay-2024-2025',
  college_id: 'col-1790654578727-zhdd',
  name: 'Academic Year 2024 - 2025',
  start_date: new Date('2024-06-15'),
  end_date: new Date('2025-05-30'),
  is_current: true,
  semesters: [
    {
      id: 'sem-2024-odd',
      academic_year_id: 'ay-2024-2025',
      term_number: 5,
      start_date: new Date('2024-06-15'),
      end_date: new Date('2024-11-30'),
      is_current: true,
    },
    {
      id: 'sem-2024-even',
      academic_year_id: 'ay-2024-2025',
      term_number: 6,
      start_date: new Date('2024-12-15'),
      end_date: new Date('2025-05-30'),
      is_current: false,
    },
  ],
};


export class FacultyRepository {
  private isDevMode = process.env.NODE_ENV !== 'production';

  async getAuthedUser(uid: string): Promise<any> {
    if (await isDatabaseAvailable()) {
      try {
        const user = await prisma.authedUser.findUnique({
          where: { uid },
          include: {
            department: true,
          },
        });
        if (user) return user;
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return defaultOriginalAuthedUser;
    }
    return null;
  }

  async getFacultyUserProfile(uid: string): Promise<any> {
    if (await isDatabaseAvailable()) {
      try {
        const user = await prisma.user.findUnique({
          where: { firebaseUid: uid },
          include: {
            profiles: true,
          },
        });
        if (user) return user;
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return defaultOriginalUserProfile;
    }
    return null;
  }

  async updateFacultyProfile(uid: string, input: FacultyProfileUpdateInput): Promise<any> {
    if (await isDatabaseAvailable()) {
      try {
        let user = await prisma.user.findUnique({
          where: { firebaseUid: uid },
          include: { profiles: true },
        });

        if (!user) {
          const authed = await prisma.authedUser.findUnique({ where: { uid } });
          if (!authed && !this.isDevMode) {
            throw new Error('User record not found in authed_users');
          }

          const collegeId = authed?.college_id || 'col-1790654578727-zhdd';
          const email = authed?.email || 'amirthavarsshan0806@gmail.com';
          const displayName = authed?.display_name || 'Amirtha Varsshan';

          user = await prisma.user.create({
            data: {
              firebaseUid: uid,
              email,
              phone: input.phone || null,
              collegeId,
              status: 'ACTIVE',
              updatedAt: new Date(),
              profiles: {
                create: {
                  displayName,
                  phone: input.phone || null,
                  address: input.address || null,
                  city: input.city || null,
                  state: input.state || null,
                  bio: input.bio || null,
                  profilePhotoUrl: input.profilePhoto || null,
                  updatedAt: new Date(),
                },
              },
            },
            include: { profiles: true },
          });
        } else {
          if (input.phone !== undefined) {
            await prisma.user.update({
              where: { id: user.id },
              data: { phone: input.phone },
            });
          }

          if (user.profiles) {
            await prisma.profile.update({
              where: { id: user.profiles.id },
              data: {
                ...(input.phone !== undefined && { phone: input.phone }),
                ...(input.address !== undefined && { address: input.address }),
                ...(input.city !== undefined && { city: input.city }),
                ...(input.state !== undefined && { state: input.state }),
                ...(input.bio !== undefined && { bio: input.bio }),
                ...(input.profilePhoto !== undefined && { profilePhotoUrl: input.profilePhoto }),
                updatedAt: new Date(),
              },
            });
          } else {
            await prisma.profile.create({
              data: {
                userId: user.id,
                phone: input.phone || null,
                address: input.address || null,
                city: input.city || null,
                state: input.state || null,
                bio: input.bio || null,
                profilePhotoUrl: input.profilePhoto || null,
                updatedAt: new Date(),
              },
            });
          }
        }

        if (input.profilePhoto) {
          await prisma.authedUser.update({
            where: { uid },
            data: { photo_url: input.profilePhoto },
          }).catch(() => {});
        }

        return this.getFacultyUserProfile(uid);
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    // In dev fallback mode, update in-memory profile
    const profile: any = defaultOriginalUserProfile.profiles;
    if (input.phone !== undefined) {
      defaultOriginalUserProfile.phone = input.phone || null;
      profile.phone = input.phone || null;
    }
    if (input.address !== undefined) profile.address = input.address || null;
    if (input.city !== undefined) profile.city = input.city || null;
    if (input.state !== undefined) profile.state = input.state || null;
    if (input.bio !== undefined) profile.bio = input.bio || null;
    if (input.profilePhoto !== undefined) profile.profilePhotoUrl = input.profilePhoto || null;
    profile.updatedAt = new Date();

    return defaultOriginalUserProfile;
  }

  async getAssignedClasses(facultyUid: string): Promise<any[]> {
    if (await isDatabaseAvailable()) {
      try {
        const classes = await prisma.class.findMany({
          where: {
            faculty_uid: facultyUid,
            is_active: true,
          },
          include: {
            batch: {
              include: {
                program: {
                  include: {
                    department: true,
                  },
                },
              },
            },
            _count: {
              select: {
                students: true,
              },
            },
          },
        });
        if (classes) return classes;
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return [defaultOriginalClass];
    }
    return [];
  }

  async getClassById(classId: string): Promise<any> {
    if (await isDatabaseAvailable()) {
      try {
        const cls = await prisma.class.findUnique({
          where: { id: classId },
          include: {
            batch: {
              include: {
                program: {
                  include: {
                    department: true,
                  },
                },
              },
            },
            incharge_faculty: true,
            _count: {
              select: {
                students: true,
              },
            },
          },
        });
        if (cls) return cls;
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return defaultOriginalClass;
    }
    return null;
  }

  async getClassStudents(classId: string): Promise<any[]> {
    if (await isDatabaseAvailable()) {
      try {
        const students = await prisma.authedUser.findMany({
          where: {
            class_id: classId,
          },
          select: {
            uid: true,
            display_name: true,
            email: true,
            photo_url: true,
            register_number: true,
            approval_status: true,
          },
        });
        if (students) return students;
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return defaultOriginalStudents;
    }
    return [];
  }

  async getStudentByUid(studentUid: string): Promise<any> {
    if (await isDatabaseAvailable()) {
      try {
        const authedStudent = await prisma.authedUser.findUnique({
          where: { uid: studentUid },
          include: {
            class: {
              include: {
                batch: {
                  include: {
                    program: {
                      include: {
                        department: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        const userProfile = await prisma.user.findUnique({
          where: { firebaseUid: studentUid },
          include: {
            profiles: true,
          },
        });

        if (authedStudent) {
          return { authedStudent, userProfile };
        }
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      const found = defaultOriginalStudents.find((s) => s.uid === studentUid) || defaultOriginalStudents[0];
      return {
        authedStudent: {
          uid: found.uid,
          display_name: found.display_name,
          email: found.email,
          photo_url: found.photo_url,
          register_number: found.register_number,
          approval_status: found.approval_status,
          class_id: found.classId,
          class: {
            id: found.classId,
            name: found.className,
            batch: {
              start_year: found.enrollmentYear,
              program: {
                department: {
                  name: found.departmentName,
                },
              },
            },
          },
        },
        userProfile: {
          phone: found.phone,
          profiles: {
            phone: found.phone,
            city: found.city,
            state: found.state,
          },
        },
      };
    }
    return null;
  }

  async getDepartmentById(departmentId: string): Promise<any> {
    if (await isDatabaseAvailable()) {
      try {
        const dept = await prisma.department.findUnique({
          where: { id: departmentId },
          include: {
            college: true,
            programs: true,
            authed_users_departments_hod_uidToauthed_users: true,
            _count: {
              select: {
                subjects: true,
              },
            },
          },
        });
        if (dept) return dept;
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return defaultOriginalDepartment;
    }
    return null;
  }

  async getDepartmentSubjects(departmentId: string, semesterNumber?: number): Promise<any[]> {
    if (await isDatabaseAvailable()) {
      try {
        const subjects = await prisma.subject.findMany({
          where: {
            department_id: departmentId,
            ...(semesterNumber ? { semester_number: semesterNumber } : {}),
          },
          orderBy: [
            { semester_number: 'asc' },
            { code: 'asc' },
          ],
        });
        if (subjects) return subjects;
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      if (semesterNumber) {
        return defaultOriginalSubjects.filter((s) => s.semester_number === semesterNumber);
      }
      return defaultOriginalSubjects;
    }
    return [];
  }

  async getAcademicYears(collegeId: string): Promise<any[]> {
    if (await isDatabaseAvailable()) {
      try {
        const years = await prisma.academicYear.findMany({
          where: { college_id: collegeId },
          include: {
            semesters: {
              orderBy: { term_number: 'asc' },
            },
          },
          orderBy: { start_date: 'desc' },
        });
        if (years) return years;
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return [defaultOriginalAcademicYear];
    }
    return [];
  }

  async getCurrentAcademicYear(collegeId: string): Promise<any> {
    if (await isDatabaseAvailable()) {
      try {
        const year = await prisma.academicYear.findFirst({
          where: {
            college_id: collegeId,
            is_current: true,
          },
          include: {
            semesters: true,
          },
        });
        if (year) return year;
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return defaultOriginalAcademicYear;
    }
    return null;
  }

  async getSemesters(collegeId: string): Promise<any[]> {
    if (await isDatabaseAvailable()) {
      try {
        const sems = await prisma.semester.findMany({
          where: {
            academic_year: {
              college_id: collegeId,
            },
          },
          include: {
            academic_year: true,
          },
          orderBy: [
            { academic_year: { start_date: 'desc' } },
            { term_number: 'asc' },
          ],
        });
        if (sems) return sems;
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return defaultOriginalAcademicYear.semesters.map((s) => ({
        id: s.id,
        term_number: s.term_number,
        start_date: s.start_date,
        end_date: s.end_date,
        is_current: s.term_number === 5,
        academic_year: {
          id: defaultOriginalAcademicYear.id,
          name: defaultOriginalAcademicYear.name,
          start_date: defaultOriginalAcademicYear.start_date,
          end_date: defaultOriginalAcademicYear.end_date,
        },
      }));
    }
    return [];
  }
}

import { prisma } from '../../lib/prisma';
import { FacultyProfileUpdateInput } from './faculty.types';

export class FacultyRepository {
  async getAuthedUser(uid: string) {
    return prisma.authedUser.findUnique({
      where: { uid },
      include: {
        department: true,
      },
    });
  }

  async getFacultyUserProfile(uid: string) {
    return prisma.user.findUnique({
      where: { firebaseUid: uid },
      include: {
        profiles: true,
      },
    });
  }

  async updateFacultyProfile(uid: string, input: FacultyProfileUpdateInput) {
    // 1. Check if user record exists in `users`
    let user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
      include: { profiles: true },
    });

    // If user does not exist in `users` table yet, create it from authedUser data
    if (!user) {
      const authed = await prisma.authedUser.findUnique({ where: { uid } });
      if (!authed) throw new Error('User record not found in authed_users');

      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email: authed.email,
          phone: input.phone || null,
          collegeId: authed.college_id,
          status: 'ACTIVE',
          updatedAt: new Date(),
          profiles: {
            create: {
              displayName: authed.display_name,
              phone: input.phone || null,
              address: input.address || null,
              city: input.city || null,
              state: input.state || null,
              bio: input.bio || null,
              profilePhotoUrl: input.profilePhoto || authed.photo_url || null,
              updatedAt: new Date(),
            },
          },
        },
        include: { profiles: true },
      });
    } else {
      // Update users phone
      if (input.phone !== undefined) {
        await prisma.user.update({
          where: { id: user.id },
          data: { phone: input.phone },
        });
      }

      // Update or create profile
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

    // Also update authed_users photo_url if provided
    if (input.profilePhoto) {
      await prisma.authedUser.update({
        where: { uid },
        data: { photo_url: input.profilePhoto },
      });
    }

    return this.getFacultyUserProfile(uid);
  }

  async getAssignedClasses(facultyUid: string) {
    return prisma.class.findMany({
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
  }

  async getClassById(classId: string) {
    return prisma.class.findUnique({
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
  }

  async getClassStudents(classId: string) {
    return prisma.authedUser.findMany({
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
  }

  async getStudentByUid(studentUid: string) {
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

    if (!authedStudent) return null;

    const userProfile = await prisma.user.findUnique({
      where: { firebaseUid: studentUid },
      include: {
        profiles: true,
      },
    });

    return {
      authedStudent,
      userProfile,
    };
  }

  async getDepartmentById(departmentId: string) {
    return prisma.department.findUnique({
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
  }

  async getDepartmentSubjects(departmentId: string, semesterNumber?: number) {
    return prisma.subject.findMany({
      where: {
        department_id: departmentId,
        ...(semesterNumber ? { semester_number: semesterNumber } : {}),
      },
      orderBy: [
        { semester_number: 'asc' },
        { code: 'asc' },
      ],
    });
  }

  async getAcademicYears(collegeId: string) {
    return prisma.academicYear.findMany({
      where: { college_id: collegeId },
      include: {
        semesters: {
          orderBy: { term_number: 'asc' },
        },
      },
      orderBy: { start_date: 'desc' },
    });
  }

  async getCurrentAcademicYear(collegeId: string) {
    return prisma.academicYear.findFirst({
      where: {
        college_id: collegeId,
        is_current: true,
      },
      include: {
        semesters: true,
      },
    });
  }

  async getSemesters(collegeId: string) {
    return prisma.semester.findMany({
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
  }

  async searchAll(facultyUid: string, query: string) {
    const q = query.trim();
    if (!q) {
      return { classes: [], students: [], subjects: [], academicYears: [] };
    }

    const authedUser = await this.getAuthedUser(facultyUid);
    const collegeId = authedUser?.college_id || 'col-1790654578727-zhdd';
    const departmentId = authedUser?.department_id;

    // Search classes
    const classes = await prisma.class.findMany({
      where: {
        AND: [
          {
            OR: [
              { faculty_uid: facultyUid },
              ...(departmentId ? [{ batch: { program: { department_id: departmentId } } }] : []),
            ],
          },
          {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { batch: { program: { name: { contains: q, mode: 'insensitive' } } } },
            ],
          },
        ],
      },
      include: {
        batch: {
          include: {
            program: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
      take: 6,
    });

    // Search students
    const students = await prisma.authedUser.findMany({
      where: {
        AND: [
          {
            OR: [
              { class: { faculty_uid: facultyUid } },
              ...(departmentId ? [{ department_id: departmentId }] : []),
            ],
          },
          {
            role: 'STUDENT',
          },
          {
            OR: [
              { display_name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { register_number: { contains: q, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        uid: true,
        display_name: true,
        email: true,
        photo_url: true,
        register_number: true,
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 6,
    });

    // Search subjects
    const subjects = departmentId
      ? await prisma.subject.findMany({
          where: {
            department_id: departmentId,
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { code: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 6,
        })
      : await prisma.subject.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { code: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 6,
        });

    // Search academic years
    const academicYears = collegeId
      ? await prisma.academicYear.findMany({
          where: {
            college_id: collegeId,
            name: { contains: q, mode: 'insensitive' },
          },
          include: {
            semesters: true,
          },
          take: 4,
        })
      : [];

    return {
      classes: classes.map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: `${c.batch?.program?.name || 'Class'} • Sem ${c.current_semester || 1}`,
        category: 'class' as const,
        url: `/classes/${c.id}`,
        meta: `${c._count.students} students`,
      })),
      students: students.map((s) => ({
        id: s.uid,
        title: s.display_name || s.email,
        subtitle: `${s.register_number ? `Reg: ${s.register_number}` : s.email}${s.class?.name ? ` • ${s.class.name}` : ''}`,
        category: 'student' as const,
        url: `/students/${s.uid}`,
        meta: s.register_number || undefined,
      })),
      subjects: subjects.map((sub) => ({
        id: sub.id,
        title: sub.name,
        subtitle: `${sub.code} • Sem ${sub.semester_number} • ${sub.credits || 3} Credits`,
        category: 'subject' as const,
        url: '/subjects',
        meta: sub.code,
      })),
      academicYears: academicYears.map((ay) => ({
        id: ay.id,
        title: ay.name,
        subtitle: `Academic Session • ${ay.semesters.length} Semesters`,
        category: 'academic' as const,
        url: '/academic',
        meta: ay.is_current ? 'Current Session' : undefined,
      })),
    };
  }
}


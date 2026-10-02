import { prisma } from '../../lib/prisma';
import { isDatabaseOnline, markDatabaseOffline } from '../../lib/dbHealth';
import { FacultyProfileUpdateInput } from './faculty.types';
import {
  devMockUsers,
  devMockProfiles,
  devMockDepartment,
  devMockClass,
  devMockStudents,
  devMockSubjects,
  devMockAcademicYear,
} from './faculty.mock';

export class FacultyRepository {
  private isDevMode = process.env.NODE_ENV !== 'production';

  async getAuthedUser(uid: string): Promise<any> {
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        const user = await prisma.authedUser.findUnique({
          where: { uid },
          include: {
            department: true,
          },
        });
        if (user) return user;
      } catch (err: any) {
        markDatabaseOffline();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return devMockUsers[uid] || devMockUsers['D679ftp5r9QC8zzybJkGAokVZ2d2'];
    }
    return null;
  }

  async getFacultyUserProfile(uid: string): Promise<any> {
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        const user = await prisma.user.findUnique({
          where: { firebaseUid: uid },
          include: {
            profiles: true,
          },
        });
        if (user) return user;
      } catch (err: any) {
        markDatabaseOffline();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return devMockProfiles[uid] || devMockProfiles['D679ftp5r9QC8zzybJkGAokVZ2d2'];
    }
    return null;
  }

  async updateFacultyProfile(uid: string, input: FacultyProfileUpdateInput): Promise<any> {
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
      try {
        let user = await prisma.user.findUnique({
          where: { firebaseUid: uid },
          include: { profiles: true },
        });

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
          });
        }

        return this.getFacultyUserProfile(uid);
      } catch (err: any) {
        markDatabaseOffline();
        if (!this.isDevMode) throw err;
      }
    }

    // In dev fallback mode, update in-memory devMockProfiles
    const mock = devMockProfiles[uid] || devMockProfiles['D679ftp5r9QC8zzybJkGAokVZ2d2'];
    if (mock && mock.profiles) {
      if (input.phone !== undefined) {
        mock.phone = input.phone;
        mock.profiles.phone = input.phone;
      }
      if (input.address !== undefined) mock.profiles.address = input.address;
      if (input.city !== undefined) mock.profiles.city = input.city;
      if (input.state !== undefined) mock.profiles.state = input.state;
      if (input.bio !== undefined) mock.profiles.bio = input.bio;
      if (input.profilePhoto !== undefined) mock.profiles.profilePhotoUrl = input.profilePhoto;
      mock.profiles.updatedAt = new Date();
    }
    return mock;
  }

  async getAssignedClasses(facultyUid: string): Promise<any[]> {
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
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
        if (classes && classes.length > 0) return classes;
      } catch (err: any) {
        markDatabaseOffline();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return [devMockClass];
    }
    return [];
  }

  async getClassById(classId: string): Promise<any> {
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
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
        markDatabaseOffline();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return devMockClass;
    }
    return null;
  }

  async getClassStudents(classId: string): Promise<any[]> {
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
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
        if (students && students.length > 0) return students;
      } catch (err: any) {
        markDatabaseOffline();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return devMockStudents;
    }
    return [];
  }

  async getStudentByUid(studentUid: string): Promise<any> {
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
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
        markDatabaseOffline();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      const found = devMockStudents.find((s) => s.uid === studentUid) || devMockStudents[0];
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
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
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
        markDatabaseOffline();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return devMockDepartment;
    }
    return null;
  }

  async getDepartmentSubjects(departmentId: string, semesterNumber?: number): Promise<any[]> {
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
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
        if (subjects && subjects.length > 0) return subjects;
      } catch (err: any) {
        markDatabaseOffline();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      if (semesterNumber) {
        return devMockSubjects.filter((s) => s.semester_number === semesterNumber);
      }
      return devMockSubjects;
    }
    return [];
  }

  async getAcademicYears(collegeId: string): Promise<any[]> {
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
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
        if (years && years.length > 0) return years;
      } catch (err: any) {
        markDatabaseOffline();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return [devMockAcademicYear];
    }
    return [];
  }

  async getCurrentAcademicYear(collegeId: string): Promise<any> {
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
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
        markDatabaseOffline();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return devMockAcademicYear;
    }
    return null;
  }

  async getSemesters(collegeId: string): Promise<any[]> {
    const dbOnline = await isDatabaseOnline();
    if (dbOnline) {
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
        if (sems && sems.length > 0) return sems;
      } catch (err: any) {
        markDatabaseOffline();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return devMockAcademicYear.semesters.map((s) => ({
        id: s.id,
        term_number: s.term_number,
        start_date: s.start_date,
        end_date: s.end_date,
        is_current: s.term_number === 7,
        academic_year: {
          id: devMockAcademicYear.id,
          name: devMockAcademicYear.name,
          start_date: devMockAcademicYear.start_date,
          end_date: devMockAcademicYear.end_date,
        },
      }));
    }
    return [];
  }
}

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import {
  fetchFacultyDashboard,
  fetchFacultyProfile,
  updateFacultyProfile,
  fetchAssignedClasses,
  fetchClassDetails,
  fetchClassStudents,
  fetchDepartment,
  fetchSubjects,
  fetchAcademicInfo,
  clearError,
} from '../slices/facultySlice';
import { FacultyProfileUpdateInput } from '../types/faculty.types';

export const useFaculty = () => {
  const dispatch = useDispatch<AppDispatch>();
  const facultyState = useSelector((state: RootState) => state.faculty);

  return {
    ...facultyState,
    loadDashboard: () => dispatch(fetchFacultyDashboard()),
    loadProfile: () => dispatch(fetchFacultyProfile()),
    saveProfile: (data: FacultyProfileUpdateInput) => dispatch(updateFacultyProfile(data)),
    loadClasses: () => dispatch(fetchAssignedClasses()),
    loadClassDetails: (classId: string) => dispatch(fetchClassDetails(classId)),
    loadClassStudents: (classId: string) => dispatch(fetchClassStudents(classId)),
    loadDepartment: () => dispatch(fetchDepartment()),
    loadSubjects: (semester?: number) => dispatch(fetchSubjects(semester)),
    loadAcademicInfo: () => dispatch(fetchAcademicInfo()),
    resetError: () => dispatch(clearError()),
  };
};

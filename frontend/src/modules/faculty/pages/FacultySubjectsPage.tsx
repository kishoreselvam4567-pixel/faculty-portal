import React, { useEffect, useState } from 'react';
import { useFaculty } from '../hooks/useFaculty';
import { SubjectTable } from '../components/SubjectTable';
import { BookOpen } from 'lucide-react';

export const FacultySubjectsPage: React.FC = () => {
  const { subjects, department, loading, loadSubjects, loadDepartment } = useFaculty();
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>();

  useEffect(() => {
    loadDepartment();
    loadSubjects(selectedSemester);
  }, [selectedSemester]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-brand-400" />
          <span>Department Curriculum & Subjects</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Courses registered under{' '}
          <span className="text-brand-300 font-semibold">{department?.name || 'your department'}</span>.
        </p>
      </div>

      <SubjectTable
        subjects={subjects}
        loading={loading.subjects}
        selectedSemester={selectedSemester}
        onSemesterChange={setSelectedSemester}
      />
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useFaculty } from '../hooks/useFaculty';
import { SubjectTable } from '../components/SubjectTable';
import { BookOpen, Building2 } from 'lucide-react';

export const FacultySubjectsPage: React.FC = () => {
  const { subjects, department, loading, loadSubjects, loadDepartment } = useFaculty();
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>();

  useEffect(() => {
    loadDepartment();
    loadSubjects(selectedSemester);
  }, [selectedSemester]);

  return (
    <div className="space-y-6">
      {/* Page Header (Exact match to screenshot) */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2.5">
          <Building2 className="w-5 h-5 text-slate-800 shrink-0" />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Courses & Curricula
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Faculty curriculum overview, syllabus subjects, and semester course catalog.
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

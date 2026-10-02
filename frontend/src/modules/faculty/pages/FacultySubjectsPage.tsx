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
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#142C44] to-[#15203D] border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/20 shrink-0">
            <BookOpen className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Courses & Curricula
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Faculty curriculum overview, syllabus subjects, and semester course catalog.
            </p>
          </div>
        </div>
        {department?.code && (
          <div className="relative z-10 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-950/40 border border-sky-500/20 text-sky-300 self-start sm:self-auto">
            {department.code} Department
          </div>
        )}
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

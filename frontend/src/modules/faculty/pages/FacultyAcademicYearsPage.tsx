import React, { useEffect } from 'react';
import { useFaculty } from '../hooks/useFaculty';
import { AcademicCalendar } from '../components/AcademicCalendar';
import { Calendar } from 'lucide-react';

export const FacultyAcademicYearsPage: React.FC = () => {
  const { academicYears, semesters, loading, loadAcademicInfo } = useFaculty();

  useEffect(() => {
    loadAcademicInfo();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-400 shrink-0" />
          <span>Academic Sessions & Terms</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2">
          College academic calendar, ongoing session, and semester duration schedules.
        </p>
      </div>

      <AcademicCalendar
        years={academicYears}
        semesters={semesters}
        loading={loading.academic}
      />
    </div>
  );
};

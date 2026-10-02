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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Calendar className="w-8 h-8 text-brand-400" />
          <span>Academic Sessions & Terms</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
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

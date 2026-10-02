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
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2.5">
          <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Academic Sessions & Terms
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
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

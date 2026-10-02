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
      <div className="bg-gradient-to-r from-[#0B132B] via-[#15203D] to-[#1E293B] border border-slate-800 rounded-xl p-6 shadow-md relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Calendar className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Academic Sessions & Terms
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              College academic calendar, ongoing session, and semester duration schedules.
            </p>
          </div>
        </div>
      </div>

      <AcademicCalendar
        years={academicYears}
        semesters={semesters}
        loading={loading.academic}
      />
    </div>
  );
};

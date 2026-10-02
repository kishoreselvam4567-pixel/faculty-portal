import React from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { AcademicYearInfo, SemesterInfo } from '../types/faculty.types';

interface AcademicCalendarProps {
  years: AcademicYearInfo[];
  semesters: SemesterInfo[];
  loading?: boolean;
}

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({
  years,
  semesters,
  loading,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="glass-card rounded-2xl p-6 h-36 animate-pulse" />
        ))}
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Academic Years */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-400" />
          <span>Academic Sessions</span>
        </h3>

        {years.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-400">
            <p className="font-semibold text-white">No academic years available</p>
            <p className="text-xs text-slate-500 mt-1">Academic calendar has not been published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {years.map((year) => (
              <div
                key={year.id}
                className="glass-card rounded-2xl p-5 relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-bold text-white">{year.name}</h4>
                  {year.isCurrent ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                      Current Year
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs text-slate-400 bg-slate-800">
                      {year.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block">Commencement</span>
                    <span className="text-slate-300 font-medium">{formatDate(year.startDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Conclusion</span>
                    <span className="text-slate-300 font-medium">{formatDate(year.endDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Semester Terms */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-400" />
          <span>Semester Timeline</span>
        </h3>

        {semesters.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-400">
            <p className="font-semibold text-white">No semester timeline records</p>
            <p className="text-xs text-slate-500 mt-1">Semesters have not been configured for the current session.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {semesters.map((sem) => (
              <div key={sem.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                    Term {sem.termNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {sem.academicYearName}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Begins:</span>
                    <span className="text-slate-300 font-medium">{formatDate(sem.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ends:</span>
                    <span className="text-slate-300 font-medium">{formatDate(sem.endDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

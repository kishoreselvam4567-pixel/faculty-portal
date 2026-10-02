import React, { useEffect } from 'react';
import { useFaculty } from '../hooks/useFaculty';
import { AssignedClassCard } from '../components/AssignedClassCard';
import { GraduationCap } from 'lucide-react';

export const FacultyClassesPage: React.FC = () => {
  const { classes, loading, error, loadClasses } = useFaculty();

  useEffect(() => {
    loadClasses();
  }, []);

  return (
    <div className="space-y-3.5">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#0E2841] to-[#15203D] border border-slate-800 rounded-xl p-4 sm:p-4.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/20 shrink-0">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Classes & Incharge
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
              Classes for which you are designated as the official Class Incharge.
            </p>
          </div>
        </div>
        <div className="relative z-10 text-xs font-semibold text-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/20 self-start sm:self-auto">
          {classes.length} Assigned Class{classes.length === 1 ? '' : 'es'}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {loading.classes ? (
        <div className="border border-slate-200 rounded-lg bg-white p-12 text-center text-xs text-slate-400 animate-pulse">
          Loading assigned classes...
        </div>
      ) : classes.length === 0 ? (
        <div className="border border-slate-200 rounded bg-white p-20 text-center text-xs text-slate-500">
          No active records found for this module in the current academic session.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((cls) => (
            <AssignedClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      )}
    </div>
  );
};

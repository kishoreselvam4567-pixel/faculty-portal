import React, { useEffect } from 'react';
import { useFaculty } from '../hooks/useFaculty';
import { AssignedClassCard } from '../components/AssignedClassCard';
import { GraduationCap, AlertCircle, ShieldAlert } from 'lucide-react';

export const FacultyClassesPage: React.FC = () => {
  const { classes, loading, error, loadClasses } = useFaculty();

  useEffect(() => {
    loadClasses();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Assigned Classes
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Classes for which you are designated as the official Class Incharge.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading.classes ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 h-56 animate-pulse" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Assigned Class</h3>
            <p className="text-xs text-slate-400">
              You are currently registered as a <span className="text-slate-300 font-semibold">Subject Teacher</span>.
              You have not been assigned as a Class Incharge for any student batch.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5 text-left">
            <ShieldAlert className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <span>
              Per LMS security rules, Class Incharge assignments are controlled by the Department HOD.
              Once assigned, your class roster and enrolled students will automatically appear here.
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((cls) => (
            <AssignedClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      )}
    </div>
  );
};

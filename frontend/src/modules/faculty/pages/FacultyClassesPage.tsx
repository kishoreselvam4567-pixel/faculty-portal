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
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2.5">
          <GraduationCap className="w-5 h-5 text-slate-800 shrink-0" />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Classes & Incharge
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Classes for which you are designated as the official Class Incharge.
        </p>
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

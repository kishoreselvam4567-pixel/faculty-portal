import React from 'react';
import { GraduationCap, Users, Calendar, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { FacultyClassSummary } from '../types/faculty.types';

interface ClassDetailsProps {
  cls: FacultyClassSummary;
}

export const ClassDetails: React.FC<ClassDetailsProps> = ({ cls }) => {
  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <GraduationCap className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-white">{cls.name}</h2>
              <p className="text-xs text-slate-400">{cls.program || 'Degree Program'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            {cls.isActive ? 'Active Class' : 'Inactive'}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/30">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-brand-400" />
            Class Incharge Role
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Batch
          </span>
          <p className="text-lg font-bold text-white mt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-brand-400" />
            {cls.batch || '—'}
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Current Semester
          </span>
          <p className="text-lg font-bold text-white mt-1">
            {cls.currentSemester ? `Semester ${cls.currentSemester}` : '—'}
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Department
          </span>
          <p className="text-lg font-bold text-white mt-1 flex items-center gap-1.5 truncate">
            <Building2 className="w-4 h-4 text-brand-400" />
            {cls.department || '—'}
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Student Strength
          </span>
          <p className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {cls.studentCount} Students
          </p>
        </div>
      </div>
    </div>
  );
};

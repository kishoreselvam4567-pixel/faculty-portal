import React from 'react';
import { Users, GraduationCap, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FacultyClassSummary } from '../types/faculty.types';

interface AssignedClassCardProps {
  cls: FacultyClassSummary;
}

export const AssignedClassCard: React.FC<AssignedClassCardProps> = ({ cls }) => {
  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-brand-500/40 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <GraduationCap className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                {cls.name}
              </h3>
              <p className="text-xs text-slate-400">{cls.program || 'Degree Program'}</p>
            </div>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            cls.isActive
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {cls.isActive ? 'Active' : 'Archived'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 my-5 py-4 border-y border-slate-800/80 text-xs">
        <div>
          <span className="text-slate-500 block">Batch</span>
          <span className="font-semibold text-slate-200 mt-0.5 block">{cls.batch || '—'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Current Semester</span>
          <span className="font-semibold text-slate-200 mt-0.5 block">
            {cls.currentSemester ? `Semester ${cls.currentSemester}` : '—'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Department</span>
          <span className="font-semibold text-slate-200 mt-0.5 block">{cls.department || '—'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Enrolled Students</span>
          <span className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {cls.studentCount} Students
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to={`/classes/${cls.id}`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-slate-700/80"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Class Overview</span>
        </Link>
        <Link
          to={`/classes/${cls.id}/students`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all"
        >
          <Users className="w-3.5 h-3.5" />
          <span>View Students</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

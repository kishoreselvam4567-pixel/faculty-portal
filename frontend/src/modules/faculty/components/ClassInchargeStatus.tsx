import React from 'react';
import { ShieldCheck, AlertCircle, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FacultyDashboardData } from '../types/faculty.types';

interface ClassInchargeStatusProps {
  classIncharge: FacultyDashboardData['classIncharge'] | undefined;
}

export const ClassInchargeStatus: React.FC<ClassInchargeStatusProps> = ({ classIncharge }) => {
  const isAssigned = classIncharge?.isAssigned || false;
  const cls = classIncharge?.class;

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isAssigned
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {isAssigned ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Class Incharge Responsibility</h3>
            <p className="text-xs text-slate-400">
              Derived dynamically from database class assignment
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            isAssigned
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {isAssigned ? 'Active Class Incharge' : 'Subject Teacher'}
        </span>
      </div>

      {isAssigned && cls ? (
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              {cls.name}
              {cls.currentSemester && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Semester {cls.currentSemester}
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-400">
              Batch: <span className="text-slate-300">{cls.batch || 'Current'}</span> • Program:{' '}
              <span className="text-slate-300">{cls.program || 'N/A'}</span>
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
              <Users className="w-3.5 h-3.5" />
              <span>{cls.studentCount} Students Enrolled</span>
            </div>
          </div>

          <Link
            to={`/classes/${cls.id}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all"
          >
            <span>Manage Assigned Class</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 text-sm text-slate-400">
          <p>
            You are currently functioning as a <strong className="text-slate-300">Subject Teacher</strong> in your department. No class has been assigned to you as Class Incharge yet.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Class Incharge responsibilities are assigned directly by the HOD through the College LMS management.
          </p>
        </div>
      )}
    </div>
  );
};

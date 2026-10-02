import React, { useEffect } from 'react';
import { useFaculty } from '../hooks/useFaculty';
import { FacultyProfileCard } from '../components/FacultyProfileCard';
import { FacultyStats } from '../components/FacultyStats';
import { ClassInchargeStatus } from '../components/ClassInchargeStatus';
import { BookOpen, Calendar, ArrowRight, UserCheck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FacultyDashboard: React.FC = () => {
  const { dashboard, profile, loading, error, loadDashboard, loadProfile } = useFaculty();

  useEffect(() => {
    loadDashboard();
    loadProfile();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Faculty Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access your department information, assigned classes, students, and academic curriculum.
          </p>
        </div>
        <button
          onClick={() => {
            loadDashboard();
            loadProfile();
          }}
          disabled={loading.dashboard}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700/80 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading.dashboard ? 'animate-spin text-brand-400' : ''}`} />
          <span>Sync Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => loadDashboard()}
            className="text-xs underline font-semibold text-rose-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Profile Overview Card */}
      <FacultyProfileCard profile={profile} loading={loading.profile} />

      {/* Key Metric Stats Cards */}
      <FacultyStats dashboard={dashboard} loading={loading.dashboard} />

      {/* Class Incharge Status Section */}
      <ClassInchargeStatus classIncharge={dashboard?.classIncharge} />

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/department"
          className="glass-card rounded-2xl p-5 group hover:border-brand-500/40 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
            Department Portal
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            View degree programs, HOD details, and curriculum specifications.
          </p>
        </Link>

        <Link
          to="/subjects"
          className="glass-card rounded-2xl p-5 group hover:border-brand-500/40 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <UserCheck className="w-5 h-5" />
            </span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
            Department Subjects
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Filter courses by semester, credit allocation, and syllabus codes.
          </p>
        </Link>

        <Link
          to="/academic"
          className="glass-card rounded-2xl p-5 group hover:border-brand-500/40 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calendar className="w-5 h-5" />
            </span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
            Academic Calendar
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Review academic year start/end dates and semester term cycles.
          </p>
        </Link>
      </div>
    </div>
  );
};

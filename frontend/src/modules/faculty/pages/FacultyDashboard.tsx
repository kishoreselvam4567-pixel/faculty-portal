import React, { useEffect } from 'react';
import { useFaculty } from '../hooks/useFaculty';
import { FacultyProfileCard } from '../components/FacultyProfileCard';
import { FacultyStats } from '../components/FacultyStats';
import { ClassInchargeStatus } from '../components/ClassInchargeStatus';
import { LayoutDashboard, BookOpen, GraduationCap, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FacultyDashboard: React.FC = () => {
  const { dashboard, profile, loading, error, loadDashboard, loadProfile } = useFaculty();

  useEffect(() => {
    if (!dashboard) loadDashboard();
    if (!profile) loadProfile();
  }, [dashboard, profile]);

  return (
    <div className="space-y-3.5">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#15203D] to-[#1E293B] border border-slate-800 rounded-xl p-4 sm:p-4.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/20 shrink-0">
            <LayoutDashboard className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Faculty Dashboard
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
              Department-scoped governance data, assigned classes, and institutional status.
            </p>
          </div>
        </div>
        {dashboard?.faculty && (
          <div className="relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-xs self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">{dashboard.faculty.name}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* Profile Overview Card */}
      <FacultyProfileCard profile={profile} loading={loading.profile} />

      {/* Key Metric Stats Cards */}
      <FacultyStats dashboard={dashboard} loading={loading.dashboard} />

      {/* Class Incharge Status Section */}
      <ClassInchargeStatus classIncharge={dashboard?.classIncharge} />

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <Link
          to="/department"
          className="bg-white border border-slate-200 hover:border-blue-500/50 p-3.5 rounded-lg transition-all group shadow-2xs hover:shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 rounded bg-blue-50 text-blue-600">
              <Building2 className="w-3.5 h-3.5" />
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            Department Overview
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            Academic department credentials, programs, and HOD leadership.
          </p>
        </Link>

        <Link
          to="/classes"
          className="bg-white border border-slate-200 hover:border-blue-500/50 p-3.5 rounded-lg transition-all group shadow-2xs hover:shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 rounded bg-purple-50 text-purple-600">
              <GraduationCap className="w-3.5 h-3.5" />
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            Classes & Incharge
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            Designated student class and enrolled student rosters.
          </p>
        </Link>

        <Link
          to="/subjects"
          className="bg-white border border-slate-200 hover:border-blue-500/50 p-3.5 rounded-lg transition-all group shadow-2xs hover:shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 rounded bg-emerald-50 text-emerald-600">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            Courses & Curricula
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            Syllabus, semester course catalog, and credit allocations.
          </p>
        </Link>
      </div>
    </div>
  );

};

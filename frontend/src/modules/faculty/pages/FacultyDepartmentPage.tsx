import React, { useEffect } from 'react';
import { useFaculty } from '../hooks/useFaculty';
import { Building2, Award, GraduationCap, BookOpen, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FacultyDepartmentPage: React.FC = () => {
  const { department, loading, loadDepartment } = useFaculty();

  useEffect(() => {
    loadDepartment();
  }, []);

  if (loading.department) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="glass-card rounded-2xl p-8 h-48 bg-slate-900/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Department Overview
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Detailed academic profile and degree programs of your faculty division.
        </p>
      </div>

      {department ? (
        <>
          {/* Main Department Banner */}
          <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/30">
                    <Building2 className="w-8 h-8" />
                  </span>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                      {department.name}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Department Code: <span className="text-brand-400 font-bold uppercase">{department.code}</span>
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 pt-1">
                  Affiliated College: <span className="font-semibold text-white">{department.collegeName || 'Bharath Institute'}</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  {department.status}
                </span>
                <Link
                  to="/subjects"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Curriculum Subjects ({department.subjectsCount})</span>
                </Link>
              </div>
            </div>

            {/* Department Leadership */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Head of Department (HOD)
                  </span>
                  <p className="text-base font-bold text-white mt-0.5">
                    {department.hodName || 'Department Head Appointed'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Academic Degree Programs
                  </span>
                  <p className="text-base font-bold text-white mt-0.5">
                    {department.programs.length} Active Programs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Programs Offered */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-400" />
              <span>Offered Academic Programs</span>
            </h3>

            {department.programs.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-slate-400">
                <p className="font-semibold text-white">No academic programs registered</p>
                <p className="text-xs text-slate-500 mt-1">Degree programs are managed by College Administrators.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {department.programs.map((prog) => (
                  <div key={prog.id} className="glass-card rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">{prog.name}</h4>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-brand-500/10 text-brand-300">
                        {prog.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Duration: <span className="text-slate-200 font-semibold">{prog.durationYears} Years</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="glass-card rounded-2xl p-8 text-center text-slate-400">
          <p className="font-semibold text-white">No department assigned</p>
          <p className="text-xs text-slate-500 mt-1">Contact your college administrator to link your account to a department.</p>
        </div>
      )}
    </div>
  );
};

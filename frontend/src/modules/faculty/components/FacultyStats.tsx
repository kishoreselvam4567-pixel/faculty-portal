import React from 'react';
import { Users, BookOpen, Calendar, GraduationCap } from 'lucide-react';
import { FacultyDashboardData } from '../types/faculty.types';

interface FacultyStatsProps {
  dashboard: FacultyDashboardData | null;
  loading?: boolean;
}

export const FacultyStats: React.FC<FacultyStatsProps> = ({ dashboard, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card rounded-xl p-5 h-28 animate-pulse bg-slate-900/50" />
        ))}
      </div>
    );
  }

  const isClassIncharge = dashboard?.classIncharge?.isAssigned || false;
  const assignedClass = dashboard?.classIncharge?.class;
  const studentCount = assignedClass?.studentCount ?? 0;
  const currentSemester = dashboard?.semester?.termNumber ?? assignedClass?.currentSemester ?? '—';
  const academicYearName = dashboard?.academicYear?.name ?? 'Current Term';

  const stats = [
    {
      label: 'Class Incharge Role',
      value: isClassIncharge ? 'Assigned' : 'Not Assigned',
      subtext: isClassIncharge ? assignedClass?.name : 'Subject Teacher Mode',
      icon: GraduationCap,
      color: isClassIncharge ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-slate-400 bg-slate-800/40 border-slate-700',
    },
    {
      label: 'My Class Students',
      value: isClassIncharge ? studentCount : '0',
      subtext: isClassIncharge ? `${assignedClass?.name} Enrolled` : 'No Class Incharge',
      icon: Users,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    },
    {
      label: 'Current Semester',
      value: currentSemester !== '—' ? `Semester ${currentSemester}` : 'Active',
      subtext: academicYearName,
      icon: Calendar,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
    {
      label: 'Department',
      value: dashboard?.department?.code?.toUpperCase() || 'LMS',
      subtext: dashboard?.department?.name || 'Assigned Department',
      icon: BookOpen,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="glass-card rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-xs text-slate-400 mt-1 truncate max-w-[180px]">
                  {stat.subtext}
                </p>
              </div>
              <div className={`p-3 rounded-xl border ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

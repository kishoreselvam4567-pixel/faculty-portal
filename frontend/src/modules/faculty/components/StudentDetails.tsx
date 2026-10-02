import React from 'react';
import { User, Mail, Phone, Calendar, Building2, GraduationCap, MapPin } from 'lucide-react';
import { StudentDetails as StudentDetailsType } from '../types/faculty.types';

interface StudentDetailsProps {
  student: StudentDetailsType;
}

export const StudentDetails: React.FC<StudentDetailsProps> = ({ student }) => {
  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-slate-800">
        {student.profilePhoto ? (
          <img
            src={student.profilePhoto}
            alt={student.displayName || 'Student'}
            className="w-24 h-24 rounded-2xl object-cover ring-2 ring-brand-500/40 shadow-xl"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-700 to-slate-800 flex items-center justify-center text-white ring-2 ring-brand-500/40 shadow-xl">
            <User className="w-10 h-10 text-brand-200" />
          </div>
        )}

        <div className="space-y-1 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-white">
              {student.displayName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              {student.accountStatus}
            </span>
          </div>

          <p className="text-sm font-mono text-brand-400">
            {student.registerNumber ? `Reg: ${student.registerNumber}` : 'Register number not assigned'}
          </p>

          <p className="text-xs text-slate-400 flex items-center gap-2 pt-1">
            <GraduationCap className="w-4 h-4 text-brand-400" />
            Class: <span className="text-slate-200 font-medium">{student.className}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Email Address
          </span>
          <p className="text-sm font-medium text-white mt-1 flex items-center gap-2 truncate">
            <Mail className="w-4 h-4 text-brand-400 shrink-0" />
            {student.email}
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Phone Number
          </span>
          <p className="text-sm font-medium text-white mt-1 flex items-center gap-2">
            <Phone className="w-4 h-4 text-brand-400" />
            {student.phone || <span className="text-slate-500 italic">Not available</span>}
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Department
          </span>
          <p className="text-sm font-medium text-white mt-1 flex items-center gap-2 truncate">
            <Building2 className="w-4 h-4 text-brand-400 shrink-0" />
            {student.departmentName || '—'}
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Enrollment Year
          </span>
          <p className="text-sm font-medium text-white mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-400" />
            {student.enrollmentYear || '—'}
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Location
          </span>
          <p className="text-sm font-medium text-white mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-400" />
            {[student.city, student.state].filter(Boolean).join(', ') || <span className="text-slate-500 italic">Not specified</span>}
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Access Scope
          </span>
          <p className="text-sm font-medium text-emerald-400 mt-1">
            Assigned Class Student (Verified)
          </p>
        </div>
      </div>
    </div>
  );
};

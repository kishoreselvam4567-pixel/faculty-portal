import React from 'react';
import { User, Mail, Phone, Building2, ShieldCheck, Award } from 'lucide-react';
import { FacultyProfile } from '../types/faculty.types';

interface FacultyProfileCardProps {
  profile: FacultyProfile | null;
  loading?: boolean;
}

export const FacultyProfileCard: React.FC<FacultyProfileCardProps> = ({ profile, loading }) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-slate-200 rounded-lg" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Profile Avatar */}
        <div className="relative">
          {profile.profilePhoto ? (
            <img
              src={profile.profilePhoto}
              alt={profile.displayName || 'Faculty'}
              className="w-16 h-16 rounded-lg object-cover border border-slate-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <User className="w-8 h-8 text-slate-500" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-900">
              {profile.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Faculty Member'}
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldCheck className="w-3 h-3 mr-1" />
              FACULTY
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {profile.accountStatus}
            </span>
          </div>

          <p className="text-xs text-slate-600 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>{profile.designation || 'Assistant Professor'}</span>
            {profile.employeeId && (
              <span className="text-slate-400 font-mono">({profile.employeeId})</span>
            )}
          </p>

          <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile.department || 'Department Unassigned'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {profile.bio && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 text-xs text-slate-600 italic">
          "{profile.bio}"
        </div>
      )}
    </div>
  );
};

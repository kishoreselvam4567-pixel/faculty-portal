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
      <div className="glass-card rounded-2xl p-6 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-slate-800 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-slate-800 rounded w-1/3" />
            <div className="h-4 bg-slate-800 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-300">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
        {/* Profile Avatar */}
        <div className="relative group">
          {profile.profilePhoto ? (
            <img
              src={profile.profilePhoto}
              alt={profile.displayName || 'Faculty'}
              className="w-24 h-24 rounded-2xl object-cover ring-2 ring-brand-500/40 shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-800 flex items-center justify-center text-white ring-2 ring-brand-500/40 shadow-xl">
              <User className="w-10 h-10 text-brand-100" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 ring-4 ring-slate-900 w-5 h-5 rounded-full flex items-center justify-center">
            <span className="sr-only">Active</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {profile.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Faculty Member'}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-500/30">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-brand-400" />
              FACULTY
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {profile.accountStatus}
            </span>
          </div>

          <p className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-400" />
            {profile.designation || 'Assistant Professor'}
            {profile.employeeId && (
              <span className="text-slate-500 font-mono">({profile.employeeId})</span>
            )}
          </p>

          <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-300">
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
        <div className="mt-5 pt-4 border-t border-slate-800/80 text-sm text-slate-400 italic">
          "{profile.bio}"
        </div>
      )}
    </div>
  );
};

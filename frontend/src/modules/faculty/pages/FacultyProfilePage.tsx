import React, { useState, useEffect } from 'react';
import { useFaculty } from '../hooks/useFaculty';
import { User, Phone, MapPin, CheckCircle, AlertCircle, Save, Lock } from 'lucide-react';

export const FacultyProfilePage: React.FC = () => {
  const { profile, loading, loadProfile, saveProfile } = useFaculty();

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: '',
    state: '',
    bio: '',
    profilePhoto: '',
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        bio: profile.bio || '',
        profilePhoto: profile.profilePhoto || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await saveProfile(formData).unwrap();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err || 'Failed to save changes');
    }
  };

  return (
    <div className="space-y-3.5 max-w-4xl">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#1E1B4B] to-[#15203D] border border-slate-800 rounded-xl p-4 sm:p-4.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-400/20 shrink-0">
            <User className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              My Profile & Credentials
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
              Personal contact details and institutional faculty credentials.
            </p>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Profile changes saved successfully to database.</span>
        </div>
      )}

      {saveError && (
        <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-slate-100">
          <div className="relative shrink-0">
            {formData.profilePhoto ? (
              <img
                src={formData.profilePhoto}
                alt="Profile"
                className="w-14 h-14 rounded-lg object-cover border border-slate-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <User className="w-7 h-7" />
              </div>
            )}
          </div>

          <div className="text-center sm:text-left space-y-0.5 min-w-0">
            <h2 className="text-base font-bold text-slate-900 truncate">
              {profile?.displayName || 'Faculty Member'}
            </h2>
            <p className="text-xs text-slate-600">
              {profile?.designation || 'Assistant Professor'}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Role: FACULTY
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Status: {profile?.accountStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Locked Institutional Fields */}
        <div className="mt-4">
          <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-400" />
            Institutional Records (Read-Only)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
              <span className="text-[9.5px] text-slate-500 uppercase font-semibold block">Department</span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">
                {profile?.department || 'Assigned Department'}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
              <span className="text-[9.5px] text-slate-500 uppercase font-semibold block">Email Address</span>
              <span className="text-xs font-semibold text-slate-900 mt-0.5 block truncate">
                {profile?.email}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
              <span className="text-[9.5px] text-slate-500 uppercase font-semibold block">Faculty UID</span>
              <span className="text-[10.5px] font-mono text-slate-600 mt-0.5 block truncate">
                {profile?.uid}
              </span>
            </div>
          </div>
        </div>


        {/* Editable Form */}
        <form onSubmit={handleSubmit} className="mt-4 pt-3.5 border-t border-slate-100 space-y-3">
          <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-blue-600">
            Personal & Contact Information (Self-Service)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Profile Photo URL
              </label>
              <input
                type="text"
                placeholder="https://images.example.com/avatar.jpg"
                value={formData.profilePhoto}
                onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Residential Address
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Street address or faculty quarters"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">City</label>
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">State</label>
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Biography & Research Interests
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary of teaching specialization..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading.updatingProfile}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading.updatingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

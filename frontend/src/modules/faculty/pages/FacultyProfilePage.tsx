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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Faculty Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review your institutional credentials and update personal contact details.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>Profile changes saved successfully to College LMS database.</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-800">
          <div className="relative">
            {formData.profilePhoto ? (
              <img
                src={formData.profilePhoto}
                alt="Profile"
                className="w-24 h-24 rounded-2xl object-cover ring-2 ring-brand-500/40 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-brand-700 flex items-center justify-center text-white ring-2 ring-brand-500/40">
                <User className="w-12 h-12" />
              </div>
            )}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-bold text-white">
              {profile?.displayName || 'Faculty Member'}
            </h2>
            <p className="text-sm text-slate-400">
              {profile?.designation || 'Assistant Professor'}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Role: FACULTY
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Status: {profile?.accountStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Read-Only System Fields */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            Institutional Records (Managed by Administrator)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800">
              <span className="text-xs text-slate-500 block">Department</span>
              <span className="text-sm font-semibold text-slate-200 mt-0.5 block truncate">
                {profile?.department || 'Assigned Department'}
              </span>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800">
              <span className="text-xs text-slate-500 block">Official Email</span>
              <span className="text-sm font-semibold text-slate-200 mt-0.5 block truncate">
                {profile?.email}
              </span>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800">
              <span className="text-xs text-slate-500 block">Faculty UID</span>
              <span className="text-xs font-mono text-slate-400 mt-0.5 block truncate">
                {profile?.uid}
              </span>
            </div>
          </div>
        </div>

        {/* Editable Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 border-b border-slate-800 pb-2">
            Contact & Personal Details (Self-Service)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Profile Photo URL
              </label>
              <input
                type="text"
                placeholder="https://images.example.com/avatar.jpg"
                value={formData.profilePhoto}
                onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Residential Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Street address, apartment or staff quarters"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">City</label>
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">State</label>
              <input
                type="text"
                placeholder="State / Province"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Professional Biography
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of your academic background, research interests, and teaching experience..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={loading.updatingProfile}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading.updatingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

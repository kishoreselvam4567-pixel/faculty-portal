import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Building2,
  GraduationCap,
  BookOpen,
  Calendar,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useFaculty } from '../modules/faculty/hooks/useFaculty';
import { facultyApi } from '../modules/faculty/api/facultyApi';

interface DevUser {
  uid: string;
  display_name: string | null;
  email: string;
  role: string | null;
  department: { name: string; code: string } | null;
}

export const FacultyLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [devUsers, setDevUsers] = useState<DevUser[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { dashboard, loadDashboard } = useFaculty();
  const navigate = useNavigate();

  const currentUid = localStorage.getItem('faculty_dev_uid') || 'D679ftp5r9QC8zzybJkGAokVZ2d2';

  useEffect(() => {
    loadDashboard();
    // Fetch users for local dev switching
    facultyApi.getDevUsers().then(setDevUsers).catch(() => {});
  }, []);

  const handleSwitchUser = (uid: string) => {
    localStorage.setItem('faculty_dev_uid', uid);
    setShowUserMenu(false);
    loadDashboard();
    window.location.reload();
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Department', path: '/department', icon: Building2 },
    { label: 'Assigned Classes', path: '/classes', icon: GraduationCap },
    { label: 'Subjects', path: '/subjects', icon: BookOpen },
    { label: 'Academic Calendar', path: '/academic', icon: Calendar },
  ];

  const faculty = dashboard?.faculty;
  const isClassIncharge = dashboard?.classIncharge?.isAssigned;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-black text-white text-base">
            FP
          </div>
          <span className="font-bold tracking-tight text-white">Faculty Portal</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:w-64 backdrop-blur-xl shrink-0`}
      >
        <div className="p-5 flex flex-col h-full">
          {/* Logo / Branding */}
          <div className="hidden md:flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-brand-500/30">
              FP
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
                College LMS
              </h1>
              <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider block">
                Faculty Portal
              </span>
            </div>
          </div>

          {/* Current Faculty Context Chip */}
          <div className="mb-6 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center space-x-3">
              {faculty?.profilePhoto ? (
                <img
                  src={faculty.profilePhoto}
                  alt={faculty.name}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-brand-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-brand-700 text-white font-bold flex items-center justify-center text-sm">
                  {faculty?.name?.slice(0, 2).toUpperCase() || 'FA'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{faculty?.name || 'Faculty Member'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-brand-500/20 text-brand-300">
                    FACULTY
                  </span>
                  {isClassIncharge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-500/20 text-emerald-300">
                      Incharge
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Localhost User Switcher Dropdown (Dev Testing) */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700/60 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <RefreshCw className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="truncate">Switch Account</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              </button>

              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto z-50 p-1">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                    Database Accounts
                  </div>
                  {devUsers.map((u) => (
                    <button
                      key={u.uid}
                      onClick={() => handleSwitchUser(u.uid)}
                      className={`w-full text-left p-2 rounded-lg text-xs flex flex-col gap-0.5 hover:bg-slate-800 transition-colors ${
                        u.uid === currentUid ? 'bg-brand-600/20 text-brand-300' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold truncate">{u.display_name || u.email}</span>
                        <span className="text-[10px] px-1 rounded bg-slate-800 font-mono">
                          {u.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 truncate">{u.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-slate-950/60 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
              Department: {dashboard?.department?.name || 'Bsc AI and ML'}
            </span>
            {isClassIncharge && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Class Incharge: {dashboard?.classIncharge?.class?.name}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs font-bold text-white">{faculty?.name || 'Faculty Member'}</p>
              <p className="text-[11px] text-slate-400 font-mono">{faculty?.email}</p>
            </div>
            {faculty?.profilePhoto ? (
              <img
                src={faculty.profilePhoto}
                alt={faculty.name}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-500/30"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-brand-700 text-white font-bold flex items-center justify-center text-xs">
                {faculty?.name?.slice(0, 2).toUpperCase() || 'FA'}
              </div>
            )}
          </div>
        </header>

        {/* Page Outlet */}
        <main className="p-4 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

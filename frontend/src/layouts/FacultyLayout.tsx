import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  Search,
  Menu,
  X,
  RefreshCw,
} from 'lucide-react';
import { useFaculty } from '../modules/faculty/hooks/useFaculty';
import { facultyApi } from '../modules/faculty/api/facultyApi';
import { FacultySearchBar } from '../modules/faculty/components/FacultySearchBar';

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
  const [showTopUserMenu, setShowTopUserMenu] = useState(false);
  const { dashboard, loadDashboard } = useFaculty();

  const currentUid = localStorage.getItem('faculty_dev_uid') || 'D679ftp5r9QC8zzybJkGAokVZ2d2';

  useEffect(() => {
    loadDashboard();
    facultyApi.getDevUsers().then(setDevUsers).catch(() => {});
  }, []);

  const handleSwitchUser = (uid: string) => {
    localStorage.setItem('faculty_dev_uid', uid);
    setShowUserMenu(false);
    setShowTopUserMenu(false);
    loadDashboard();
    window.location.reload();
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'My Assigned Class', path: '/classes', icon: GraduationCap },
    { label: 'Attendance', path: '/attendance', icon: ClipboardCheck },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Department Overview', path: '/department', icon: Building2 },
    { label: 'Courses & Curricula', path: '/subjects', icon: BookOpen },
    { label: 'Academic Calendar', path: '/academic', icon: Calendar },
  ];

  const faculty = dashboard?.faculty;
  const isClassIncharge = dashboard?.classIncharge?.isAssigned;
  const initials = faculty?.name
    ? faculty.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'FA';

  const academicSessionName =
    dashboard?.academicYear?.name || 'FALL TERM 2026';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-3.5 bg-[#0a1122] border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-white text-[#0a1122] font-black text-xs flex items-center justify-center tracking-wider">
            AA
          </div>
          <div>
            <span className="font-bold text-xs tracking-tight text-white block">Aura Academia</span>
            <span className="text-[8.5px] uppercase tracking-wider text-slate-400 font-medium">Faculty Portal</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Sidebar - Compact and Sticky (Never scrolls away) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-[#0B132B] border-r border-slate-800/60 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:sticky md:top-0 md:h-screen md:w-60 shrink-0 select-none`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Top Logo / Title */}
            <div className="p-4 pb-3.5 border-b border-slate-800/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded bg-white text-[#0B132B] font-extrabold text-xs flex items-center justify-center tracking-widest shadow-sm">
                  AA
                </div>
                <div>
                  <h1 className="font-bold text-sm tracking-tight text-white leading-none">
                    Aura Academia
                  </h1>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5 block">
                    FACULTY PORTAL
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="p-2 space-y-0.5 mt-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#15203D] text-white border-l-4 border-blue-500 font-semibold pl-2.5'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#111B38]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bottom Profile Footer (Compact and visible without scrolling) */}
          <div className="p-3 border-t border-slate-800/80 bg-[#080E21]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded bg-[#16213E] border border-slate-700/60 text-white font-bold flex items-center justify-center text-xs tracking-wider shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {faculty?.name || 'Faculty Member'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {dashboard?.department?.name ? `Dept. of ${dashboard.department.name}` : 'Faculty Division'}
                </p>
                <p className="text-[9.5px] text-blue-400 font-medium truncate">
                  {isClassIncharge ? 'Class Incharge' : 'Subject Teacher'}
                </p>
              </div>
            </div>

            {/* Quick Account Switcher in Sidebar */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center justify-between text-[10.5px] text-slate-400 hover:text-white px-2 py-1 rounded bg-[#111A33] border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 text-blue-400" />
                  <span>Switch Faculty</span>
                </span>
                <span className="text-[8.5px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                  Dev
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-[#0B132B] border border-slate-700 rounded-lg shadow-2xl p-1 z-50 max-h-48 overflow-y-auto">
                  <div className="px-2.5 py-1 text-[8.5px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    Faculty Accounts
                  </div>
                  {devUsers.map((u) => (
                    <button
                      key={u.uid}
                      onClick={() => handleSwitchUser(u.uid)}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex flex-col hover:bg-slate-800 ${
                        u.uid === currentUid ? 'bg-blue-600/20 text-blue-300 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="truncate">{u.display_name || u.email}</span>
                        <span className="text-[9px] px-1 rounded bg-slate-900 text-slate-400">{u.role}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Top Header Bar */}
        <header className="h-14 px-4 lg:px-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 gap-3">
          {/* Global Search Bar (Classes, Students, Attendance, Subjects, Academic) */}
          <FacultySearchBar />

          {/* Right Header Status & Switch Faculty Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Academic Session Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>SESSION: {academicSessionName.toUpperCase()}</span>
            </div>

            {/* Quick Switch Faculty Button in Top Header (Zero scroll needed!) */}
            <div className="relative">
              <button
                onClick={() => setShowTopUserMenu(!showTopUserMenu)}
                className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 font-medium transition-colors shadow-2xs"
                title="Switch Faculty Account without scrolling"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Switch Faculty</span>
                <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1 rounded">Dev</span>
              </button>

              {showTopUserMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5 z-50 max-h-72 overflow-y-auto divide-y divide-slate-100">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400">
                    Switch Faculty Account
                  </div>
                  <div className="py-1">
                    {devUsers.map((u) => (
                      <button
                        key={u.uid}
                        onClick={() => handleSwitchUser(u.uid)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex flex-col hover:bg-slate-100 transition-colors ${
                          u.uid === currentUid ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="truncate font-medium">{u.display_name || u.email}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                            {u.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate mt-0.5">{u.email}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Body (Compressed padding) */}
        <main className="p-4 sm:p-5 lg:p-6 flex-1 max-w-7xl w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};


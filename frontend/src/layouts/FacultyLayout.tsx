import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  Search,
  Menu,
  X,
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

  const currentUid = localStorage.getItem('faculty_dev_uid') || 'D679ftp5r9QC8zzybJkGAokVZ2d2';

  useEffect(() => {
    loadDashboard();
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
    { label: 'My Assigned Class', path: '/classes', icon: GraduationCap },
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
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0a1122] border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-white text-[#0a1122] font-black text-xs flex items-center justify-center tracking-wider">
            AA
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">Aura Academia</span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Faculty Portal</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar - Matching Aura Academia Deep Navy */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0B132B] border-r border-slate-800/60 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:w-64 shrink-0 select-none`}
      >
        <div className="flex flex-col h-full">
          {/* Top Logo / Title */}
          <div className="p-6 pb-7 border-b border-slate-800/60">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-white text-[#0B132B] font-extrabold text-xs flex items-center justify-center tracking-widest shadow-sm">
                AA
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight text-white leading-none">
                  Aura Academia
                </h1>
                <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-widest mt-1 block">
                  FACULTY PORTAL
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3.5 px-4 py-2.5 rounded text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#15203D] text-white border-l-4 border-blue-500 font-semibold pl-3'
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

          {/* Bottom Profile Footer (Faculty Focused) */}
          <div className="p-4 border-t border-slate-800/80 bg-[#080E21]">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded bg-[#16213E] border border-slate-700/60 text-white font-bold flex items-center justify-center text-xs tracking-wider shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {faculty?.name || 'Faculty Member'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {dashboard?.department?.name ? `Dept. of ${dashboard.department.name}` : 'Faculty Division'}
                </p>
                <p className="text-[10px] text-blue-400 font-semibold truncate">
                  {isClassIncharge ? 'Class Incharge' : 'Subject Teacher'}
                </p>
              </div>
            </div>

            {/* Quick Account Switcher Button (Localhost dev) */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-[#111A33] border border-slate-800"
              >
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 text-blue-400" />
                  <span>Switch Faculty</span>
                </span>
                <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                  Dev
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#0B132B] border border-slate-700 rounded-lg shadow-2xl p-1 z-50 max-h-48 overflow-y-auto">
                  <div className="px-2.5 py-1 text-[9px] uppercase font-bold text-slate-400 border-b border-slate-800">
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
        <header className="h-16 px-6 lg:px-8 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30">
          {/* Search Box (Faculty Specific) */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search assigned classes, students, subjects, syllabus..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Right Header Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>ACADEMIC SESSION: {academicSessionName.toUpperCase()}</span>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="p-6 lg:p-8 flex-1 max-w-7xl w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

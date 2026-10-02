import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  LayoutDashboard,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  User,
  Users,
  CornerDownLeft,
  ArrowRight,
} from 'lucide-react';
import { useFaculty } from '../modules/faculty/hooks/useFaculty';
import { facultyApi } from '../modules/faculty/api/facultyApi';
import { ClassStudentSummary } from '../modules/faculty/types/faculty.types';

interface SearchResultItem {
  id: string;
  category: 'Pages' | 'Classes' | 'Courses' | 'Students';
  title: string;
  subtitle: string;
  badge?: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const GlobalSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [students, setStudents] = useState<ClassStudentSummary[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { classes, subjects, dashboard, loadClasses, loadSubjects } = useFaculty();

  // Load classes and subjects if not loaded
  useEffect(() => {
    if (classes.length === 0) {
      loadClasses();
    }
    if (subjects.length === 0) {
      loadSubjects();
    }
  }, []);

  // Pre-load students for assigned class so they are searchable
  useEffect(() => {
    const classId = dashboard?.classIncharge?.class?.id || (classes.length > 0 ? classes[0].id : null);
    if (classId) {
      facultyApi
        .getClassStudents(classId)
        .then((data) => setStudents(data || []))
        .catch(() => {});
    }
  }, [dashboard?.classIncharge?.class?.id, classes]);

  // Keyboard shortcut Ctrl+K or / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === '/' && document.activeElement !== inputRef.current) {
        const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (document.activeElement?.tagName || '').toUpperCase()
        );
        if (!isInputField) {
          e.preventDefault();
          inputRef.current?.focus();
          setIsOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Available portal navigation pages
  const portalPages = useMemo(
    () => [
      {
        id: 'page-dashboard',
        category: 'Pages' as const,
        title: 'Faculty Dashboard',
        subtitle: 'Institutional statistics, department metrics, and quick actions',
        badge: 'Overview',
        path: '/',
        icon: LayoutDashboard,
      },
      {
        id: 'page-classes',
        category: 'Pages' as const,
        title: 'My Assigned Classes',
        subtitle: 'Student incharge stewardship, class roster, and sections',
        badge: 'Academic',
        path: '/classes',
        icon: GraduationCap,
      },
      {
        id: 'page-subjects',
        category: 'Pages' as const,
        title: 'Courses & Curricula',
        subtitle: 'Semester subject syllabus, curriculum codes, and credits',
        badge: 'Syllabus',
        path: '/subjects',
        icon: BookOpen,
      },
      {
        id: 'page-department',
        category: 'Pages' as const,
        title: 'Department Overview',
        subtitle: 'Faculty team members, HOD details, and departmental records',
        badge: 'Governance',
        path: '/department',
        icon: Building2,
      },
      {
        id: 'page-academic',
        category: 'Pages' as const,
        title: 'Academic Calendar',
        subtitle: 'Session dates, academic years, and semester schedules',
        badge: 'Calendar',
        path: '/academic',
        icon: Calendar,
      },
      {
        id: 'page-profile',
        category: 'Pages' as const,
        title: 'My Profile & Bio',
        subtitle: 'Personal contact information, qualifications, and research bio',
        badge: 'Account',
        path: '/profile',
        icon: User,
      },
    ],
    []
  );

  // Compute matched results
  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return [];
    }

    const matchedPages: SearchResultItem[] = portalPages.filter(
      (p) =>
        p.title.toLowerCase().includes(trimmed) ||
        p.subtitle.toLowerCase().includes(trimmed) ||
        p.badge.toLowerCase().includes(trimmed)
    );

    const matchedClasses: SearchResultItem[] = classes
      .filter(
        (cls) =>
          cls.name.toLowerCase().includes(trimmed) ||
          (cls.program && cls.program.toLowerCase().includes(trimmed)) ||
          (cls.batch && cls.batch.toLowerCase().includes(trimmed)) ||
          (cls.department && cls.department.toLowerCase().includes(trimmed))
      )
      .map((cls) => ({
        id: `class-${cls.id}`,
        category: 'Classes' as const,
        title: cls.name,
        subtitle: `${cls.program || 'Degree Program'} • ${cls.studentCount} Students${cls.batch ? ` • Batch ${cls.batch}` : ''}`,
        badge: cls.isActive ? 'Active' : 'Inactive',
        path: `/classes/${cls.id}`,
        icon: GraduationCap,
      }));

    const matchedSubjects: SearchResultItem[] = subjects
      .filter(
        (sub) =>
          sub.name.toLowerCase().includes(trimmed) ||
          sub.code.toLowerCase().includes(trimmed) ||
          `semester ${sub.semesterNumber}`.includes(trimmed) ||
          `sem ${sub.semesterNumber}`.includes(trimmed)
      )
      .map((sub) => ({
        id: `subject-${sub.id}`,
        category: 'Courses' as const,
        title: sub.name,
        subtitle: `Course Code: ${sub.code} • Sem ${sub.semesterNumber} • ${sub.credits} Credits`,
        badge: sub.code,
        path: '/subjects',
        icon: BookOpen,
      }));

    const matchedStudents: SearchResultItem[] = students
      .filter(
        (st) =>
          (st.name && st.name.toLowerCase().includes(trimmed)) ||
          (st.registerNumber && st.registerNumber.toLowerCase().includes(trimmed)) ||
          (st.email && st.email.toLowerCase().includes(trimmed))
      )
      .map((st) => ({
        id: `student-${st.uid}`,
        category: 'Students' as const,
        title: st.name,
        subtitle: `Reg: ${st.registerNumber || 'N/A'} • ${st.email}`,
        badge: st.accountStatus || 'Student',
        path: `/students/${st.uid}`,
        icon: Users,
      }));

    return [...matchedPages, ...matchedClasses, ...matchedSubjects, ...matchedStudents];
  }, [query, portalPages, classes, subjects, students]);

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: { [key: string]: SearchResultItem[] } = {};
    results.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [results]);

  // Reset activeIndex when query or results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleSelect = (item: SearchResultItem) => {
    navigate(item.path);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && results[activeIndex]) {
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search assigned classes, students, subjects, syllabus..."
          className="w-full pl-9 pr-16 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded shadow-2xs">
              Ctrl+K
            </kbd>
          )}
        </div>
      </div>

      {/* Dropdown Live Results */}
      {isOpen && query.trim() !== '' && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[26rem] overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
          {results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-xs font-semibold text-slate-700">No matching results</p>
              <p className="text-[11px] text-slate-400">
                No classes, subjects, students or subportals found for &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            <div>
              <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Found <strong className="text-slate-800 font-semibold">{results.length}</strong> matching {results.length === 1 ? 'item' : 'items'}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400">
                  <span>Press</span>
                  <kbd className="px-1 bg-white border border-slate-200 rounded">↵</kbd>
                  <span>to open</span>
                </span>
              </div>

              {Object.entries(groupedResults).map(([category, items]) => (
                <div key={category} className="py-1">
                  <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {category} ({items.length})
                  </div>
                  {items.map((item) => {
                    const itemGlobalIndex = results.findIndex((r) => r.id === item.id);
                    const isSelected = itemGlobalIndex === activeIndex;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIndex(itemGlobalIndex)}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between gap-3 text-xs transition-colors ${
                          isSelected ? 'bg-blue-50/80 text-blue-900' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`p-1.5 rounded-lg border shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs truncate flex items-center gap-1.5">
                              <span>{item.title}</span>
                              {item.badge && (
                                <span className="inline-flex px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80">
                                  {item.badge}
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center">
                          {isSelected ? (
                            <CornerDownLeft className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <ArrowRight className="w-3 h-3 text-slate-300" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

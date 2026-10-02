import React, { useState } from 'react';
import { BookOpen, Filter, Search } from 'lucide-react';
import { SubjectInfo } from '../types/faculty.types';

interface SubjectTableProps {
  subjects: SubjectInfo[];
  loading?: boolean;
  selectedSemester?: number;
  onSemesterChange?: (sem: number | undefined) => void;
}

export const SubjectTable: React.FC<SubjectTableProps> = ({
  subjects,
  loading,
  selectedSemester,
  onSemesterChange,
}) => {
  const [search, setSearch] = useState('');

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="h-10 bg-slate-800 rounded-xl mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-slate-900/60 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const semestersList = Array.from(new Set(subjects.map((s) => s.semesterNumber))).sort((a, b) => a - b);

  const filtered = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase());
    const matchesSem = selectedSemester ? s.semesterNumber === selectedSemester : true;
    return matchesSearch && matchesSem;
  });

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search subjects by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSemester || ''}
            onChange={(e) => onSemesterChange?.(e.target.value ? Number(e.target.value) : undefined)}
            aria-label="Filter subjects by semester"
            className="w-full sm:w-48 px-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-brand-500"
          >
            <option value="">All Semesters</option>
            {semestersList.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="font-semibold text-white">No subjects found</p>
          <p className="text-xs text-slate-500 mt-1">
            No subjects are registered for this semester in your department.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th scope="col" className="px-4 py-3">Subject Code</th>
                <th scope="col" className="px-4 py-3">Subject Name</th>
                <th scope="col" className="px-4 py-3 text-center">Semester</th>
                <th scope="col" className="px-4 py-3 text-center">Credits</th>
                <th scope="col" className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((subject) => (
                <tr key={subject.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs font-semibold text-brand-400">
                    {subject.code}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-white">
                    {subject.name}
                  </td>
                  <td className="px-4 py-3.5 text-center text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Sem {subject.semesterNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center text-xs font-semibold text-slate-300">
                    {subject.credits}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        subject.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {subject.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

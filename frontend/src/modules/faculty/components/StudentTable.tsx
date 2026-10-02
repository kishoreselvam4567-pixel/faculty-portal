import React, { useState } from 'react';
import { Search, Eye, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClassStudentSummary } from '../types/faculty.types';

interface StudentTableProps {
  students: ClassStudentSummary[];
  loading?: boolean;
}

export const StudentTable: React.FC<StudentTableProps> = ({ students, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  if (loading) {
    return (
      <div className="border border-slate-200 rounded-lg bg-white p-12 text-center text-xs text-slate-400 animate-pulse">
        Loading enrolled student directory...
      </div>
    );
  }

  const filtered = students
    .filter((s) => {
      const q = searchTerm.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.registerNumber && s.registerNumber.toLowerCase().includes(q)) ||
        s.email.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  if (students.length === 0) {
    return (
      <div className="border border-slate-200 rounded bg-white p-20 text-center text-xs text-slate-500">
        No active records found for this module in the current academic session.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student by name or reg no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-xs text-slate-500 self-end sm:self-auto">
          Showing {filtered.length} of {students.length} students
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-slate-200 rounded bg-white p-16 text-center text-xs text-slate-500">
          No students matching search filter.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 cursor-pointer select-none hover:text-slate-900"
                  onClick={() => setSortAsc(!sortAsc)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Student Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th scope="col" className="px-4 py-3">Register No.</th>
                <th scope="col" className="px-4 py-3">Email Address</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((student) => (
                <tr key={student.uid} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2.5">
                      {student.profilePhoto ? (
                        <img
                          src={student.profilePhoto}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                          {student.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="font-semibold text-slate-900">
                        {student.name}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {student.registerNumber || <span className="text-slate-400 italic">Not set</span>}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {student.email}
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {student.accountStatus}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/students/${student.uid}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Details</span>
                    </Link>
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

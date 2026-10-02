import React, { useState } from 'react';
import { Search, User, Eye, ArrowUpDown } from 'lucide-react';
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
      <div className="glass-card rounded-2xl p-6">
        <div className="h-10 bg-slate-800 rounded-xl mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-900/60 rounded-xl animate-pulse" />
          ))}
        </div>
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

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or reg number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2 self-end sm:self-auto">
          <span>Showing {filtered.length} of {students.length} students</span>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <User className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="font-semibold text-white">No students found</p>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm ? 'No student matches your search query' : 'No students are enrolled in this class'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 cursor-pointer select-none hover:text-white transition-colors"
                  onClick={() => setSortAsc(!sortAsc)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Student Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th scope="col" className="px-4 py-3">Register No.</th>
                <th scope="col" className="px-4 py-3">Email Address</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((student) => (
                <tr
                  key={student.uid}
                  className="hover:bg-slate-900/50 transition-colors group"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center space-x-3">
                      {student.profilePhoto ? (
                        <img
                          src={student.profilePhoto}
                          alt={student.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-brand-500/20"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs ring-1 ring-slate-700">
                          {student.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                          {student.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 font-mono text-xs text-slate-300">
                    {student.registerNumber || (
                      <span className="text-slate-500 italic">Not set</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-xs text-slate-400">
                    {student.email}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {student.accountStatus}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <Link
                      to={`/students/${student.uid}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white text-xs font-medium transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
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

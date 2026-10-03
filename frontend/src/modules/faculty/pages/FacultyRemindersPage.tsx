import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  GraduationCap,
  ArrowRight,
  FileText,
  RotateCw,
  Sparkles,
  BookOpen,
  Check,
} from 'lucide-react';
import { facultyApi } from '../api/facultyApi';
import { TodayRemindersSummary } from '../types/faculty.types';

export const FacultyRemindersPage: React.FC = () => {
  const [data, setData] = useState<TodayRemindersSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const fetchReminders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const summary = await facultyApi.getTodayReminders();
      setData(summary);
    } catch (err) {
      console.error('Failed to load today reminders:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const totalClasses = data?.classes.length || 0;
  const pendingAttendance = data?.pendingAttendanceCount || 0;
  const pendingMarks = data?.pendingMarksCount || 0;
  const totalPending = pendingAttendance + pendingMarks;
  const totalStudents = data?.classes.reduce((sum, c) => sum + c.studentCount, 0) || 0;

  const filteredClasses = (data?.classes || []).filter((cls) => {
    if (filter === 'pending') {
      return cls.attendance.status === 'PENDING' || cls.marks.status === 'PENDING';
    }
    if (filter === 'completed') {
      return cls.attendance.status === 'COMPLETED';
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#15203D] to-[#1E293B] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/20 shrink-0">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Daily Reminders & Today's Schedule
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
              Live actionable items, session attendance, and academic deliverables across your classes.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>{data?.date || 'Today'}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchReminders(true)}
            title="Refresh reminders"
            disabled={refreshing}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Classes Today */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Classes Scheduled
          </p>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">{totalClasses}</h3>
          <p className="text-[10.5px] text-slate-400 mt-0.5">Assigned for instruction</p>
        </div>

        {/* Pending Attendance */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Attendance To Mark
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <h3 className={`text-lg font-bold ${pendingAttendance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {pendingAttendance}
            </h3>
            {pendingAttendance > 0 ? (
              <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                Action Due
              </span>
            ) : (
              <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Completed
              </span>
            )}
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5">Today's period rosters</p>
        </div>

        {/* Marks & CIA Assessments */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Assessments Active
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <h3 className="text-lg font-bold text-purple-600">{pendingMarks}</h3>
            <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
              Active Term
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5">CIA internal entries</p>
        </div>

        {/* Total Student Strength */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Students Enrolled
          </p>
          <h3 className="text-lg font-bold text-blue-600 mt-0.5">{totalStudents}</h3>
          <p className="text-[10.5px] text-slate-400 mt-0.5">Under your stewardship</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Classes ({totalClasses})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              filter === 'pending'
                ? 'bg-white text-amber-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Needs Attention ({totalPending})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              filter === 'completed'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Attendance Completed ({totalClasses - pendingAttendance})
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filteredClasses.length}</span> class items
        </div>
      </div>

      {/* Main List of Daily Class Reminders */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 h-36 animate-pulse" />
          ))}
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">All Caught Up!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No pending items match this filter. All scheduled class obligations are currently completed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClasses.map((cls) => {
            const isAttendancePending = cls.attendance.status === 'PENDING';
            const isMarksPending = cls.marks.status === 'PENDING';

            return (
              <div
                key={cls.classId}
                className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-slate-300 transition-all space-y-3.5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{cls.className}</h3>
                      {cls.semester && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          Semester {cls.semester}
                        </span>
                      )}
                      {cls.isClassIncharge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Class Incharge
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 pl-9">
                      Program: <span className="text-slate-700 font-medium">{cls.program || 'N/A'}</span> • Batch:{' '}
                      <span className="text-slate-700 font-medium">{cls.batch || 'Current'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 shrink-0">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{cls.studentCount} Students Enrolled</span>
                  </div>
                </div>

                {/* Actionable Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Attendance Card */}
                  <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 flex flex-col justify-between gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded ${
                            isAttendancePending ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          <ClipboardCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            {cls.attendance.period} Attendance
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {isAttendancePending
                              ? "Today's roll call is pending recording"
                              : 'Session recorded and synchronized'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          isAttendancePending
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isAttendancePending ? 'Needs Marking' : 'Completed'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-[10.5px] text-slate-400">
                        {cls.attendance.lastMarkedAt
                          ? `Recorded: ${new Date(cls.attendance.lastMarkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'Target: Period 1 roster'}
                      </span>
                      <Link
                        to={cls.actions.attendanceUrl}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold shadow-2xs transition-colors ${
                          isAttendancePending
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>{isAttendancePending ? 'Mark Attendance' : 'Review Attendance'}</span>
                      </Link>
                    </div>
                  </div>

                  {/* Marks & Assessment Card */}
                  <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 flex flex-col justify-between gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-purple-100 text-purple-700">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            Continuous Assessment (CIA)
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {cls.marks.title}
                          </p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                        Active Term
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-[10.5px] text-slate-400">
                        Semester {cls.semester || 1} Assessment Cycle
                      </span>
                      <Link
                        to={cls.actions.classDetailsUrl}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Class Marks & Details</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Footer Quick Links */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <Link
                      to={cls.actions.studentsUrl}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Class Roster ({cls.studentCount} Students)</span>
                    </Link>
                    <span className="text-slate-300">•</span>
                    <Link
                      to={`/attendance?classId=${cls.classId}`}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>Attendance History & Stats</span>
                    </Link>
                  </div>

                  <Link
                    to={cls.actions.classDetailsUrl}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    <span>Full Class Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FacultyRemindersPage;

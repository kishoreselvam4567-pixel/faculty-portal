import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFaculty } from '../hooks/useFaculty';
import { StudentTable } from '../components/StudentTable';
import { ArrowLeft, Users, AlertCircle } from 'lucide-react';

export const FacultyClassStudentsPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { classStudents, loading, error, loadClassStudents, loadClassDetails, selectedClass } =
    useFaculty();

  useEffect(() => {
    if (classId) {
      loadClassStudents(classId);
      loadClassDetails(classId);
    }
  }, [classId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={`/classes/${classId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Class Overview</span>
        </Link>
      </div>

      <div className="bg-gradient-to-r from-[#0B132B] via-[#15203D] to-[#1E293B] border border-slate-800 rounded-xl p-6 shadow-md relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Users className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {selectedClass ? `${selectedClass.name} — Student Directory` : 'Class Students'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Registered students enrolled in this class under your incharge stewardship.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="glass-card rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Access Denied</h3>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      ) : (
        <StudentTable students={classStudents} loading={loading.students} />
      )}
    </div>
  );
};

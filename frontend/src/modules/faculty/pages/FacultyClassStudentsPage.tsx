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
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Class Overview</span>
        </Link>
      </div>

      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2.5">
          <Users className="w-5 h-5 text-blue-600 shrink-0" />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {selectedClass ? `${selectedClass.name} — Student Directory` : 'Class Students'}
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Registered students enrolled in this class under your incharge stewardship.
        </p>
      </div>

      {error ? (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-center max-w-lg mx-auto space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-rose-900">Access Denied</h3>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : (
        <StudentTable students={classStudents} loading={loading.students} />
      )}
    </div>
  );
};

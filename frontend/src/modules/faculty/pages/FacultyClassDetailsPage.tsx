import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFaculty } from '../hooks/useFaculty';
import { ClassDetails } from '../components/ClassDetails';
import { ArrowLeft, Users, ArrowRight, AlertCircle, ClipboardCheck } from 'lucide-react';

export const FacultyClassDetailsPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { selectedClass, loading, error, loadClassDetails } = useFaculty();

  useEffect(() => {
    if (classId) {
      loadClassDetails(classId);
    }
  }, [classId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/classes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Classes</span>
        </Link>

        {selectedClass && (
          <div className="flex items-center gap-2">
            <Link
              to={`/attendance?classId=${classId}`}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 shadow-sm transition-colors"
            >
              <ClipboardCheck className="w-4 h-4 text-emerald-600" />
              <span>Mark Attendance</span>
            </Link>
            <Link
              to={`/classes/${classId}/students`}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>View Student Roster</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {error ? (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-center max-w-lg mx-auto space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-rose-900">Access Denied</h3>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : selectedClass ? (
        <ClassDetails cls={selectedClass} />
      ) : (
        <div className="border border-slate-200 rounded-lg bg-white p-8 h-48 animate-pulse" />
      )}
    </div>
  );
};

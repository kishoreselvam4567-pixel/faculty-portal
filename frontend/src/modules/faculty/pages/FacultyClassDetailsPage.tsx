import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFaculty } from '../hooks/useFaculty';
import { ClassDetails } from '../components/ClassDetails';
import { ArrowLeft, Users, ArrowRight, AlertCircle } from 'lucide-react';

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
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Classes</span>
        </Link>

        {selectedClass && (
          <Link
            to={`/classes/${classId}/students`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all"
          >
            <Users className="w-4 h-4" />
            <span>View Student Roster</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {error ? (
        <div className="glass-card rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Access Denied</h3>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      ) : selectedClass ? (
        <ClassDetails cls={selectedClass} />
      ) : (
        <div className="glass-card rounded-2xl p-8 h-48 animate-pulse" />
      )}
    </div>
  );
};

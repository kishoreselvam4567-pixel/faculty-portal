import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { facultyApi } from '../api/facultyApi';
import { StudentDetails as StudentDetailsType } from '../types/faculty.types';
import { StudentDetails } from '../components/StudentDetails';
import { ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react';

export const FacultyStudentDetailsPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<StudentDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      setLoading(true);
      setError(null);
      facultyApi
        .getStudentDetails(studentId)
        .then((data) => {
          setStudent(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(
            err.response?.data?.error ||
              'Access denied: You are only permitted to view profiles of students in your assigned class.'
          );
          setLoading(false);
        });
    }
  }, [studentId]);

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>

      {loading ? (
        <div className="border border-slate-200 rounded-lg bg-white p-8 h-64 animate-pulse" />
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded-xl p-8 text-center max-w-lg mx-auto space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Student Access Restricted</h3>
            <p className="text-xs text-rose-600">{error}</p>
          </div>
          <p className="text-[11px] text-slate-400">
            Rule: Faculty members can only view profile details for students belonging to their assigned class.
          </p>
        </div>
      ) : student ? (
        <StudentDetails student={student} />
      ) : (
        <div className="border border-slate-200 rounded-lg bg-white p-8 text-center text-slate-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p className="text-xs">Student record not found</p>
        </div>
      )}
    </div>
  );
};

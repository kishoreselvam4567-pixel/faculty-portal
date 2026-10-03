import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { FacultyLayout } from './layouts/FacultyLayout';
import { PageSkeleton } from './components/PageSkeleton';

// Code-split route components for rapid initial bundle loading
const FacultyDashboard = lazy(() =>
  import('./modules/faculty/pages/FacultyDashboard').then((m) => ({ default: m.FacultyDashboard }))
);
const FacultyProfilePage = lazy(() =>
  import('./modules/faculty/pages/FacultyProfilePage').then((m) => ({ default: m.FacultyProfilePage }))
);
const FacultyDepartmentPage = lazy(() =>
  import('./modules/faculty/pages/FacultyDepartmentPage').then((m) => ({ default: m.FacultyDepartmentPage }))
);
const FacultyClassesPage = lazy(() =>
  import('./modules/faculty/pages/FacultyClassesPage').then((m) => ({ default: m.FacultyClassesPage }))
);
const FacultyClassDetailsPage = lazy(() =>
  import('./modules/faculty/pages/FacultyClassDetailsPage').then((m) => ({ default: m.FacultyClassDetailsPage }))
);
const FacultyClassStudentsPage = lazy(() =>
  import('./modules/faculty/pages/FacultyClassStudentsPage').then((m) => ({ default: m.FacultyClassStudentsPage }))
);
const FacultyStudentDetailsPage = lazy(() =>
  import('./modules/faculty/pages/FacultyStudentDetailsPage').then((m) => ({ default: m.FacultyStudentDetailsPage }))
);
const FacultySubjectsPage = lazy(() =>
  import('./modules/faculty/pages/FacultySubjectsPage').then((m) => ({ default: m.FacultySubjectsPage }))
);
const FacultyAcademicYearsPage = lazy(() =>
  import('./modules/faculty/pages/FacultyAcademicYearsPage').then((m) => ({ default: m.FacultyAcademicYearsPage }))
);
const FacultyAttendancePage = lazy(() =>
  import('./modules/faculty/pages/FacultyAttendancePage').then((m) => ({ default: m.FacultyAttendancePage }))
);
const FacultyRemindersPage = lazy(() =>
  import('./modules/faculty/pages/FacultyRemindersPage').then((m) => ({ default: m.FacultyRemindersPage }))
);

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<FacultyLayout />}>
              <Route index element={<FacultyDashboard />} />
              <Route path="reminders" element={<FacultyRemindersPage />} />
              <Route path="profile" element={<FacultyProfilePage />} />
              <Route path="department" element={<FacultyDepartmentPage />} />
              <Route path="classes" element={<FacultyClassesPage />} />
              <Route path="classes/:classId" element={<FacultyClassDetailsPage />} />
              <Route path="classes/:classId/students" element={<FacultyClassStudentsPage />} />
              <Route path="classes/:classId/attendance" element={<FacultyAttendancePage />} />
              <Route path="attendance" element={<FacultyAttendancePage />} />
              <Route path="students/:studentId" element={<FacultyStudentDetailsPage />} />
              <Route path="subjects" element={<FacultySubjectsPage />} />
              <Route path="academic" element={<FacultyAcademicYearsPage />} />
              <Route path="semesters" element={<FacultyAcademicYearsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Provider>
  );
};

export default App;

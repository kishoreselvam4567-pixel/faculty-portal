import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { FacultyLayout } from './layouts/FacultyLayout';

import { FacultyDashboard } from './modules/faculty/pages/FacultyDashboard';
import { FacultyProfilePage } from './modules/faculty/pages/FacultyProfilePage';
import { FacultyDepartmentPage } from './modules/faculty/pages/FacultyDepartmentPage';
import { FacultyClassesPage } from './modules/faculty/pages/FacultyClassesPage';
import { FacultyClassDetailsPage } from './modules/faculty/pages/FacultyClassDetailsPage';
import { FacultyClassStudentsPage } from './modules/faculty/pages/FacultyClassStudentsPage';
import { FacultyStudentDetailsPage } from './modules/faculty/pages/FacultyStudentDetailsPage';
import { FacultySubjectsPage } from './modules/faculty/pages/FacultySubjectsPage';
import { FacultyAcademicYearsPage } from './modules/faculty/pages/FacultyAcademicYearsPage';

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FacultyLayout />}>
            <Route index element={<FacultyDashboard />} />
            <Route path="profile" element={<FacultyProfilePage />} />
            <Route path="department" element={<FacultyDepartmentPage />} />
            <Route path="classes" element={<FacultyClassesPage />} />
            <Route path="classes/:classId" element={<FacultyClassDetailsPage />} />
            <Route path="classes/:classId/students" element={<FacultyClassStudentsPage />} />
            <Route path="students/:studentId" element={<FacultyStudentDetailsPage />} />
            <Route path="subjects" element={<FacultySubjectsPage />} />
            <Route path="academic" element={<FacultyAcademicYearsPage />} />
            <Route path="semesters" element={<FacultyAcademicYearsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;

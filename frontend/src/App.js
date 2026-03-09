import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import LoginPage          from './pages/auth/LoginPage';
import StudentDashboard   from './pages/student/StudentDashboard';
import FacultyDashboard   from './pages/faculty/FacultyDashboard';
import AdminDashboard     from './pages/admin/AdminDashboard';
import AttendancePage     from './pages/attendance/AttendancePage';
import FeePage            from './pages/fees/FeePage';
import ExamPage           from './pages/exams/ExamPage';
import ResultPage         from './pages/results/ResultPage';
import AIInsightsPage     from './pages/ai/AIInsightsPage';
import ChatbotPage        from './pages/ai/ChatbotPage';
import StudyPlanPage      from './pages/ai/StudyPlanPage';
import StudentDetails     from './pages/student/StudentDetails';
import FacultyDetails     from './pages/faculty/FacultyDetails';
import StudentsList       from './pages/admin/StudentsList';
import FacultyList        from './pages/admin/FacultyList';
import FacultySchedulePage from './pages/faculty/FacultySchedulePage';
import GPAPage            from './pages/student/GPAPage';
import NotFoundPage       from './pages/NotFoundPage';
import AnnouncementsPage  from './pages/announcements/AnnouncementsPage';
import PublishCGPAPage from './pages/admin/PublishCGPAPage';

function RoleHome() {
  const { user, loading } = useAuth();
  if (loading) return null;
  // Always go to login first — only redirect if token is VALID and user is loaded
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN')   return <Navigate to="/admin/dashboard"   replace />;
  if (user.role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Default route — always shows login first; RoleHome redirects after auth */}
        <Route path="/"      element={<RoleHome />} />

        {/* Short aliases */}
        <Route path="/admin"   element={<Navigate to="/admin/dashboard"   replace />} />
        <Route path="/faculty" element={<Navigate to="/faculty/dashboard" replace />} />
        <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

            {/* ── STUDENT ── */}
            <Route path="/student/dashboard"
              element={<ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/attendance"
              element={<ProtectedRoute roles={['STUDENT','FACULTY','ADMIN']}><AttendancePage /></ProtectedRoute>} />
            <Route path="/student/fees"
              element={<ProtectedRoute roles={['STUDENT','ADMIN']}><FeePage /></ProtectedRoute>} />
            <Route path="/student/exams"    element={<ExamPage />} />
            <Route path="/student/results"
              element={<ProtectedRoute roles={['STUDENT','FACULTY','ADMIN']}><ResultPage /></ProtectedRoute>} />
            <Route path="/student/gpa"
              element={<ProtectedRoute roles={['STUDENT']}><GPAPage /></ProtectedRoute>} />
            <Route path="/student/ai-insights"
              element={<ProtectedRoute roles={['STUDENT','FACULTY','ADMIN']}><AIInsightsPage /></ProtectedRoute>} />
            <Route path="/student/study-plan"
              element={<ProtectedRoute roles={['STUDENT','FACULTY','ADMIN']}><StudyPlanPage /></ProtectedRoute>} />
            <Route path="/student/profile"
              element={<ProtectedRoute roles={['STUDENT']}><StudentDetails /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ChatbotPage />} />

            {/* ── FACULTY ── */}
            <Route path="/faculty/dashboard"
              element={<ProtectedRoute roles={['FACULTY']}><FacultyDashboard /></ProtectedRoute>} />
            <Route path="/faculty/schedule"
              element={<ProtectedRoute roles={['FACULTY','ADMIN']}><FacultySchedulePage /></ProtectedRoute>} />
            <Route path="/faculty/profile"
              element={<ProtectedRoute roles={['FACULTY']}><FacultyDetails /></ProtectedRoute>} />
            <Route path="/announcements"
              element={<ProtectedRoute roles={['ADMIN','FACULTY']}><AnnouncementsPage /></ProtectedRoute>} />

            {/* ── ADMIN ── */}
            <Route path="/admin/dashboard"
              element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/students"
              element={<ProtectedRoute roles={['ADMIN']}><StudentsList /></ProtectedRoute>} />
            <Route path="/admin/students/:id"
              element={<ProtectedRoute roles={['ADMIN','FACULTY']}><StudentDetails /></ProtectedRoute>} />
            <Route path="/admin/faculty"
              element={<ProtectedRoute roles={['ADMIN']}><FacultyList /></ProtectedRoute>} />
            <Route path="/admin/faculty/:id"
              element={<ProtectedRoute roles={['ADMIN']}><FacultyDetails /></ProtectedRoute>} />
           <Route path="/admin/publish-cgpa" 
           element={<ProtectedRoute roles={['ADMIN']}> <PublishCGPAPage /> </ProtectedRoute> }/> 
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
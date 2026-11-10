import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards.jsx';
import BugDetailPage from './pages/BugDetailPage.jsx';
import BugFormPage from './pages/BugFormPage.jsx';
import BugsPage from './pages/BugsPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="bugs" element={<BugsPage />} />
            <Route path="bugs/new" element={<BugFormPage />} />
            <Route path="bugs/:id" element={<BugDetailPage />} />
            <Route path="bugs/:id/edit" element={<BugFormPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

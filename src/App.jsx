import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home/Home';
import Mentors from './pages/Mentors/Mentors';
import CampusMap from './pages/CampusMap/CampusMap';
import Stories from './pages/Stories/Stories';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppShell>
            <Routes>
              {/* 1. Public Home Route */}
              <Route path="/" element={<Home />} />

              {/* 2. Protected Junior Home (Mentors) */}
              <Route
                path="/mentors"
                element={
                  <ProtectedRoute>
                    <Mentors />
                  </ProtectedRoute>
                }
              />

              {/* 3. Protected Campus Map */}
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <CampusMap />
                  </ProtectedRoute>
                }
              />

              {/* 4. Protected Campus Stories */}
              <Route
                path="/stories"
                element={
                  <ProtectedRoute>
                    <Stories />
                  </ProtectedRoute>
                }
              />

              {/* Unknown paths redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

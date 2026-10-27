import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NetworkProvider } from './context/NetworkContext';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home/Home';
import Mentors from './pages/Mentors/Mentors';
import CampusMap from './pages/CampusMap/CampusMap';
import Stories from './pages/Stories/Stories';
import SeniorDashboard from './pages/Senior/SeniorDashboard';
import SeniorProfile from './pages/Senior/SeniorProfile';
import Connections from './pages/Connections/Connections';
import Messages from './pages/Messages/Messages';
import './styles/network.css';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <NetworkProvider>
          <AppShell>
            <Routes>
              {/* 1. Public Home Route */}
              <Route path="/" element={<Home />} />

              {/* 2. Protected Junior Home (Mentors) */}
              <Route
                path="/mentors"
                element={
                  <ProtectedRoute role="junior">
                    <Mentors />
                  </ProtectedRoute>
                }
              />

              <Route path="/senior" element={<ProtectedRoute role="senior"><SeniorDashboard /></ProtectedRoute>} />
              <Route path="/senior/profile" element={<ProtectedRoute role="senior"><SeniorProfile /></ProtectedRoute>} />
              <Route path="/connections" element={<ProtectedRoute role="junior"><Connections /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/messages/:peerId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

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
          </NetworkProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

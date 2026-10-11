import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Page Components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DiscoverPage from './pages/DiscoverPage';
import InitiativeDetailPage from './pages/InitiativeDetailPage';
import CreateInitiativePage from './pages/CreateInitiativePage';
import CommunityFeedPage from './pages/CommunityFeedPage';
import MyActivitiesPage from './pages/MyActivitiesPage';
import ImpactDashboardPage from './pages/ImpactDashboardPage';
import AiActionAssistantPage from './pages/AiActionAssistantPage';
import NotificationsPage from './pages/NotificationsPage';
import UserProfilePage from './pages/UserProfilePage';
import OrgProfilePage from './pages/OrgProfilePage';
import OrgDashboardPage from './pages/OrgDashboardPage';
import OrgVerificationPage from './pages/OrgVerificationPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/initiatives" element={<DiscoverPage />} />
              <Route path="/initiatives/:id" element={<InitiativeDetailPage />} />
              <Route path="/feed" element={<CommunityFeedPage />} />
              <Route path="/impact-dashboard" element={<ImpactDashboardPage />} />
              <Route path="/ai-assistant" element={<AiActionAssistantPage />} />
              <Route path="/users/:id" element={<UserProfilePage />} />
              <Route path="/organizations/:id" element={<OrgProfilePage />} />

              {/* Protected Routes */}
              <Route
                path="/my-activities"
                element={
                  <ProtectedRoute>
                    <MyActivitiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Organization Routes */}
              <Route
                path="/initiatives/create"
                element={
                  <RoleRoute allowedRoles={['organization', 'admin']}>
                    <CreateInitiativePage />
                  </RoleRoute>
                }
              />
              <Route
                path="/organization/dashboard"
                element={
                  <RoleRoute allowedRoles={['organization', 'admin']}>
                    <OrgDashboardPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/organization/verification"
                element={
                  <RoleRoute allowedRoles={['organization', 'admin']}>
                    <OrgVerificationPage />
                  </RoleRoute>
                }
              />

              {/* Administrator Governance Routes */}
              <Route
                path="/admin"
                element={
                  <RoleRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </RoleRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

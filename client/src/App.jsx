import React, { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme';
import Dashboard from './components/Dashboard';
import PropertyManagement from './components/PropertyManagement';
import TenantManagement from './components/TenantManagement';
import RentPayment from './components/RentPayment';
import MaintenanceRequests from './components/MaintenanceRequests';
import ReportsAnalytics from './components/ReportsAnalytics';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import TenantPortal from './components/TenantPortal';
import TenantLogin from './components/TenantLogin';
import TenantRegister from './components/TenantRegister';
import TenantResetPassword from './components/TenantResetPassword';
import AdminRoute from './components/AdminRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  // Check authentication state on app load
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    if (authToken && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ErrorBoundary>
          <Routes>
            {/* 🔹 First page redirects to Login */}
            <Route path="/" element={<Navigate to="/tenant/login" />} />

            {/* 🔹 Tenant Authentication Pages */}
            <Route path="/tenant/login" element={<TenantLogin />} />
            <Route path="/tenant/register" element={<TenantRegister />} />
            <Route path="/tenant/reset-password" element={<TenantResetPassword />} />

            {/* 🔹 Tenant Portal (Protected Routes) */}
            <Route path="/tenant/*" element={<TenantPortal />} />

            {/* 🔹 Admin Pages (Protected by AdminRoute) */}
            <Route
              path="/dashboard"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/properties"
              element={
                <AdminRoute>
                  <PropertyManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/tenants"
              element={
                <AdminRoute>
                  <TenantManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <AdminRoute>
                  <RentPayment />
                </AdminRoute>
              }
            />
            <Route
              path="/maintenance"
              element={
                <AdminRoute>
                  <MaintenanceRequests />
                </AdminRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <AdminRoute>
                  <ReportsAnalytics />
                </AdminRoute>
              }
            />
          </Routes>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
}

export default App;
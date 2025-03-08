// src/components/TenantPortal.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TenantNavigation from './TenantNavigation';
import TenantDashboard from './TenantDashboard';
import TenantPaymentHistory from './TenantPaymentHistory';
import TenantMaintenance from './TenantMaintenance';
import TenantNotifications from './TenantNotifications';
import TenantProfile from './TenantProfile';
import PrivateRoute from './PrivateRoute';
import useAutoLogout from '../hooks/useAutoLogout'; // ✅ Import the auto-logout hook

const TenantPortal = () => {
  // ✅ Enable auto-logout after 15 minutes of inactivity
  useAutoLogout();

  return (
    <>
      <TenantNavigation /> {/* Always visible */}
      <Routes>
        <Route path="dashboard" element={<PrivateRoute><TenantDashboard /></PrivateRoute>} />
        <Route path="payments" element={<PrivateRoute><TenantPaymentHistory /></PrivateRoute>} />
        <Route path="maintenance" element={<PrivateRoute><TenantMaintenance /></PrivateRoute>} />
        <Route path="notifications" element={<PrivateRoute><TenantNotifications /></PrivateRoute>} />
        <Route path="profile" element={<PrivateRoute><TenantProfile /></PrivateRoute>} />
        <Route path="*" element={<PrivateRoute><TenantDashboard /></PrivateRoute>} />
      </Routes>
    </>
  );
};

export default TenantPortal;
// src/components/TenantPortal.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TenantLogin from './TenantLogin';
import TenantDashboard from './TenantDashboard';
import TenantPaymentHistory from './TenantPaymentHistory';
import TenantMaintenance from './TenantMaintenance';
import TenantNotifications from './TenantNotifications';
import TenantProfile from './TenantProfile';

const TenantPortal = () => {
  return (
    <Router>
      <Routes>
        <Route path="/tenant/login" element={<TenantLogin />} />
        <Route path="/tenant/dashboard" element={<TenantDashboard />} />
        <Route path="/tenant/payments" element={<TenantPaymentHistory />} />
        <Route path="/tenant/maintenance" element={<TenantMaintenance />} />
        <Route path="/tenant/notifications" element={<TenantNotifications />} />
        <Route path="/tenant/profile" element={<TenantProfile />} />
        {/* Redirect any unknown route to the login page */}
        <Route path="*" element={<Navigate to="/tenant/login" />} />
      </Routes>
    </Router>
  );
};

export default TenantPortal;

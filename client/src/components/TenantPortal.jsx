// src/components/TenantPortal.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import TenantNavigation from './TenantNavigation';
import TenantDashboard from './TenantDashboard';
import TenantPaymentHistory from './TenantPaymentHistory';
import TenantMaintenance from './TenantMaintenance';
import TenantNotifications from './TenantNotifications';
import TenantProfile from './TenantProfile';

const TenantPortal = () => {
  return (
    <>
      <TenantNavigation /> {/* Navigation at the top */}
      <Routes>
        <Route path="/tenant/dashboard" element={<TenantDashboard />} /> 
        <Route path="/tenant/payments" element={<TenantPaymentHistory />} />
        <Route path="/tenant/maintenance" element={<TenantMaintenance />} />
        <Route path="/tenant/notifications" element={<TenantNotifications />} />
        <Route path="/tenant/profile" element={<TenantProfile />} />
        <Route path="/tenant" element={<Navigate to="/tenant/dashboard" />} /> {/* Default Redirect */}
      </Routes>
    </>
  );
};

export default TenantPortal;

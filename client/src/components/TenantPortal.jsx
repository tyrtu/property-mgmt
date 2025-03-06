// src/components/TenantPortal.jsx
import { Routes, Route } from 'react-router-dom';
import TenantNavigation from './TenantNavigation';
import TenantDashboard from './TenantDashboard';
import TenantPaymentHistory from './TenantPaymentHistory';
import TenantMaintenance from './TenantMaintenance';
import TenantNotifications from './TenantNotifications';
import TenantProfile from './TenantProfile';

const TenantPortal = () => {
  return (
    <>
      <TenantNavigation /> {/* Tenant navigation always visible */}
      <Routes>
        <Route path="dashboard" element={<TenantDashboard />} />
        <Route path="payments" element={<TenantPaymentHistory />} />
        <Route path="maintenance" element={<TenantMaintenance />} />
        <Route path="notifications" element={<TenantNotifications />} />
        <Route path="profile" element={<TenantProfile />} />
        {/* 🔹 Default: Show Tenant Dashboard instead of redirecting */}
        <Route path="*" element={<TenantDashboard />} />
      </Routes>
    </>
  );
};

export default TenantPortal;

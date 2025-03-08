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
import TenantResetPassword from './components/TenantResetPassword'; // ✅ Import Forgot Password Page

function App() {
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
            <Route path="/tenant/reset-password" element={<TenantResetPassword />} /> {/* ✅ Added Route */}

            {/* 🔹 Tenant Portal (Protected Routes) */}
            <Route path="/tenant/*" element={<TenantPortal />} />

            {/* 🔹 Admin Pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/properties" element={<PropertyManagement />} />
            <Route path="/tenants" element={<TenantManagement />} />
            <Route path="/payments" element={<RentPayment />} />
            <Route path="/maintenance" element={<MaintenanceRequests />} />
            <Route path="/reports" element={<ReportsAnalytics />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
}

export default App;


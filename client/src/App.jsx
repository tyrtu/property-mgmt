// src/App.jsx
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from './theme';
import TenantDashboard from './components/TenantDashboard'; // Import dashboard directly
import PropertyManagement from './components/PropertyManagement';
import TenantManagement from './components/TenantManagement';
import RentPayment from './components/RentPayment';
import MaintenanceRequests from './components/MaintenanceRequests';
import ReportsAnalytics from './components/ReportsAnalytics';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ErrorBoundary>
          {/* Temporarily setting the default page to Tenant Dashboard */}
          <Routes>
            <Route path="/" element={<TenantDashboard />} /> {/* 👈 Default to Tenant Dashboard */}
            <Route path="/dashboard" element={<TenantDashboard />} />
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

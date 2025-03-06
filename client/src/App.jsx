// src/App.jsx
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ErrorBoundary>
          <Navigation /> {/* Admin Navigation */}
          <Routes>
            {/* Admin Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/properties" element={<PropertyManagement />} />
            <Route path="/tenants" element={<TenantManagement />} />
            <Route path="/payments" element={<RentPayment />} />
            <Route path="/maintenance" element={<MaintenanceRequests />} />
            <Route path="/reports" element={<ReportsAnalytics />} />

            {/* Tenant Portal */}
            <Route path="/tenant/*" element={<TenantPortal />} /> 
          </Routes>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
}

export default App;

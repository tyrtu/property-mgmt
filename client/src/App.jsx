import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Dashboard from './components/Dashboard';
import PropertyManagement from './components/PropertyManagement';
import TenantManagement from './components/TenantManagement';
import theme from './theme'; // This import now resolves correctly

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div>
          {/* Navigation Bar */}
          <nav
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#f5f5f5',
              borderBottom: '1px solid #ddd'
            }}
          >
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/properties">Properties</Link>
            <Link to="/tenants">Tenants</Link>
          </nav>

          {/* Page Content */}
          <div style={{ padding: '1rem' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/properties" element={<PropertyManagement />} />
              <Route path="/tenants" element={<TenantManagement />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;

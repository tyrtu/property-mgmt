// client/src/App.jsx
import { CssBaseline, Container } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PropertyManagement from './components/PropertyManagement';
import TenantManagement from './components/TenantManagement';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Container maxWidth="xl">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties" element={<PropertyManagement />} />
          <Route path="/tenants" element={<TenantManagement />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
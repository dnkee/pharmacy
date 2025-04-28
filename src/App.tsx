import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PharmacyDashboard from './PharmacyDashboard';
import PharmacyForm from './PharmacyForm';
import './App.css';

function App() {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/dash" element={<PharmacyDashboard />} />
        <Route path="/form" element={<PharmacyForm />} />
        <Route path="/" element={<Navigate to="/dash" replace />} />
        <Route path="*" element={<Navigate to="/dash" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

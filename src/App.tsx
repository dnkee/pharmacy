// @ts-nocheck
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PharmacyDashboard from './PharmacyDashboard';
import PharmacyForm from './PharmacyForm';
import './App.css';
import { ReactElement } from 'react';

function App(): ReactElement {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/dash" replace />} />
          <Route path="/dash" element={<PharmacyDashboard />} />
          <Route path="/form" element={<PharmacyForm />} />
          <Route path="*" element={<Navigate to="/dash" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

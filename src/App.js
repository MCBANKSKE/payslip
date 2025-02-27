import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import PayslipForm from './components/PayslipForm';
import BankStatementForm from './components/BankStatementForm';
import Settings from './components/Settings';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/payslip" element={<PayslipForm />} />
          <Route path="/bank-statement" element={<BankStatementForm />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

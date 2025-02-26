import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from './theme';
import { LoginForm, RegisterForm } from './components/Auth/AuthForms';
import Dashboard from './components/Dashboard';
import Employees from './components/Employees';
import SetupProfile from './components/SetupProfile';
import Navbar from './components/Navbar';
import PayslipForm from './components/PayslipForm';
import BankStatementForm from './components/BankStatementForm';
import SettingsPage from './components/SettingsPage';

function App() {
  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          {isAuthenticated() && <Navbar />}
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employees" 
              element={
                <PrivateRoute>
                  <Employees />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/setup-profile" 
              element={
                <PrivateRoute>
                  <SetupProfile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/payslip" 
              element={
                <PrivateRoute>
                  <PayslipForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/bank-statement" 
              element={
                <PrivateRoute>
                  <BankStatementForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;

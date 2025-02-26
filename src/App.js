import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LandingPage from './components/LandingPage';
import { LoginForm, RegisterForm } from './components/Auth/AuthForms';
import ProfileSetup from './components/Profile/ProfileSetup';
import PayslipForm from './components/PayslipForm';
import BankStatementForm from './components/BankStatementForm';
import Dashboard from './components/Dashboard';
import SettingsPage from './components/SettingsPage';
import Employees from './components/Employees';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
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
              path="/setup-profile"
              element={
                <PrivateRoute>
                  <ProfileSetup />
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
            <Route
              path="/employees"
              element={
                <PrivateRoute>
                  <Employees />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;

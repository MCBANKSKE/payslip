import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProfileSetup = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [companyProfile, setCompanyProfile] = useState({
    companyName: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: ''
  });

  const [bankProfile, setBankProfile] = useState({
    bankName: '',
    accountNumber: '',
    branchCode: '',
    swiftCode: ''
  });

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/profile/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: companyProfile.companyName,
          address: companyProfile.address,
          phone: companyProfile.phone,
          email: companyProfile.email,
          website: companyProfile.website || '',
          logo_url: companyProfile.logo || ''
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save company profile');
      }

      console.log('Company profile saved successfully:', data);
      setActiveStep(1);
    } catch (error) {
      console.error('Error saving company profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/profile/bank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bankProfile),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save bank profile');
      }

      console.log('Bank profile saved successfully:', data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving bank profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Company Information', 'Bank Information'];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" sx={{ mt: 2 }} onSubmit={handleCompanySubmit}>
            <TextField
              fullWidth
              label="Company Name"
              margin="normal"
              required
              value={companyProfile.companyName}
              onChange={(e) => setCompanyProfile({ ...companyProfile, companyName: e.target.value })}
            />
            <TextField
              fullWidth
              label="Address"
              margin="normal"
              required
              multiline
              rows={3}
              value={companyProfile.address}
              onChange={(e) => setCompanyProfile({ ...companyProfile, address: e.target.value })}
            />
            <TextField
              fullWidth
              label="Phone Number"
              margin="normal"
              required
              value={companyProfile.phone}
              onChange={(e) => setCompanyProfile({ ...companyProfile, phone: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              required
              value={companyProfile.email}
              onChange={(e) => setCompanyProfile({ ...companyProfile, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Website"
              margin="normal"
              value={companyProfile.website}
              onChange={(e) => setCompanyProfile({ ...companyProfile, website: e.target.value })}
            />
            <TextField
              fullWidth
              label="Logo URL"
              margin="normal"
              value={companyProfile.logo}
              onChange={(e) => setCompanyProfile({ ...companyProfile, logo: e.target.value })}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              type="submit"
            >
              Next
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box component="form" sx={{ mt: 2 }} onSubmit={handleBankSubmit}>
            <TextField
              fullWidth
              label="Bank Name"
              margin="normal"
              required
              value={bankProfile.bankName}
              onChange={(e) => setBankProfile({ ...bankProfile, bankName: e.target.value })}
            />
            <TextField
              fullWidth
              label="Account Number"
              margin="normal"
              required
              value={bankProfile.accountNumber}
              onChange={(e) => setBankProfile({ ...bankProfile, accountNumber: e.target.value })}
            />
            <TextField
              fullWidth
              label="Branch Code"
              margin="normal"
              required
              value={bankProfile.branchCode}
              onChange={(e) => setBankProfile({ ...bankProfile, branchCode: e.target.value })}
            />
            <TextField
              fullWidth
              label="SWIFT Code"
              margin="normal"
              required
              value={bankProfile.swiftCode}
              onChange={(e) => setBankProfile({ ...bankProfile, swiftCode: e.target.value })}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              type="submit"
            >
              Complete Setup
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Profile Setup
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent(activeStep)}
      </Paper>
    </Container>
  );
};

export default ProfileSetup;

import React from 'react';
import { Container, Typography, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4} style={{ minHeight: '100vh', paddingTop: '64px' }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h2" component="h1" gutterBottom>
            Simplify Your Financial Documentation
          </Typography>
          <Typography variant="h5" color="textSecondary" paragraph>
            Generate professional payslips and bank statements with ease. Perfect for businesses of all sizes.
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="contained" color="primary" size="large" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="primary" size="large" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '32px', backgroundColor: '#f5f5f5' }}>
            <Typography variant="h4" gutterBottom>
              Features
            </Typography>
            <Typography variant="body1" paragraph>
              • Professional Payslip Generation
            </Typography>
            <Typography variant="body1" paragraph>
              • Bank Statement Creation
            </Typography>
            <Typography variant="body1" paragraph>
              • Employee Management System
            </Typography>
            <Typography variant="body1" paragraph>
              • Company Profile Customization
            </Typography>
            <Typography variant="body1">
              • Secure Document Storage
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LandingPage;

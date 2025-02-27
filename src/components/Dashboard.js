import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert
} from '@mui/material';
import {
  Description as DescriptionIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Dashboard = () => {
  const [companyProfile, setCompanyProfile] = useState(null);
  const [recentPayslips, setRecentPayslips] = useState([]);
  const [recentStatements, setRecentStatements] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch company profile
      const profileResponse = await api.getCompanyProfile();
      if (profileResponse?.profile) {
        setCompanyProfile(profileResponse.profile);
      }

      // Fetch recent payslips
      const payslipsResponse = await api.getRecentPayslips();
      if (payslipsResponse?.payslips) {
        setRecentPayslips(payslipsResponse.payslips);
      }

      // Fetch recent statements
      const statementsResponse = await api.getRecentStatements();
      if (statementsResponse?.statements) {
        setRecentStatements(statementsResponse.statements);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load some dashboard data');
    }
  };

  const handleSetupProfile = () => {
    navigate('/setup-profile');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Company Profile Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                Company Profile
              </Typography>
              {!companyProfile && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSetupProfile}
                >
                  Setup Profile
                </Button>
              )}
            </Box>
            
            {companyProfile ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    <strong>Name:</strong> {companyProfile.name}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Email:</strong> {companyProfile.email}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Phone:</strong> {companyProfile.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    <strong>Address:</strong> {companyProfile.address}
                  </Typography>
                  {companyProfile.website && (
                    <Typography variant="subtitle1">
                      <strong>Website:</strong> {companyProfile.website}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Please set up your company profile to get started
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Quick Actions
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText primary="Generate Payslip" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccountBalanceIcon />
                  </ListItemIcon>
                  <ListItemText primary="Create Bank Statement" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Manage Employees" />
                </ListItem>
              </List>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/employees')}>
                View All Actions
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Recent Payslips */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Recent Payslips
              </Typography>
              {recentPayslips.length > 0 ? (
                <List>
                  {recentPayslips.map((payslip, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${payslip.employee_name}`}
                        secondary={`Period: ${payslip.period}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent payslips
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Bank Statements */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Recent Bank Statements
              </Typography>
              {recentStatements.length > 0 ? (
                <List>
                  {recentStatements.map((statement, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <AccountBalanceIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${statement.account_name}`}
                        secondary={`Date: ${statement.statement_date}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent bank statements
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

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
  ListItemIcon
} from '@mui/material';
import {
  Description as DescriptionIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [companyProfile, setCompanyProfile] = useState(null);
  const [recentPayslips, setRecentPayslips] = useState([]);
  const [recentStatements, setRecentStatements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanyProfile();
    fetchRecentDocuments();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profile/company', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCompanyProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    }
  };

  const fetchRecentDocuments = async () => {
    try {
      const [payslipsRes, statementsRes] = await Promise.all([
        fetch('http://localhost:5000/api/payslips/recent', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('http://localhost:5000/api/statements/recent', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (payslipsRes.ok) {
        const payslipsData = await payslipsRes.json();
        setRecentPayslips(payslipsData.payslips || []);
      } else {
        setRecentPayslips([]);
      }

      if (statementsRes.ok) {
        const statementsData = await statementsRes.json();
        setRecentStatements(statementsData.statements || []);
      } else {
        setRecentStatements([]);
      }
    } catch (error) {
      console.error('Error fetching recent documents:', error);
      setRecentPayslips([]);
      setRecentStatements([]);
    }
  };

  const QuickActionCard = ({ title, icon, description, action }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" component="div" ml={1}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={action}>
          Get Started
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>
              Welcome{companyProfile ? `, ${companyProfile.name}` : ''}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your payslips and bank statements efficiently
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionCard
                title="Generate Payslip"
                icon={<DescriptionIcon color="primary" />}
                description="Create and manage employee payslips"
                action={() => navigate('/payslip')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionCard
                title="Bank Statement"
                icon={<AccountBalanceIcon color="primary" />}
                description="Generate bank statements and reports"
                action={() => navigate('/bank-statement')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionCard
                title="Employees"
                icon={<PeopleIcon color="primary" />}
                description="Manage your employee records"
                action={() => navigate('/employees')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionCard
                title="Settings"
                icon={<SettingsIcon color="primary" />}
                description="Configure your account settings"
                action={() => navigate('/settings')}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Recent Documents */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Payslips
            </Typography>
            <List>
              {recentPayslips.map((payslip, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Payslip - ${payslip.employee_name}`}
                    secondary={new Date(payslip.created_at).toLocaleDateString()}
                  />
                </ListItem>
              ))}
              {recentPayslips.length === 0 && (
                <ListItem>
                  <ListItemText primary="No recent payslips" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Bank Statements
            </Typography>
            <List>
              {recentStatements.map((statement, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <AccountBalanceIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Statement - ${statement.account_number}`}
                    secondary={new Date(statement.created_at).toLocaleDateString()}
                  />
                </ListItem>
              ))}
              {recentStatements.length === 0 && (
                <ListItem>
                  <ListItemText primary="No recent bank statements" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

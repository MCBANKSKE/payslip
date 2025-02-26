import React, { useState } from 'react';
import { Container, Box, Tabs, Tab, Typography } from '@mui/material';
import PayslipForm from './components/PayslipForm';
import BankStatementForm from './components/BankStatementForm';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Document Generator
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Generate Payslip" />
            <Tab label="Generate Bank Statement" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <PayslipForm />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <BankStatementForm />
        </TabPanel>
      </Box>
    </Container>
  );
}

export default App;

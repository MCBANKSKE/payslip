import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const PayslipForm = ({ settings }) => {
  const [formData, setFormData] = useState({
    employee_name: '',
    employee_id: '',
    designation: '',
    station: '',
    tax_pin: '',
    bank_details: '',
    basic_salary: '',
    allowances: [],
    deductions: [],
    period: new Date(),
  });

  const [newAllowance, setNewAllowance] = useState({
    name: '',
    amount: ''
  });

  const [newDeduction, setNewDeduction] = useState({
    name: '',
    amount: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAllowanceChange = (e) => {
    const { name, value } = e.target;
    setNewAllowance(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeductionChange = (e) => {
    const { name, value } = e.target;
    setNewDeduction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addAllowance = () => {
    if (!newAllowance.name || !newAllowance.amount) {
      alert('Please fill in both allowance name and amount');
      return;
    }

    setFormData(prev => ({
      ...prev,
      allowances: [...prev.allowances, { ...newAllowance, amount: parseFloat(newAllowance.amount) }]
    }));

    setNewAllowance({ name: '', amount: '' });
  };

  const addDeduction = () => {
    if (!newDeduction.name || !newDeduction.amount) {
      alert('Please fill in both deduction name and amount');
      return;
    }

    setFormData(prev => ({
      ...prev,
      deductions: [...prev.deductions, { ...newDeduction, amount: parseFloat(newDeduction.amount) }]
    }));

    setNewDeduction({ name: '', amount: '' });
  };

  const removeAllowance = (index) => {
    setFormData(prev => ({
      ...prev,
      allowances: prev.allowances.filter((_, i) => i !== index)
    }));
  };

  const removeDeduction = (index) => {
    setFormData(prev => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalAllowances = () => {
    return formData.allowances.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  };

  const calculateTotalDeductions = () => {
    return formData.deductions.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  };

  const calculateNetPay = () => {
    const basicSalary = parseFloat(formData.basic_salary) || 0;
    const totalAllowances = calculateTotalAllowances();
    const totalDeductions = calculateTotalDeductions();
    return basicSalary + totalAllowances - totalDeductions;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employee_name || !formData.employee_id || !formData.basic_salary) {
      alert('Please fill in all required fields');
      return;
    }

    const requestData = {
      ...formData,
      companyName: settings.companyName,
      currency: settings.currency,
      companyLogo: settings.companyLogo,
      period: format(formData.period, 'MMMM-yyyy')
    };

    try {
      const response = await fetch('http://localhost:5000/generate-payslip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate payslip');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip_${formData.employee_id}_${format(formData.period, 'MMM-yyyy')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating payslip');
    }
  };

  return (
    <Paper style={{ padding: 20, marginTop: 20 }}>
      <Typography variant="h6" gutterBottom>
        Payslip Generator
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Employee Details Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Employee Details
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Employee Name"
              name="employee_name"
              value={formData.employee_name}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Employee ID"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Station"
              name="station"
              value={formData.station}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tax PIN"
              name="tax_pin"
              value={formData.tax_pin}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bank Details"
              name="bank_details"
              value={formData.bank_details}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Period"
                views={['year', 'month']}
                value={formData.period}
                onChange={(date) => setFormData(prev => ({ ...prev, period: date }))}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <Divider style={{ margin: '20px 0' }} />
          </Grid>

          {/* Basic Salary Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Basic Salary
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Basic Salary"
              type="number"
              name="basic_salary"
              value={formData.basic_salary}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <span>{settings.currency} </span>
              }}
            />
          </Grid>

          {/* Allowances Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Allowances
            </Typography>
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Allowance Name"
              name="name"
              value={newAllowance.name}
              onChange={handleAllowanceChange}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              name="amount"
              value={newAllowance.amount}
              onChange={handleAllowanceChange}
              InputProps={{
                startAdornment: <span>{settings.currency} </span>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={addAllowance}
              style={{ marginTop: 8 }}
            >
              <AddIcon />
            </Button>
          </Grid>

          {/* Allowances Table */}
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Allowance</TableCell>
                    <TableCell align="right">Amount ({settings.currency})</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.allowances.map((allowance, index) => (
                    <TableRow key={index}>
                      <TableCell>{allowance.name}</TableCell>
                      <TableCell align="right">{allowance.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => removeAllowance(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell><strong>Total Allowances</strong></TableCell>
                    <TableCell align="right"><strong>{calculateTotalAllowances().toFixed(2)}</strong></TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Deductions Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Deductions
            </Typography>
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Deduction Name"
              name="name"
              value={newDeduction.name}
              onChange={handleDeductionChange}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              name="amount"
              value={newDeduction.amount}
              onChange={handleDeductionChange}
              InputProps={{
                startAdornment: <span>{settings.currency} </span>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={addDeduction}
              style={{ marginTop: 8 }}
            >
              <AddIcon />
            </Button>
          </Grid>

          {/* Deductions Table */}
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Deduction</TableCell>
                    <TableCell align="right">Amount ({settings.currency})</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.deductions.map((deduction, index) => (
                    <TableRow key={index}>
                      <TableCell>{deduction.name}</TableCell>
                      <TableCell align="right">{deduction.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => removeDeduction(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell><strong>Total Deductions</strong></TableCell>
                    <TableCell align="right"><strong>{calculateTotalDeductions().toFixed(2)}</strong></TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Summary Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Summary
            </Typography>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Basic Salary</strong></TableCell>
                    <TableCell align="right"><strong>{parseFloat(formData.basic_salary || 0).toFixed(2)}</strong></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Total Allowances</strong></TableCell>
                    <TableCell align="right"><strong>{calculateTotalAllowances().toFixed(2)}</strong></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Total Deductions</strong></TableCell>
                    <TableCell align="right"><strong>{calculateTotalDeductions().toFixed(2)}</strong></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Net Pay</strong></TableCell>
                    <TableCell align="right"><strong>{calculateNetPay().toFixed(2)}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Generate Payslip
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default PayslipForm;

import React, { useState } from 'react';
import { TextField, Button, Grid, Paper, Typography, Alert } from '@mui/material';
import axios from 'axios';

function PayslipForm() {
  const [formData, setFormData] = useState({
    employee_name: '',
    employee_id: '',
    period: '',
    basic_salary: '',
    allowances: '',
    deductions: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post('http://localhost:5000/generate-payslip', {
        ...formData,
        basic_salary: parseFloat(formData.basic_salary),
        allowances: parseFloat(formData.allowances),
        deductions: parseFloat(formData.deductions)
      }, {
        responseType: 'blob'
      });

      // Create a download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip_${formData.employee_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess(true);
    } catch (err) {
      setError('Failed to generate payslip. Please try again.');
      console.error('Error:', err);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Generate Payslip
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Payslip generated successfully!</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Employee Name"
              name="employee_name"
              value={formData.employee_name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Employee ID"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Period (e.g., January 2025)"
              name="period"
              value={formData.period}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              required
              fullWidth
              type="number"
              label="Basic Salary"
              name="basic_salary"
              value={formData.basic_salary}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              required
              fullWidth
              type="number"
              label="Allowances"
              name="allowances"
              value={formData.allowances}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              required
              fullWidth
              type="number"
              label="Deductions"
              name="deductions"
              value={formData.deductions}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              Generate Payslip
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}

export default PayslipForm;

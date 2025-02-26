import React, { useState } from 'react';
import { TextField, Button, Grid, Paper, Typography, Alert, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function BankStatementForm() {
  const [formData, setFormData] = useState({
    account_holder: '',
    account_number: '',
    period: '',
    transactions: [
      {
        date: '',
        description: '',
        amount: '',
        balance: ''
      }
    ]
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

  const handleTransactionChange = (index, field, value) => {
    setFormData(prev => {
      const newTransactions = [...prev.transactions];
      newTransactions[index] = {
        ...newTransactions[index],
        [field]: value
      };
      return {
        ...prev,
        transactions: newTransactions
      };
    });
  };

  const addTransaction = () => {
    setFormData(prev => ({
      ...prev,
      transactions: [
        ...prev.transactions,
        { date: '', description: '', amount: '', balance: '' }
      ]
    }));
  };

  const removeTransaction = (index) => {
    if (formData.transactions.length > 1) {
      setFormData(prev => ({
        ...prev,
        transactions: prev.transactions.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post('http://localhost:5000/generate-bank-statement', {
        ...formData,
        transactions: formData.transactions.map(t => ({
          ...t,
          amount: parseFloat(t.amount),
          balance: parseFloat(t.balance)
        }))
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bank_statement_${formData.account_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess(true);
    } catch (err) {
      setError('Failed to generate bank statement. Please try again.');
      console.error('Error:', err);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Generate Bank Statement
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Bank statement generated successfully!</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Account Holder Name"
              name="account_holder"
              value={formData.account_holder}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Account Number"
              name="account_number"
              value={formData.account_number}
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

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Transactions
            </Typography>
          </Grid>

          {formData.transactions.map((transaction, index) => (
            <Grid item xs={12} container spacing={2} key={index}>
              <Grid item xs={12} sm={3}>
                <TextField
                  required
                  fullWidth
                  label="Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={transaction.date}
                  onChange={(e) => handleTransactionChange(index, 'date', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  required
                  fullWidth
                  label="Description"
                  value={transaction.description}
                  onChange={(e) => handleTransactionChange(index, 'description', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Amount"
                  value={transaction.amount}
                  onChange={(e) => handleTransactionChange(index, 'amount', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Balance"
                  value={transaction.balance}
                  onChange={(e) => handleTransactionChange(index, 'balance', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <IconButton
                  color="error"
                  onClick={() => removeTransaction(index)}
                  disabled={formData.transactions.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button
              startIcon={<AddIcon />}
              onClick={addTransaction}
              variant="outlined"
              sx={{ mb: 2 }}
            >
              Add Transaction
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              Generate Bank Statement
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}

export default BankStatementForm;

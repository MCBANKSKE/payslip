import React, { useState } from 'react';
import {
  Container,
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
  TableRow
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const generateTransactionId = () => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TXN${timestamp}${random}`;
};

const BankStatementForm = ({ settings }) => {
  const [formData, setFormData] = useState({
    account_holder: '',
    account_number: '',
    periodFrom: null,
    periodTo: null,
    transactions: [],
    initialBalance: 0,
  });

  const [newTransaction, setNewTransaction] = useState({
    date: null,
    transaction_id: '',
    description: '',
    amount_in: '',
    amount_out: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateBalance = (transactions, initialBalance) => {
    let balance = parseFloat(initialBalance);
    return transactions.map(transaction => {
      const amountIn = parseFloat(transaction.amount_in) || 0;
      const amountOut = parseFloat(transaction.amount_out) || 0;
      balance = balance + amountIn - amountOut;
      return { ...transaction, balance: balance.toFixed(2) };
    });
  };

  const addTransaction = () => {
    if (!newTransaction.date || !newTransaction.description || 
        (!newTransaction.amount_in && !newTransaction.amount_out)) {
      alert('Please fill in the required transaction fields');
      return;
    }

    if (newTransaction.amount_in && newTransaction.amount_out) {
      alert('Please enter either an In amount or an Out amount, not both');
      return;
    }

    const transactionToAdd = {
      ...newTransaction,
      date: format(newTransaction.date, 'yyyy-MM-dd'),
      transaction_id: generateTransactionId(),
      amount_in: newTransaction.amount_in || '0',
      amount_out: newTransaction.amount_out || '0'
    };

    const updatedTransactions = [
      ...formData.transactions,
      transactionToAdd
    ];

    // Sort transactions by date
    updatedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate balances
    const transactionsWithBalance = calculateBalance(updatedTransactions, formData.initialBalance);

    setFormData(prev => ({
      ...prev,
      transactions: transactionsWithBalance
    }));

    // Reset new transaction form
    setNewTransaction({
      date: null,
      transaction_id: '',
      description: '',
      amount_in: '',
      amount_out: '',
    });
  };

  const removeTransaction = (index) => {
    const updatedTransactions = formData.transactions.filter((_, i) => i !== index);
    const transactionsWithBalance = calculateBalance(updatedTransactions, formData.initialBalance);
    setFormData(prev => ({
      ...prev,
      transactions: transactionsWithBalance
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.account_holder || !formData.account_number || !formData.periodFrom || !formData.periodTo) {
      alert('Please fill in all required fields');
      return;
    }

    const requestData = {
      ...formData,
      bankName: settings.bankName,
      currency: settings.currency,
      bankLogo: settings.bankLogo,
      periodFrom: format(formData.periodFrom, 'yyyy-MM-dd'),
      periodTo: format(formData.periodTo, 'yyyy-MM-dd')
    };

    try {
      const response = await fetch('http://localhost:5000/generate-bank-statement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate bank statement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bank_statement_${formData.account_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating bank statement');
    }
  };

  return (
    <Paper style={{ padding: 20, marginTop: 20 }}>
      <Typography variant="h6" gutterBottom>
        Bank Statement Generator
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Account Holder"
              name="account_holder"
              value={formData.account_holder}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Account Number"
              name="account_number"
              value={formData.account_number}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Period From"
                value={formData.periodFrom}
                onChange={(date) => setFormData(prev => ({ ...prev, periodFrom: date }))}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Period To"
                value={formData.periodTo}
                onChange={(date) => setFormData(prev => ({ ...prev, periodTo: date }))}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Initial Balance"
              type="number"
              name="initialBalance"
              value={formData.initialBalance}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <span>{settings.currency} </span>
              }}
            />
          </Grid>

          {/* New Transaction Form */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Add Transaction
            </Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={newTransaction.date}
                onChange={(date) => setNewTransaction(prev => ({ ...prev, date }))}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newTransaction.description}
              onChange={handleTransactionChange}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Amount In"
              type="number"
              name="amount_in"
              value={newTransaction.amount_in}
              onChange={handleTransactionChange}
              InputProps={{
                startAdornment: <span>{settings.currency} </span>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Amount Out"
              type="number"
              name="amount_out"
              value={newTransaction.amount_out}
              onChange={handleTransactionChange}
              InputProps={{
                startAdornment: <span>{settings.currency} </span>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={addTransaction}
              style={{ marginTop: 8 }}
            >
              <AddIcon />
            </Button>
          </Grid>

          {/* Transactions Table */}
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>No.</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell align="right">In ({settings.currency})</TableCell>
                    <TableCell align="right">Out ({settings.currency})</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Balance ({settings.currency})</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.transactions.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.transaction_id}</TableCell>
                      <TableCell align="right">
                        {parseFloat(transaction.amount_in) > 0 ? parseFloat(transaction.amount_in).toFixed(2) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat(transaction.amount_out) > 0 ? parseFloat(transaction.amount_out).toFixed(2) : '-'}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell align="right">{transaction.balance}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => removeTransaction(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
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
              Generate Bank Statement
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default BankStatementForm;

import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert, Table } from 'react-bootstrap';
import axios from 'axios';

const BankStatementForm = () => {
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    fromDate: '',
    toDate: '',
    initialBalance: 0,
    transactions: []
  });

  const [settings, setSettings] = useState({
    bankName: '',
    bankLogo: '',
    currency: 'KES'
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('documentSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Set default date range (last month)
    const today = new Date();
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    setFormData(prev => ({
      ...prev,
      fromDate: lastYear.toISOString().slice(0, 10),
      toDate: today.toISOString().slice(0, 10)
    }));
  }, []);

  const validateDateRange = (fromDate, toDate) => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 365; // Maximum 1 year
  };

  const generateTransactionId = () => {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TXN${timestamp}${random}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if ((name === 'fromDate' || name === 'toDate') && formData.fromDate && formData.toDate) {
      const dateToCheck = name === 'fromDate' ? value : formData.fromDate;
      const otherDate = name === 'fromDate' ? formData.toDate : value;
      
      if (!validateDateRange(dateToCheck, otherDate)) {
        setError('Date range cannot exceed 1 year');
        return;
      } else {
        setError('');
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTransaction = () => {
    const newTransaction = {
      id: generateTransactionId(),
      date: new Date().toISOString().slice(0, 10),
      description: '',
      moneyIn: 0,
      moneyOut: 0,
      balance: 0
    };

    setFormData(prev => {
      const updatedTransactions = [...prev.transactions, newTransaction];
      return {
        ...prev,
        transactions: calculateBalances(updatedTransactions, prev.initialBalance)
      };
    });
  };

  const calculateBalances = (transactions, initialBalance) => {
    let currentBalance = Number(initialBalance);
    return transactions.map(transaction => {
      currentBalance = currentBalance + Number(transaction.moneyIn) - Number(transaction.moneyOut);
      return {
        ...transaction,
        balance: currentBalance
      };
    });
  };

  const handleTransactionChange = (index, field, value) => {
    setFormData(prev => {
      const updatedTransactions = [...prev.transactions];
      updatedTransactions[index] = {
        ...updatedTransactions[index],
        [field]: value
      };
      return {
        ...prev,
        transactions: calculateBalances(updatedTransactions, prev.initialBalance)
      };
    });
  };

  const handleRemoveTransaction = (index) => {
    setFormData(prev => {
      const updatedTransactions = prev.transactions.filter((_, i) => i !== index);
      return {
        ...prev,
        transactions: calculateBalances(updatedTransactions, prev.initialBalance)
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!validateDateRange(formData.fromDate, formData.toDate)) {
      setError('Date range cannot exceed 1 year');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/bank-statement/generate', {
        ...formData,
        ...settings
      }, {
        responseType: 'blob'
      });

      // Create a download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bank_statement_${formData.fromDate}_${formData.toDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setMessage('Bank statement generated successfully!');
    } catch (err) {
      setError('Failed to generate bank statement. Please try again.');
      console.error('Error:', err);
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Generate Bank Statement</h2>
      {message && (
        <Alert variant="success" className="mb-4">
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-sm">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Account Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="accountName"
                        value={formData.accountName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Account Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>From Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="fromDate"
                        value={formData.fromDate}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>To Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="toDate"
                        value={formData.toDate}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Initial Balance ({settings?.currency || 'KES'})</Form.Label>
                      <Form.Control
                        type="number"
                        name="initialBalance"
                        value={formData.initialBalance}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mb-3">
                  <h4>Transactions</h4>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Date</th>
                        <th>Transaction ID</th>
                        <th>Description</th>
                        <th>Money In ({settings?.currency || 'KES'})</th>
                        <th>Money Out ({settings?.currency || 'KES'})</th>
                        <th>Balance ({settings?.currency || 'KES'})</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.transactions.map((transaction, index) => (
                        <tr key={transaction.id}>
                          <td>{index + 1}</td>
                          <td>
                            <Form.Control
                              type="date"
                              value={transaction.date}
                              onChange={(e) => handleTransactionChange(index, 'date', e.target.value)}
                              required
                            />
                          </td>
                          <td>{transaction.id}</td>
                          <td>
                            <Form.Control
                              type="text"
                              value={transaction.description}
                              onChange={(e) => handleTransactionChange(index, 'description', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              value={transaction.moneyIn}
                              onChange={(e) => handleTransactionChange(index, 'moneyIn', e.target.value)}
                              min="0"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              value={transaction.moneyOut}
                              onChange={(e) => handleTransactionChange(index, 'moneyOut', e.target.value)}
                              min="0"
                            />
                          </td>
                          <td className="text-end">
                            {transaction.balance.toLocaleString()}
                          </td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemoveTransaction(index)}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <Button
                    variant="secondary"
                    onClick={handleAddTransaction}
                    className="mb-3"
                  >
                    Add Transaction
                  </Button>
                </div>

                <div className="text-center">
                  <Button type="submit" variant="primary">
                    Generate Bank Statement
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BankStatementForm;

import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import axios from 'axios';

const BankStatementForm = () => {
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    fromDate: '',
    toDate: '',
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
    setFormData(prev => ({
      ...prev,
      transactions: [
        ...prev.transactions,
        {
          date: '',
          description: '',
          amount: '',
          type: 'credit'
        }
      ]
    }));
  };

  const handleTransactionChange = (index, field, value) => {
    const updatedTransactions = [...formData.transactions];
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      transactions: updatedTransactions
    }));
  };

  const handleRemoveTransaction = (index) => {
    const updatedTransactions = formData.transactions.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      transactions: updatedTransactions
    }));
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
      
      // Clear transactions but keep account details
      setFormData(prev => ({
        ...prev,
        transactions: []
      }));
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
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
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

                <Row>
                  <Col md={6}>
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
                  <Col md={6}>
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
                </Row>

                <div className="mb-3">
                  <h4>Transactions</h4>
                  {formData.transactions.map((transaction, index) => (
                    <Card key={index} className="mb-3">
                      <Card.Body>
                        <Row>
                          <Col md={3}>
                            <Form.Group>
                              <Form.Label>Date</Form.Label>
                              <Form.Control
                                type="date"
                                value={transaction.date}
                                onChange={(e) => handleTransactionChange(index, 'date', e.target.value)}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>Description</Form.Label>
                              <Form.Control
                                type="text"
                                value={transaction.description}
                                onChange={(e) => handleTransactionChange(index, 'description', e.target.value)}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Group>
                              <Form.Label>Amount ({settings?.currency || 'KES'})</Form.Label>
                              <Form.Control
                                type="number"
                                value={transaction.amount}
                                onChange={(e) => handleTransactionChange(index, 'amount', e.target.value)}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            <Form.Group>
                              <Form.Label>Type</Form.Label>
                              <Form.Select
                                value={transaction.type}
                                onChange={(e) => handleTransactionChange(index, 'type', e.target.value)}
                              >
                                <option value="credit">Credit</option>
                                <option value="debit">Debit</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                        <Button
                          variant="danger"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleRemoveTransaction(index)}
                        >
                          Remove
                        </Button>
                      </Card.Body>
                    </Card>
                  ))}
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

import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import axios from 'axios';

const PayslipForm = () => {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    position: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    basicSalary: '',
    allowances: '',
    deductions: ''
  });

  const [settings, setSettings] = useState({
    companyName: '',
    companyLogo: '',
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
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/payslip/generate', {
        ...formData,
        ...settings
      }, {
        responseType: 'blob'
      });

      // Create a download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip_${formData.month}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setMessage('Payslip generated successfully!');
      
      // Clear form
      setFormData(prev => ({
        ...prev,
        employeeName: '',
        employeeId: '',
        position: '',
        basicSalary: '',
        allowances: '',
        deductions: ''
      }));
    } catch (err) {
      setError('Failed to generate payslip. Please try again.');
      console.error('Error:', err);
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Generate Monthly Payslip</h2>
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
                  <Form.Label>Employee Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="employeeName"
                    value={formData.employeeName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Employee ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Position</Form.Label>
                  <Form.Control
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Month</Form.Label>
                  <Form.Control
                    type="month"
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Basic Salary ({settings.currency})</Form.Label>
                  <Form.Control
                    type="number"
                    name="basicSalary"
                    value={formData.basicSalary}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Allowances ({settings.currency})</Form.Label>
                  <Form.Control
                    type="number"
                    name="allowances"
                    value={formData.allowances}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Deductions ({settings.currency})</Form.Label>
                  <Form.Control
                    type="number"
                    name="deductions"
                    value={formData.deductions}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <div className="text-center">
                  <Button type="submit" variant="primary">
                    Generate Payslip
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

export default PayslipForm;

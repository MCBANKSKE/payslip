import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import axios from 'axios';

const Settings = () => {
  const [settings, setSettings] = useState({
    company_name: '',
    company_logo: '',
    bank_name: '',
    bank_logo: '',
    currency: 'KES'
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load settings from database
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/settings');
      if (response.data) {
        setSettings(response.data);
        // Also store in localStorage for quick access
        localStorage.setItem('documentSettings', JSON.stringify(response.data));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      // Try loading from localStorage as fallback
      const savedSettings = localStorage.getItem('documentSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({
          ...prev,
          [type]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // Save to database
      await axios.post('http://localhost:5000/api/settings', settings);
      
      // Update localStorage
      localStorage.setItem('documentSettings', JSON.stringify(settings));
      
      setMessage('Settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings. Please try again.');
      console.error('Error:', err);
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Document Settings</h2>
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
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="company_name"
                    value={settings.company_name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Company Logo</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoChange(e, 'company_logo')}
                  />
                  {settings.company_logo && (
                    <img
                      src={settings.company_logo}
                      alt="Company Logo"
                      className="mt-2"
                      style={{ maxHeight: '100px' }}
                    />
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bank Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="bank_name"
                    value={settings.bank_name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bank Logo</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoChange(e, 'bank_logo')}
                  />
                  {settings.bank_logo && (
                    <img
                      src={settings.bank_logo}
                      alt="Bank Logo"
                      className="mt-2"
                      style={{ maxHeight: '100px' }}
                    />
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Currency</Form.Label>
                  <Form.Select
                    name="currency"
                    value={settings.currency}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="KES">KES</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </Form.Select>
                </Form.Group>

                <div className="text-center">
                  <Button type="submit" variant="primary">
                    Save Settings
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

export default Settings;

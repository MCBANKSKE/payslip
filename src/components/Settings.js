import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';

const Settings = () => {
  const [settings, setSettings] = useState({
    companyLogo: '',
    bankLogo: '',
    currency: 'KES',
    companyName: '',
    bankName: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('documentSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleLogoChange = (e, type) => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings to localStorage
    localStorage.setItem('documentSettings', JSON.stringify(settings));
    setMessage('Settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Document Settings</h2>
      {message && (
        <Alert variant="success" className="mb-4">
          {message}
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
                    name="companyName"
                    value={settings.companyName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Company Logo</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoChange(e, 'companyLogo')}
                  />
                  {settings.companyLogo && (
                    <img 
                      src={settings.companyLogo} 
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
                    name="bankName"
                    value={settings.bankName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bank Logo</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoChange(e, 'bankLogo')}
                  />
                  {settings.bankLogo && (
                    <img 
                      src={settings.bankLogo} 
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
                    <option value="KES">KES (Kenyan Shilling)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
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

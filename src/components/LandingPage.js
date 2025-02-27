import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';

const LandingPage = () => {
  return (
    <Container className="mt-5">
      <h1 className="text-center mb-5">Welcome to Document Generator</h1>
      <Row className="justify-content-center">
        <Col md={5}>
          <Card className="mb-4 shadow-sm">
            <Card.Body className="text-center">
              <Card.Title>Generate Payslip</Card.Title>
              <Card.Text>
                Create monthly payslips for employees with customized company details.
              </Card.Text>
              <Link to="/payslip">
                <Button variant="primary">Generate Payslip</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <Card className="mb-4 shadow-sm">
            <Card.Body className="text-center">
              <Card.Title>Generate Bank Statement</Card.Title>
              <Card.Text>
                Create bank statements for any period up to 1 year.
              </Card.Text>
              <Link to="/bank-statement">
                <Button variant="primary">Generate Bank Statement</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="text-center mt-4">
        <Link to="/settings">
          <Button variant="outline-secondary">Settings</Button>
        </Link>
      </div>
    </Container>
  );
};

export default LandingPage;

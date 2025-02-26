# Payslip and Bank Statement Generator

A web application for generating payslips and bank statements in PDF format.

## Features

- Generate professional payslips with employee details and salary information
- Create bank statements with transaction history
- Download generated documents as PDFs
- Modern and responsive user interface

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install Node.js dependencies:
```bash
npm install
```

## Running the Application

1. Start the Python backend:
```bash
python app.py
```

2. In a new terminal, start the React frontend:
```bash
npm start
```

The application will be available at http://localhost:3000

## Usage

### Generating a Payslip

1. Fill in the employee details
2. Enter salary information
3. Click "Generate Payslip"
4. The PDF will automatically download

### Generating a Bank Statement

1. Enter account holder details
2. Add transactions using the "Add Transaction" button
3. Click "Generate Bank Statement"
4. The PDF will automatically download

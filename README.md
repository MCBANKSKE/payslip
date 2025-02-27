# Payslip and Bank Statement Generator

A professional web application for generating beautifully styled payslips and bank statements.

## Features

### 1. Payslip Generation
- Monthly period selection
- Employee details (name, ID, position)
- Salary components
  - Basic salary
  - Allowances
  - Deductions
- Professional PDF output with company branding

### 2. Bank Statement Generation
- Date range selection (up to 1 year)
- Transaction management
  - Auto-generated transaction IDs
  - Money in/out tracking
  - Automatic balance calculation
- Professional PDF output with bank branding

### 3. Settings Management
- Company logo and name customization
- Bank logo and name customization
- Multiple currency support (KES, USD, EUR, GBP)
- Persistent storage in database

## Technology Stack

### Frontend
- React 18
- React Bootstrap for UI components
- Axios for API requests
- React Router for navigation

### Backend
- Flask (Python)
- MySQL Database
- SQLAlchemy ORM
- Flask-Migrate for database migrations
- ReportLab for PDF generation

## Installation

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8 or higher
- MySQL Server

### Database Setup
1. Create MySQL database:
```sql
CREATE DATABASE payslip_db;
```

### Backend Setup
1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start Flask server:
```bash
python app.py
```

### Frontend Setup
1. Install Node dependencies:
```bash
npm install
```

2. Start React development server:
```bash
npm start
```

## Usage

1. Settings Configuration
   - Go to Settings page
   - Upload company and bank logos
   - Set preferred currency
   - Save settings

2. Generate Payslip
   - Enter employee details
   - Set salary components
   - Click Generate to create PDF

3. Generate Bank Statement
   - Enter account details
   - Add transactions
   - Set date range
   - Click Generate to create PDF

## Security Features
- Data validation and sanitization
- Error handling and logging
- Secure file uploads
- Database backup support

## Customization
- Custom PDF templates
- Configurable currency formats
- Adjustable date ranges
- Customizable styling options

## Support
For issues or feature requests, please create an issue in the repository.

## License
This project is licensed under the MIT License.

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from models import db, Employee, Payslip, BankAccount, BankStatement, Transaction, User, CompanyProfile, BankProfile
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from reportlab.lib.utils import ImageReader
import base64
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Load configuration from Config class
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)

# Error handler for expired/invalid tokens
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        'message': 'The token has expired',
        'error': 'token_expired'
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        'message': 'Signature verification failed',
        'error': 'invalid_token'
    }), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({
        'message': 'Missing Authorization Header',
        'error': 'authorization_required'
    }), 401

# Create all database tables
with app.app_context():
    db.create_all()

def decode_base64_image(base64_string):
    if not base64_string:
        return None
    try:
        # Remove the data URL prefix if present
        if 'base64,' in base64_string:
            base64_string = base64_string.split('base64,')[1]
        image_data = base64.b64decode(base64_string)
        return BytesIO(image_data)
    except:
        return None

def generate_payslip_pdf(data):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Add company logo if provided
    if data.get('companyLogo'):
        logo_data = decode_base64_image(data['companyLogo'])
        if logo_data:
            c.drawImage(ImageReader(logo_data), 50, height - 100, width=100, height=80, preserveAspectRatio=True)

    # Add company header
    c.setFont("Helvetica-Bold", 20)
    company_name = data.get('companyName', 'Company Name')
    c.drawString(160, height - 60, company_name.upper())

    # Add payslip title and period
    c.setFont("Helvetica-Bold", 12)
    period = data.get('period', '')
    c.drawString(50, height - 120, f"Pay Slip ({period})")

    # Add employee details section
    y_position = height - 150
    c.setFont("Helvetica", 10)
    
    # Left column
    c.drawString(50, y_position, "PF-Num:")
    c.drawString(120, y_position, data['employee_id'])
    
    y_position -= 20
    c.drawString(50, y_position, "Station:")
    c.drawString(120, y_position, data.get('station', ''))
    
    y_position -= 20
    c.drawString(50, y_position, "Desig:")
    c.drawString(120, y_position, data.get('designation', ''))

    # Right column
    right_col = 300
    y_position = height - 150
    
    c.drawString(right_col, y_position, "ID-Num:")
    c.drawString(right_col + 70, y_position, data['employee_id'])
    
    y_position -= 20
    c.drawString(right_col, y_position, "Tax-PIN:")
    c.drawString(right_col + 70, y_position, data.get('tax_pin', ''))
    
    y_position -= 20
    c.drawString(right_col, y_position, "Bank Details:")
    c.drawString(right_col + 70, y_position, data.get('bank_details', ''))

    # Draw horizontal line
    y_position -= 30
    c.line(50, y_position, width - 50, y_position)

    # Earnings section
    y_position -= 30
    c.setFont("Helvetica-Bold", 12)
    currency = data.get('currency', '')

    # Basic Salary
    c.drawString(50, y_position, "Basic Salary")
    basic_salary = float(data.get('basic_salary', 0))
    c.drawString(width - 150, y_position, f"{basic_salary:,.2f}")

    # Allowances
    y_position -= 20
    for allowance in data.get('allowances', []):
        c.setFont("Helvetica", 10)
        c.drawString(50, y_position, allowance['name'])
        c.drawString(width - 150, y_position, f"{allowance['amount']:,.2f}")
        y_position -= 20

    # Total Earnings
    y_position -= 10
    c.setFont("Helvetica-Bold", 12)
    total_earnings = basic_salary + sum(float(a['amount']) for a in data.get('allowances', []))
    c.drawString(50, y_position, "TOTAL Earnings")
    c.drawString(width - 150, y_position, f"{total_earnings:,.2f}")

    # Draw horizontal line
    y_position -= 10
    c.line(50, y_position, width - 50, y_position)

    # Deductions section
    y_position -= 30
    c.setFont("Helvetica", 10)
    for deduction in data.get('deductions', []):
        c.drawString(50, y_position, deduction['name'])
        c.drawString(width - 150, y_position, f"{deduction['amount']:,.2f}")
        y_position -= 20

    # Total Deductions
    y_position -= 10
    c.setFont("Helvetica-Bold", 12)
    total_deductions = sum(float(d['amount']) for d in data.get('deductions', []))
    c.drawString(50, y_position, "TOTAL Deductions")
    c.drawString(width - 150, y_position, f"{total_deductions:,.2f}")

    # Draw horizontal line
    y_position -= 10
    c.line(50, y_position, width - 50, y_position)

    # Net Pay
    y_position -= 30
    net_pay = total_earnings - total_deductions
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y_position, f"NET Pay: {period}")
    c.drawString(width - 150, y_position, f"{net_pay:,.2f}")

    c.save()
    buffer.seek(0)
    return buffer

def generate_bank_statement_pdf(data):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Add bank logo if provided
    if data.get('bankLogo'):
        logo_data = decode_base64_image(data['bankLogo'])
        if logo_data:
            c.drawImage(ImageReader(logo_data), 50, height - 120, width=100, height=80, preserveAspectRatio=True)

    # Add bank header
    c.setFont("Helvetica-Bold", 24)
    bank_name = data.get('bankName', 'Bank Name')
    c.drawString(50, height - 150, bank_name)
    
    # Add statement title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 180, "BANK STATEMENT")
    
    # Add period
    c.setFont("Helvetica", 12)
    period_from = data.get('periodFrom', '')
    period_to = data.get('periodTo', '')
    period_text = f"Period: {period_from} to {period_to}"
    c.drawString(50, height - 200, period_text)
    
    # Add account details
    c.drawString(50, height - 230, f"Account Holder: {data['account_holder']}")
    c.drawString(50, height - 250, f"Account Number: {data['account_number']}")
    
    # Add initial balance
    currency = data.get('currency', 'USD')
    initial_balance = float(data.get('initialBalance', 0))
    c.drawString(50, height - 270, f"Opening Balance: {currency} {initial_balance:.2f}")
    
    # Add transactions header
    y_position = height - 310
    c.setFont("Helvetica-Bold", 12)
    headers = ["No.", "Date", "Transaction ID", f"In ({currency})", f"Out ({currency})", "Description", f"Balance ({currency})"]
    x_positions = [50, 100, 180, 300, 380, 460, 580]
    
    for header, x_pos in zip(headers, x_positions):
        c.drawString(x_pos, y_position, header)
    
    # Add transactions
    c.setFont("Helvetica", 10)
    y_position -= 20
    
    for idx, transaction in enumerate(data['transactions'], 1):
        if y_position < 50:  # Start a new page if we're running out of space
            c.showPage()
            c.setFont("Helvetica", 10)
            y_position = height - 50
        
        # Draw transaction details
        c.drawString(50, y_position, str(idx))
        c.drawString(100, y_position, transaction['date'])
        c.drawString(180, y_position, transaction['transaction_id'])
        
        amount_in = float(transaction['amount_in'])
        amount_out = float(transaction['amount_out'])
        
        if amount_in > 0:
            c.drawString(300, y_position, f"{amount_in:.2f}")
        if amount_out > 0:
            c.drawString(380, y_position, f"{amount_out:.2f}")
            
        # Truncate description if too long
        description = transaction['description']
        if len(description) > 20:
            description = description[:17] + "..."
        c.drawString(460, y_position, description)
        
        c.drawString(580, y_position, f"{float(transaction['balance']):.2f}")
        
        y_position -= 20
    
    # Add final balance
    if data['transactions']:
        final_balance = float(data['transactions'][-1]['balance'])
        y_position -= 20
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y_position, f"Closing Balance: {currency} {final_balance:.2f}")
    
    c.save()
    buffer.seek(0)
    return buffer

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password') or not data.get('username'):
            return jsonify({'message': 'Missing required fields'}), 400
            
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 400
            
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already taken'}), 400
        
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password'])
        )
        
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 201
    except Exception as e:
        print(f"Registration error: {str(e)}")  # Add logging
        db.session.rollback()
        return jsonify({'message': 'An error occurred during registration'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Missing email or password'}), 400
            
        user = User.query.filter_by(email=data['email']).first()
        
        if user and check_password_hash(user.password_hash, data['password']):
            access_token = create_access_token(identity=user.id)
            
            # Check if user has company profile
            has_company_profile = bool(CompanyProfile.query.filter_by(user_id=user.id).first())
            
            return jsonify({
                'access_token': access_token,  # Changed from 'token' to 'access_token'
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                },
                'has_company_profile': has_company_profile
            }), 200
        
        return jsonify({'message': 'Invalid email or password'}), 401
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'message': 'An error occurred during login'}), 500

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        # In a more complete implementation, you might want to blacklist the token
        # For now, we'll just return success since the frontend will remove the token
        return jsonify({'message': 'Successfully logged out'}), 200
    except Exception as e:
        print(f"Error in logout: {str(e)}")
        return jsonify({'message': 'An error occurred during logout'}), 500

@app.route('/generate-payslip', methods=['POST'])
def create_payslip():
    try:
        data = request.json
        
        # Save employee data
        employee = Employee.query.filter_by(employee_id=data['employee_id']).first()
        if not employee:
            employee = Employee(
                employee_id=data['employee_id'],
                name=data['employee_name'],
                email=data.get('email', f"{data['employee_id']}@example.com")
            )
            db.session.add(employee)
            db.session.commit()
        
        # Create payslip record
        payslip = Payslip(
            employee_id=employee.id,
            period_from=datetime.strptime(data['periodFrom'], '%Y-%m-%d').date(),
            period_to=datetime.strptime(data['periodTo'], '%Y-%m-%d').date(),
            basic_salary=data['basic_salary'],
            allowances=data['allowances'],
            deductions=data['deductions'],
            currency=data.get('currency', 'USD'),
            company_name=data.get('companyName', 'Company Name')
        )
        db.session.add(payslip)
        db.session.commit()
        
        # Generate PDF
        pdf_buffer = generate_payslip_pdf(data)
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"payslip_{data['employee_id']}_{datetime.now().strftime('%Y%m%d')}.pdf"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/generate-bank-statement', methods=['POST'])
def create_bank_statement():
    try:
        data = request.json
        
        # Save bank account data
        account = BankAccount.query.filter_by(account_number=data['account_number']).first()
        if not account:
            account = BankAccount(
                account_number=data['account_number'],
                account_holder=data['account_holder'],
                bank_name=data.get('bankName', 'Bank Name')
            )
            db.session.add(account)
            db.session.commit()
        
        # Create bank statement record
        statement = BankStatement(
            account_id=account.id,
            period_from=datetime.strptime(data['periodFrom'], '%Y-%m-%d').date(),
            period_to=datetime.strptime(data['periodTo'], '%Y-%m-%d').date(),
            currency=data.get('currency', 'USD')
        )
        db.session.add(statement)
        
        # Add transactions
        initial_balance = float(data.get('initialBalance', 0))
        balance = initial_balance
        
        for trans in data['transactions']:
            amount_in = float(trans['amount_in'])
            amount_out = float(trans['amount_out'])
            balance = balance + amount_in - amount_out
            
            transaction = Transaction(
                account_id=account.id,
                transaction_id=trans['transaction_id'],
                date=datetime.strptime(trans['date'], '%Y-%m-%d').date(),
                description=trans['description'],
                amount_in=amount_in,
                amount_out=amount_out,
                balance=balance
            )
            db.session.add(transaction)
        
        db.session.commit()
        
        # Generate PDF
        pdf_buffer = generate_bank_statement_pdf(data)
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"bank_statement_{data['account_number']}_{datetime.now().strftime('%Y%m%d')}.pdf"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/payslips/recent', methods=['GET'])
@jwt_required()
def get_recent_payslips():
    try:
        user_id = get_jwt_identity()
        
        # Get the user's employees
        employees = Employee.query.filter_by(user_id=user_id).all()
        
        if not employees:
            return jsonify({'payslips': []}), 200
            
        employee_ids = [emp.id for emp in employees]
        
        # Get recent payslips for these employees
        payslips = Payslip.query.filter(
            Payslip.employee_id.in_(employee_ids)
        ).order_by(
            Payslip.created_at.desc()
        ).limit(5).all()
        
        return jsonify({
            'payslips': [{
                'id': p.id,
                'employee_name': f"{p.employee.first_name} {p.employee.last_name}",
                'period_start': p.pay_period_start.strftime('%Y-%m-%d'),
                'period_end': p.pay_period_end.strftime('%Y-%m-%d'),
                'amount': p.net_pay,
                'created_at': p.created_at.strftime('%Y-%m-%d')
            } for p in payslips]
        }), 200
    except Exception as e:
        print(f"Error fetching recent payslips: {str(e)}")
        return jsonify({'message': 'An error occurred while fetching recent payslips'}), 500

@app.route('/api/statements/recent', methods=['GET'])
@jwt_required()
def get_recent_statements():
    try:
        user_id = get_jwt_identity()
        
        # Get the user's employees
        employees = Employee.query.filter_by(user_id=user_id).all()
        
        if not employees:
            return jsonify({'statements': []}), 200
            
        employee_ids = [emp.id for emp in employees]
        
        # Get bank accounts for these employees
        bank_accounts = BankAccount.query.filter(
            BankAccount.employee_id.in_(employee_ids)
        ).all()
        
        if not bank_accounts:
            return jsonify({'statements': []}), 200
            
        account_ids = [acc.id for acc in bank_accounts]
        
        # Get recent statements for these accounts
        statements = BankStatement.query.filter(
            BankStatement.bank_account_id.in_(account_ids)
        ).order_by(
            BankStatement.created_at.desc()
        ).limit(5).all()
        
        return jsonify({
            'statements': [{
                'id': s.id,
                'account_number': s.account.account_number,
                'statement_date': s.statement_date.strftime('%Y-%m-%d'),
                'opening_balance': s.opening_balance,
                'closing_balance': s.closing_balance,
                'created_at': s.created_at.strftime('%Y-%m-%d')
            } for s in statements]
        }), 200
    except Exception as e:
        print(f"Error fetching recent statements: {str(e)}")
        return jsonify({'message': 'An error occurred while fetching recent statements'}), 500

@app.route('/api/profile/company', methods=['GET'])
@jwt_required()
def get_company_profile():
    try:
        user_id = get_jwt_identity()
        print(f"Getting company profile for user {user_id}")
        
        if not user_id:
            print("No user_id found in token")
            return jsonify({'message': 'Invalid token'}), 401
            
        company = CompanyProfile.query.filter_by(user_id=user_id).first()
        print(f"Found company profile: {company}")
        
        if not company:
            print("No company profile found")
            return jsonify({'profile': None}), 200
            
        profile_data = {
            'name': company.name,
            'address': company.address,
            'phone': company.phone,
            'email': company.email,
            'website': company.website or '',
            'logo_url': company.logo_url or ''
        }
        print(f"Returning profile data: {profile_data}")
        
        return jsonify({'profile': profile_data}), 200
    except Exception as e:
        print(f"Error in get_company_profile: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': 'An error occurred while fetching company profile'}), 500

@app.route('/api/profile/company', methods=['POST'])
@jwt_required()
def setup_company_profile():
    try:
        user_id = get_jwt_identity()
        print(f"Setting up company profile for user {user_id}")
        
        data = request.get_json()
        print(f"Received data: {data}")
        
        if not data:
            print("No data provided")
            return jsonify({'message': 'No data provided'}), 400

        required_fields = ['name', 'address', 'phone', 'email']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            print(f"Missing fields: {missing_fields}")
            return jsonify({
                'message': 'Missing required fields',
                'fields': missing_fields
            }), 422

        # Check if company profile already exists
        company = CompanyProfile.query.filter_by(user_id=user_id).first()
        print(f"Existing company profile: {company}")
        
        if company:
            # Update existing company profile
            company.name = data['name']
            company.address = data['address']
            company.phone = data['phone']
            company.email = data['email']
            company.website = data.get('website', '')
            company.logo_url = data.get('logo_url', '')
            print("Updated existing company profile")
        else:
            # Create new company profile
            company = CompanyProfile(
                user_id=user_id,
                name=data['name'],
                address=data['address'],
                phone=data['phone'],
                email=data['email'],
                website=data.get('website', ''),
                logo_url=data.get('logo_url', '')
            )
            db.session.add(company)
            print("Created new company profile")
        
        db.session.commit()
        print("Committed changes to database")
        
        return jsonify({
            'message': 'Company profile saved successfully',
            'profile': {
                'name': company.name,
                'address': company.address,
                'phone': company.phone,
                'email': company.email,
                'website': company.website or '',
                'logo_url': company.logo_url or ''
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error in setup_company_profile: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': 'An error occurred while saving company profile'}), 500

@app.route('/api/profile/bank', methods=['GET'])
@jwt_required()
def get_bank_profile():
    try:
        user_id = get_jwt_identity()
        profile = BankProfile.query.filter_by(user_id=user_id).first()
        
        if not profile:
            return jsonify({'message': 'Bank profile not found'}), 404
            
        return jsonify({
            'profile': {
                'id': profile.id,
                'bank_name': profile.bank_name,
                'account_number': profile.account_number,
                'branch_code': profile.branch_code,
                'swift_code': profile.swift_code
            }
        }), 200
    except Exception as e:
        print(f"Error fetching bank profile: {str(e)}")
        return jsonify({'message': 'An error occurred while fetching bank profile'}), 500

@app.route('/api/profile/bank', methods=['POST'])
@jwt_required()
def setup_bank_profile():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        required_fields = ['bankName', 'accountNumber']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'message': 'Missing required fields',
                'fields': missing_fields
            }), 422

        # Check if bank profile already exists
        profile = BankProfile.query.filter_by(user_id=user_id).first()
        
        if profile:
            # Update existing profile
            profile.bank_name = data['bankName']
            profile.account_number = data['accountNumber']
            profile.branch_code = data.get('branchCode', '')
            profile.swift_code = data.get('swiftCode', '')
        else:
            # Create new profile
            profile = BankProfile(
                user_id=user_id,
                bank_name=data['bankName'],
                account_number=data['accountNumber'],
                branch_code=data.get('branchCode', ''),
                swift_code=data.get('swiftCode', '')
            )
            db.session.add(profile)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Bank profile saved successfully',
            'profile': {
                'id': profile.id,
                'bank_name': profile.bank_name,
                'account_number': profile.account_number,
                'branch_code': profile.branch_code,
                'swift_code': profile.swift_code
            }
        }), 200
    except Exception as e:
        print(f"Bank profile error: {str(e)}")
        db.session.rollback()
        return jsonify({'message': 'An error occurred while saving bank profile'}), 500

@app.route('/api/employees', methods=['GET'])
@jwt_required()
def get_employees():
    try:
        user_id = get_jwt_identity()
        employees = Employee.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'employees': [{
                'id': emp.id,
                'first_name': emp.first_name,
                'last_name': emp.last_name,
                'email': emp.email,
                'phone': emp.phone,
                'position': emp.position,
                'department': emp.department,
                'hire_date': emp.hire_date.strftime('%Y-%m-%d') if emp.hire_date else None
            } for emp in employees]
        }), 200
    except Exception as e:
        print(f"Error fetching employees: {str(e)}")
        return jsonify({'message': 'An error occurred while fetching employees'}), 500

@app.route('/api/employees', methods=['POST'])
@jwt_required()
def create_employee():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        required_fields = ['first_name', 'last_name', 'email', 'phone', 'position', 'department', 'hire_date']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'message': 'Missing required fields',
                'fields': missing_fields
            }), 422

        # Check if email is already in use
        existing_employee = Employee.query.filter_by(email=data['email']).first()
        if existing_employee:
            return jsonify({'message': 'Email already in use'}), 409

        employee = Employee(
            user_id=user_id,
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            phone=data['phone'],
            position=data['position'],
            department=data['department'],
            hire_date=datetime.strptime(data['hire_date'], '%Y-%m-%d').date()
        )
        
        db.session.add(employee)
        db.session.commit()
        
        return jsonify({
            'message': 'Employee created successfully',
            'employee': {
                'id': employee.id,
                'first_name': employee.first_name,
                'last_name': employee.last_name,
                'email': employee.email,
                'phone': employee.phone,
                'position': employee.position,
                'department': employee.department,
                'hire_date': employee.hire_date.strftime('%Y-%m-%d')
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating employee: {str(e)}")
        return jsonify({'message': 'An error occurred while creating employee'}), 500

@app.route('/api/employees/<int:id>', methods=['PUT'])
@jwt_required()
def update_employee(id):
    try:
        user_id = get_jwt_identity()
        employee = Employee.query.filter_by(id=id, user_id=user_id).first()
        
        if not employee:
            return jsonify({'message': 'Employee not found'}), 404

        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        required_fields = ['first_name', 'last_name', 'email', 'phone', 'position', 'department', 'hire_date']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'message': 'Missing required fields',
                'fields': missing_fields
            }), 422

        # Check if email is already in use by another employee
        existing_employee = Employee.query.filter_by(email=data['email']).first()
        if existing_employee and existing_employee.id != id:
            return jsonify({'message': 'Email already in use'}), 409

        employee.first_name = data['first_name']
        employee.last_name = data['last_name']
        employee.email = data['email']
        employee.phone = data['phone']
        employee.position = data['position']
        employee.department = data['department']
        employee.hire_date = datetime.strptime(data['hire_date'], '%Y-%m-%d').date()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Employee updated successfully',
            'employee': {
                'id': employee.id,
                'first_name': employee.first_name,
                'last_name': employee.last_name,
                'email': employee.email,
                'phone': employee.phone,
                'position': employee.position,
                'department': employee.department,
                'hire_date': employee.hire_date.strftime('%Y-%m-%d')
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating employee: {str(e)}")
        return jsonify({'message': 'An error occurred while updating employee'}), 500

@app.route('/api/employees/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_employee(id):
    try:
        user_id = get_jwt_identity()
        employee = Employee.query.filter_by(id=id, user_id=user_id).first()
        
        if not employee:
            return jsonify({'message': 'Employee not found'}), 404

        db.session.delete(employee)
        db.session.commit()
        
        return jsonify({'message': 'Employee deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting employee: {str(e)}")
        return jsonify({'message': 'An error occurred while deleting employee'}), 500

if __name__ == '__main__':
    app.run(debug=True)

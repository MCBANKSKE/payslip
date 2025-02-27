from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from datetime import datetime
from models import db
from config import Config

app = Flask(__name__)
CORS(app)

# Load configuration
app.config.from_object(Config)
db.init_app(app)

def generate_payslip_pdf(data):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Add company header
    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, height - 50, data.get('company_name', 'Company Name'))
    
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 70, data.get('company_address', 'Company Address'))
    
    # Add Payslip title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(250, height - 100, "PAYSLIP")
    
    # Add employee details
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, height - 150, "Employee Details")
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 170, f"Name: {data.get('employee_name', '')}")
    c.drawString(50, height - 190, f"Position: {data.get('position', '')}")
    c.drawString(50, height - 210, f"Employee ID: {data.get('employee_id', '')}")
    
    # Add salary details
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, height - 250, "Salary Details")
    c.setFont("Helvetica", 12)
    basic_salary = float(data.get('basic_salary', 0))
    allowances = float(data.get('allowances', 0))
    deductions = float(data.get('deductions', 0))
    
    c.drawString(50, height - 270, f"Basic Salary: ${basic_salary:,.2f}")
    c.drawString(50, height - 290, f"Allowances: ${allowances:,.2f}")
    c.drawString(50, height - 310, f"Deductions: ${deductions:,.2f}")
    
    # Add total
    c.setFont("Helvetica-Bold", 12)
    net_salary = basic_salary + allowances - deductions
    c.drawString(50, height - 350, f"Net Salary: ${net_salary:,.2f}")
    
    # Add footer
    c.setFont("Helvetica-Oblique", 8)
    c.drawString(50, 50, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    c.save()
    buffer.seek(0)
    return buffer

@app.route('/api/payslip/generate', methods=['POST', 'OPTIONS'])
def generate_payslip():
    if request.method == 'OPTIONS':
        # Handle CORS preflight request
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
        
    try:
        data = request.get_json()
        print("Received data:", data)  # Debug print
        
        # Generate PDF
        pdf_buffer = generate_payslip_pdf(data)
        
        # Return the PDF file
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"payslip_{datetime.now().strftime('%Y%m%d')}.pdf"
        )
    except Exception as e:
        print(f"Error generating payslip: {str(e)}")  # Debug print
        return jsonify({'message': 'An error occurred while generating the payslip'}), 500

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
def get_recent_payslips():
    try:
        # Get the user's employees
        employees = Employee.query.all()
        
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
def get_recent_statements():
    try:
        # Get the user's employees
        employees = Employee.query.all()
        
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
def get_company_profile():
    try:
        company = CompanyProfile.query.first()
        
        if not company:
            return jsonify({'profile': None}), 200
            
        profile_data = {
            'name': company.name,
            'address': company.address,
            'phone': company.phone,
            'email': company.email,
            'website': company.website or '',
            'logo_url': company.logo_url or ''
        }
        
        return jsonify({'profile': profile_data}), 200
    except Exception as e:
        print(f"Error in get_company_profile: {str(e)}")
        return jsonify({'message': 'An error occurred while fetching company profile'}), 500

@app.route('/api/profile/company', methods=['POST'])
def setup_company_profile():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        required_fields = ['name', 'address', 'phone', 'email']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'message': 'Missing required fields',
                'fields': missing_fields
            }), 422

        # Check if company profile already exists
        company = CompanyProfile.query.first()
        
        if company:
            # Update existing company profile
            company.name = data['name']
            company.address = data['address']
            company.phone = data['phone']
            company.email = data['email']
            company.website = data.get('website', '')
            company.logo_url = data.get('logo_url', '')
        else:
            # Create new company profile
            company = CompanyProfile(
                name=data['name'],
                address=data['address'],
                phone=data['phone'],
                email=data['email'],
                website=data.get('website', ''),
                logo_url=data.get('logo_url', '')
            )
            db.session.add(company)
        
        db.session.commit()
        
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
        return jsonify({'message': 'An error occurred while saving company profile'}), 500

@app.route('/api/profile/bank', methods=['GET'])
def get_bank_profile():
    try:
        profile = BankProfile.query.first()
        
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
def setup_bank_profile():
    try:
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
        profile = BankProfile.query.first()
        
        if profile:
            # Update existing profile
            profile.bank_name = data['bankName']
            profile.account_number = data['accountNumber']
            profile.branch_code = data.get('branchCode', '')
            profile.swift_code = data.get('swiftCode', '')
        else:
            # Create new profile
            profile = BankProfile(
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
def get_employees():
    try:
        employees = Employee.query.all()
        
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
def create_employee():
    try:
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
def update_employee(id):
    try:
        employee = Employee.query.filter_by(id=id).first()
        
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
def delete_employee(id):
    try:
        employee = Employee.query.filter_by(id=id).first()
        
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

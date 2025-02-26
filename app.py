from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from datetime import datetime
import os
import json

app = Flask(__name__)
CORS(app)

def generate_payslip_pdf(data):
    filename = f"payslip_{data['employee_id']}_{datetime.now().strftime('%Y%m%d')}.pdf"
    c = canvas.Canvas(filename, pagesize=letter)
    
    # Add company header
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, 750, "Company Name")
    
    # Add payslip title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 700, "PAYSLIP")
    
    # Add employee details
    c.setFont("Helvetica", 12)
    c.drawString(50, 650, f"Employee Name: {data['employee_name']}")
    c.drawString(50, 630, f"Employee ID: {data['employee_id']}")
    c.drawString(50, 610, f"Period: {data['period']}")
    
    # Add salary details
    c.drawString(50, 570, f"Basic Salary: ${data['basic_salary']:.2f}")
    c.drawString(50, 550, f"Allowances: ${data['allowances']:.2f}")
    c.drawString(50, 530, f"Deductions: ${data['deductions']:.2f}")
    
    # Add total
    c.setFont("Helvetica-Bold", 12)
    total = data['basic_salary'] + data['allowances'] - data['deductions']
    c.drawString(50, 490, f"Net Pay: ${total:.2f}")
    
    c.save()
    return filename

def generate_bank_statement_pdf(data):
    filename = f"bank_statement_{data['account_number']}_{datetime.now().strftime('%Y%m%d')}.pdf"
    c = canvas.Canvas(filename, pagesize=letter)
    
    # Add bank header
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, 750, "Bank Name")
    
    # Add statement title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 700, "BANK STATEMENT")
    
    # Add account details
    c.setFont("Helvetica", 12)
    c.drawString(50, 650, f"Account Holder: {data['account_holder']}")
    c.drawString(50, 630, f"Account Number: {data['account_number']}")
    c.drawString(50, 610, f"Period: {data['period']}")
    
    # Add transactions
    y_position = 570
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_position, "Date")
    c.drawString(150, y_position, "Description")
    c.drawString(350, y_position, "Amount")
    c.drawString(450, y_position, "Balance")
    
    c.setFont("Helvetica", 12)
    for transaction in data['transactions']:
        y_position -= 20
        c.drawString(50, y_position, transaction['date'])
        c.drawString(150, y_position, transaction['description'])
        c.drawString(350, y_position, f"${transaction['amount']:.2f}")
        c.drawString(450, y_position, f"${transaction['balance']:.2f}")
    
    c.save()
    return filename

@app.route('/generate-payslip', methods=['POST'])
def create_payslip():
    try:
        data = request.json
        filename = generate_payslip_pdf(data)
        return send_file(filename, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/generate-bank-statement', methods=['POST'])
def create_bank_statement():
    try:
        data = request.json
        filename = generate_bank_statement_pdf(data)
        return send_file(filename, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)

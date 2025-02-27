from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from datetime import datetime

app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    app.run(debug=True)

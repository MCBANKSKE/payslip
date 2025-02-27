from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.graphics.shapes import Line, Drawing
from .pdf_styles import get_payslip_styles, PAYSLIP_COLORS
import io
import base64
from datetime import datetime

def generate_payslip_pdf(data):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Get styles
    styles = get_payslip_styles()
    elements = []
    
    # Add company logo if available
    if data.get('company_logo'):
        try:
            logo_data = base64.b64decode(data['company_logo'].split(',')[1])
            logo_buffer = io.BytesIO(logo_data)
            logo = Image(logo_buffer, width=2*inch, height=1*inch)
            logo.hAlign = 'CENTER'
            elements.append(logo)
            elements.append(Spacer(1, 20))
        except:
            pass
    
    # Add company name and header
    elements.append(Paragraph(data.get('company_name', 'Company Name'), styles['PayslipHeader']))
    elements.append(Paragraph('PAYSLIP', styles['PayslipHeader']))
    
    # Add period
    elements.append(Paragraph(f"Period: {data.get('month', '')}", styles['CompanyInfo']))
    
    # Add employee information
    employee_data = [
        ['Employee Name:', data.get('employeeName', '')],
        ['Employee ID:', data.get('employeeId', '')],
        ['Position:', data.get('position', '')]
    ]
    
    employee_table = Table(
        employee_data,
        colWidths=[2*inch, 4*inch],
        style=TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('TEXTCOLOR', (0, 0), (-1, -1), PAYSLIP_COLORS['text']),
            ('GRID', (0, 0), (-1, -1), 0.25, colors.white),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ])
    )
    elements.append(employee_table)
    elements.append(Spacer(1, 20))
    
    # Add earnings section
    elements.append(Paragraph('Earnings', styles['SectionHeader']))
    
    earnings_data = [
        ['Description', 'Amount'],
        ['Basic Salary', f"{data.get('currency', 'KES')} {data.get('basicSalary', 0):,.2f}"],
        ['Allowances', f"{data.get('currency', 'KES')} {data.get('allowances', 0):,.2f}"]
    ]
    
    earnings_table = Table(
        earnings_data,
        colWidths=[4*inch, 2*inch],
        style=TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('TEXTCOLOR', (0, 0), (-1, 0), PAYSLIP_COLORS['header']),
            ('BACKGROUND', (0, 0), (-1, 0), PAYSLIP_COLORS['table_header']),
            ('GRID', (0, 0), (-1, -1), 0.25, PAYSLIP_COLORS['text']),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [PAYSLIP_COLORS['table_row_odd'], PAYSLIP_COLORS['table_row_even']]),
        ])
    )
    elements.append(earnings_table)
    elements.append(Spacer(1, 20))
    
    # Add deductions section
    elements.append(Paragraph('Deductions', styles['SectionHeader']))
    
    deductions_data = [
        ['Description', 'Amount'],
        ['Deductions', f"{data.get('currency', 'KES')} {data.get('deductions', 0):,.2f}"]
    ]
    
    deductions_table = Table(
        deductions_data,
        colWidths=[4*inch, 2*inch],
        style=TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('TEXTCOLOR', (0, 0), (-1, 0), PAYSLIP_COLORS['header']),
            ('BACKGROUND', (0, 0), (-1, 0), PAYSLIP_COLORS['table_header']),
            ('GRID', (0, 0), (-1, -1), 0.25, PAYSLIP_COLORS['text']),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [PAYSLIP_COLORS['table_row_odd'], PAYSLIP_COLORS['table_row_even']]),
        ])
    )
    elements.append(deductions_table)
    elements.append(Spacer(1, 20))
    
    # Calculate net salary
    basic_salary = float(data.get('basicSalary', 0))
    allowances = float(data.get('allowances', 0))
    deductions = float(data.get('deductions', 0))
    net_salary = basic_salary + allowances - deductions
    
    # Add total section
    total_data = [
        ['', 'Net Salary:', f"{data.get('currency', 'KES')} {net_salary:,.2f}"]
    ]
    
    total_table = Table(
        total_data,
        colWidths=[3*inch, 1.5*inch, 1.5*inch],
        style=TableStyle([
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('TEXTCOLOR', (-1, -1), (-1, -1), PAYSLIP_COLORS['total']),
            ('GRID', (0, 0), (-1, -1), 0.25, colors.white),
        ])
    )
    elements.append(total_table)
    
    # Add footer
    elements.append(Spacer(1, 40))
    footer_text = f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    elements.append(Paragraph(footer_text, styles['CompanyInfo']))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer

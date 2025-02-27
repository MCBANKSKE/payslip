from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER

# Color schemes
PAYSLIP_COLORS = {
    'header': colors.HexColor('#1a237e'),  # Deep blue
    'subheader': colors.HexColor('#3949ab'),  # Lighter blue
    'text': colors.HexColor('#212121'),  # Dark gray
    'amount': colors.HexColor('#1b5e20'),  # Deep green
    'total': colors.HexColor('#b71c1c'),  # Deep red
    'table_header': colors.HexColor('#e8eaf6'),  # Light blue-gray
    'table_row_even': colors.HexColor('#f5f5f5'),  # Light gray
    'table_row_odd': colors.white
}

BANK_STATEMENT_COLORS = {
    'header': colors.HexColor('#004d40'),  # Deep teal
    'subheader': colors.HexColor('#00796b'),  # Lighter teal
    'text': colors.HexColor('#212121'),  # Dark gray
    'credit': colors.HexColor('#2e7d32'),  # Green
    'debit': colors.HexColor('#c62828'),  # Red
    'balance': colors.HexColor('#0d47a1'),  # Deep blue
    'table_header': colors.HexColor('#e0f2f1'),  # Light teal
    'table_row_even': colors.HexColor('#f5f5f5'),  # Light gray
    'table_row_odd': colors.white
}

def get_payslip_styles():
    styles = getSampleStyleSheet()
    
    # Header style
    styles.add(ParagraphStyle(
        'PayslipHeader',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=PAYSLIP_COLORS['header'],
        spaceAfter=30,
        alignment=TA_CENTER
    ))
    
    # Company info style
    styles.add(ParagraphStyle(
        'CompanyInfo',
        parent=styles['Normal'],
        fontSize=12,
        textColor=PAYSLIP_COLORS['subheader'],
        spaceAfter=20,
        alignment=TA_CENTER
    ))
    
    # Section header style
    styles.add(ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=PAYSLIP_COLORS['subheader'],
        spaceBefore=15,
        spaceAfter=10
    ))
    
    # Amount style
    styles.add(ParagraphStyle(
        'Amount',
        parent=styles['Normal'],
        fontSize=12,
        textColor=PAYSLIP_COLORS['amount'],
        alignment=TA_RIGHT
    ))
    
    # Total style
    styles.add(ParagraphStyle(
        'Total',
        parent=styles['Normal'],
        fontSize=14,
        textColor=PAYSLIP_COLORS['total'],
        alignment=TA_RIGHT,
        fontName='Helvetica-Bold'
    ))
    
    return styles

def get_bank_statement_styles():
    styles = getSampleStyleSheet()
    
    # Header style
    styles.add(ParagraphStyle(
        'StatementHeader',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=BANK_STATEMENT_COLORS['header'],
        spaceAfter=30,
        alignment=TA_CENTER
    ))
    
    # Bank info style
    styles.add(ParagraphStyle(
        'BankInfo',
        parent=styles['Normal'],
        fontSize=12,
        textColor=BANK_STATEMENT_COLORS['subheader'],
        spaceAfter=20,
        alignment=TA_CENTER
    ))
    
    # Account info style
    styles.add(ParagraphStyle(
        'AccountInfo',
        parent=styles['Normal'],
        fontSize=12,
        textColor=BANK_STATEMENT_COLORS['text'],
        spaceBefore=10,
        spaceAfter=10
    ))
    
    # Transaction credit style
    styles.add(ParagraphStyle(
        'Credit',
        parent=styles['Normal'],
        fontSize=11,
        textColor=BANK_STATEMENT_COLORS['credit'],
        alignment=TA_RIGHT
    ))
    
    # Transaction debit style
    styles.add(ParagraphStyle(
        'Debit',
        parent=styles['Normal'],
        fontSize=11,
        textColor=BANK_STATEMENT_COLORS['debit'],
        alignment=TA_RIGHT
    ))
    
    # Balance style
    styles.add(ParagraphStyle(
        'Balance',
        parent=styles['Normal'],
        fontSize=11,
        textColor=BANK_STATEMENT_COLORS['balance'],
        alignment=TA_RIGHT,
        fontName='Helvetica-Bold'
    ))
    
    return styles

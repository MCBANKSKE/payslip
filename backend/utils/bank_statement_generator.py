from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import inch, cm
from reportlab.graphics.shapes import Line, Drawing
from .pdf_styles import get_bank_statement_styles, BANK_STATEMENT_COLORS
import io
import base64
from datetime import datetime

def generate_bank_statement_pdf(data):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    # Get styles
    styles = get_bank_statement_styles()
    elements = []
    
    # Add bank logo if available
    if data.get('bank_logo'):
        try:
            logo_data = base64.b64decode(data['bank_logo'].split(',')[1])
            logo_buffer = io.BytesIO(logo_data)
            logo = Image(logo_buffer, width=2*inch, height=1*inch)
            logo.hAlign = 'CENTER'
            elements.append(logo)
            elements.append(Spacer(1, 20))
        except:
            pass
    
    # Add bank name and header
    elements.append(Paragraph(data.get('bank_name', 'Bank Name'), styles['StatementHeader']))
    elements.append(Paragraph('ACCOUNT STATEMENT', styles['StatementHeader']))
    
    # Add statement period
    elements.append(Paragraph(
        f"Statement Period: {data.get('fromDate', '')} to {data.get('toDate', '')}",
        styles['BankInfo']
    ))
    
    # Add account information
    account_data = [
        ['Account Name:', data.get('accountName', '')],
        ['Account Number:', data.get('accountNumber', '')]
    ]
    
    account_table = Table(
        account_data,
        colWidths=[2*inch, 4*inch],
        style=TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('TEXTCOLOR', (0, 0), (-1, -1), BANK_STATEMENT_COLORS['text']),
            ('GRID', (0, 0), (-1, -1), 0.25, colors.white),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ])
    )
    elements.append(account_table)
    elements.append(Spacer(1, 20))
    
    # Add initial balance
    initial_balance = float(data.get('initialBalance', 0))
    initial_balance_data = [
        ['Opening Balance:', f"{data.get('currency', 'KES')} {initial_balance:,.2f}"]
    ]
    
    initial_balance_table = Table(
        initial_balance_data,
        colWidths=[2*inch, 4*inch],
        style=TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('TEXTCOLOR', (0, 0), (-1, -1), BANK_STATEMENT_COLORS['balance']),
            ('GRID', (0, 0), (-1, -1), 0.25, colors.white),
        ])
    )
    elements.append(initial_balance_table)
    elements.append(Spacer(1, 20))
    
    # Add transactions
    transactions = data.get('transactions', [])
    if transactions:
        # Table header
        transactions_data = [
            ['No.', 'Date', 'Transaction ID', 'Description', 'Money In', 'Money Out', 'Balance']
        ]
        
        # Add transaction rows
        for idx, transaction in enumerate(transactions, 1):
            row = [
                str(idx),
                transaction.get('date', ''),
                transaction.get('id', ''),
                transaction.get('description', ''),
                f"{data.get('currency', 'KES')} {float(transaction.get('moneyIn', 0)):,.2f}" if float(transaction.get('moneyIn', 0)) > 0 else '',
                f"{data.get('currency', 'KES')} {float(transaction.get('moneyOut', 0)):,.2f}" if float(transaction.get('moneyOut', 0)) > 0 else '',
                f"{data.get('currency', 'KES')} {float(transaction.get('balance', 0)):,.2f}"
            ]
            transactions_data.append(row)
        
        # Create transactions table
        col_widths = [0.5*inch, 1*inch, 1.5*inch, 3*inch, 1.5*inch, 1.5*inch, 1.5*inch]
        transactions_table = Table(
            transactions_data,
            colWidths=col_widths,
            repeatRows=1,
            style=TableStyle([
                # Header style
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('TEXTCOLOR', (0, 0), (-1, 0), BANK_STATEMENT_COLORS['header']),
                ('BACKGROUND', (0, 0), (-1, 0), BANK_STATEMENT_COLORS['table_header']),
                
                # Data alignment
                ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # No.
                ('ALIGN', (1, 1), (1, -1), 'LEFT'),    # Date
                ('ALIGN', (2, 1), (2, -1), 'LEFT'),    # Transaction ID
                ('ALIGN', (3, 1), (3, -1), 'LEFT'),    # Description
                ('ALIGN', (4, 1), (-1, -1), 'RIGHT'),  # Amounts
                
                # Fonts and colors
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('TEXTCOLOR', (4, 1), (4, -1), BANK_STATEMENT_COLORS['credit']),  # Money In
                ('TEXTCOLOR', (5, 1), (5, -1), BANK_STATEMENT_COLORS['debit']),   # Money Out
                ('TEXTCOLOR', (6, 1), (6, -1), BANK_STATEMENT_COLORS['balance']), # Balance
                
                # Grid
                ('GRID', (0, 0), (-1, -1), 0.25, BANK_STATEMENT_COLORS['text']),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [BANK_STATEMENT_COLORS['table_row_odd'], BANK_STATEMENT_COLORS['table_row_even']]),
            ])
        )
        elements.append(transactions_table)
        
        # Add closing balance
        elements.append(Spacer(1, 20))
        closing_balance = float(transactions[-1].get('balance', 0))
        closing_balance_data = [
            ['', '', '', '', '', 'Closing Balance:', f"{data.get('currency', 'KES')} {closing_balance:,.2f}"]
        ]
        
        closing_balance_table = Table(
            closing_balance_data,
            colWidths=col_widths,
            style=TableStyle([
                ('ALIGN', (-2, -1), (-1, -1), 'RIGHT'),
                ('FONTNAME', (-2, -1), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (-2, -1), (-1, -1), 10),
                ('TEXTCOLOR', (-1, -1), (-1, -1), BANK_STATEMENT_COLORS['balance']),
                ('GRID', (0, 0), (-1, -1), 0.25, colors.white),
            ])
        )
        elements.append(closing_balance_table)
    
    # Add footer
    elements.append(Spacer(1, 40))
    footer_text = f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    elements.append(Paragraph(footer_text, styles['BankInfo']))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer

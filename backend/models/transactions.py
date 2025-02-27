from ..config.db import db
from datetime import datetime

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.String(20), unique=True, nullable=False)
    account_name = db.Column(db.String(100), nullable=False)
    account_number = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(200))
    money_in = db.Column(db.Decimal(10, 2), default=0)
    money_out = db.Column(db.Decimal(10, 2), default=0)
    balance = db.Column(db.Decimal(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'transaction_id': self.transaction_id,
            'account_name': self.account_name,
            'account_number': self.account_number,
            'date': self.date.isoformat(),
            'description': self.description,
            'money_in': float(self.money_in),
            'money_out': float(self.money_out),
            'balance': float(self.balance),
            'created_at': self.created_at.isoformat()
        }

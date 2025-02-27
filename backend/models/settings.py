from ..config.db import db
from datetime import datetime

class Settings(db.Model):
    __tablename__ = 'settings'
    
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(100))
    company_logo = db.Column(db.Text)  # Store as base64
    bank_name = db.Column(db.String(100))
    bank_logo = db.Column(db.Text)  # Store as base64
    currency = db.Column(db.String(3), default='KES')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'company_name': self.company_name,
            'company_logo': self.company_logo,
            'bank_name': self.bank_name,
            'bank_logo': self.bank_logo,
            'currency': self.currency,
            'updated_at': self.updated_at.isoformat()
        }

from app import db, app
from models import User, CompanyProfile, Employee, BankStatement, Payslip

def init_db():
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created successfully")

if __name__ == '__main__':
    init_db()

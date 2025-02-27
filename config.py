import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    # Database
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://root:@localhost/payslip_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

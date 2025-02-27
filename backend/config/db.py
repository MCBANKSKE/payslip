from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()

def init_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:@localhost/payslip_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    Migrate(app, db)
    
    # Import models here to ensure they're registered with SQLAlchemy
    from ..models import settings, transactions, users
    
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()

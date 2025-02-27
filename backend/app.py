from flask import Flask
from flask_cors import CORS
from config.db import init_db
from routes.settings import settings_bp
from routes.transactions import transactions_bp

app = Flask(__name__)
CORS(app)

# Initialize database
init_db(app)

# Register blueprints
app.register_blueprint(settings_bp)
app.register_blueprint(transactions_bp)

if __name__ == '__main__':
    app.run(debug=True)

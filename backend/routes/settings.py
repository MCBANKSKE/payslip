from flask import Blueprint, request, jsonify
from ..models.settings import Settings
from ..config.db import db

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/api/settings', methods=['GET'])
def get_settings():
    settings = Settings.query.first()
    if not settings:
        return jsonify({'message': 'No settings found'}), 404
    return jsonify(settings.to_dict())

@settings_bp.route('/api/settings', methods=['POST'])
def save_settings():
    data = request.json
    settings = Settings.query.first()
    
    if not settings:
        settings = Settings()
        db.session.add(settings)
    
    settings.company_name = data.get('company_name')
    settings.company_logo = data.get('company_logo')
    settings.bank_name = data.get('bank_name')
    settings.bank_logo = data.get('bank_logo')
    settings.currency = data.get('currency', 'KES')
    
    try:
        db.session.commit()
        return jsonify(settings.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

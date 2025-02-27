from flask import Blueprint, request, jsonify
from ..models.transactions import Transaction
from ..config.db import db
from datetime import datetime

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/api/transactions', methods=['GET'])
def get_transactions():
    account_number = request.args.get('account_number')
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    
    query = Transaction.query
    
    if account_number:
        query = query.filter_by(account_number=account_number)
    if from_date:
        query = query.filter(Transaction.date >= from_date)
    if to_date:
        query = query.filter(Transaction.date <= to_date)
        
    transactions = query.order_by(Transaction.date).all()
    return jsonify([t.to_dict() for t in transactions])

@transactions_bp.route('/api/transactions', methods=['POST'])
def save_transactions():
    data = request.json
    transactions_data = data.get('transactions', [])
    account_name = data.get('account_name')
    account_number = data.get('account_number')
    
    try:
        # First, remove old transactions for this account
        Transaction.query.filter_by(account_number=account_number).delete()
        
        # Add new transactions
        for t in transactions_data:
            transaction = Transaction(
                transaction_id=t['id'],
                account_name=account_name,
                account_number=account_number,
                date=datetime.strptime(t['date'], '%Y-%m-%d').date(),
                description=t['description'],
                money_in=t['moneyIn'],
                money_out=t['moneyOut'],
                balance=t['balance']
            )
            db.session.add(transaction)
            
        db.session.commit()
        return jsonify({'message': 'Transactions saved successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

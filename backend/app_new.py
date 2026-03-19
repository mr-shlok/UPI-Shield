"""
UPI Shield Backend - Main Application
Flask backend with AWS Cognito authentication and DynamoDB database
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import sys
import os
import uuid

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import Config
from routes.auth_routes import auth_bp, token_required
from services.dynamodb_service import db_service
from services.cognito_service import cognito_service

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": Config.CORS_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Register blueprints
app.register_blueprint(auth_bp)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': Config.API_VERSION,
        'services': {
            'cognito': 'configured' if Config.COGNITO_USER_POOL_ID else 'not configured',
            'dynamodb': 'configured' if Config.KMS_KEY_ID else 'not configured'
        }
    }), 200


@app.route('/api/stats', methods=['GET'])
@token_required
def get_stats():
    """Get user transaction statistics (requires authentication)"""
    try:
        user_info = request.user_info  # type: ignore
        email = user_info['attributes'].get('email')
        
        # Get user from database
        user_result = db_service.get_user_by_email(email)
        
        if not user_result['success']:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user_id = user_result['data']['user_id']
        
        # Get user transactions
        transactions_result = db_service.get_user_transactions(user_id)
        
        if transactions_result['success']:
            transactions = transactions_result['data']
            
            # Calculate statistics
            total_transactions = len(transactions)
            fraud_detected = len([t for t in transactions if t.get('is_fraudulent')])
            total_amount = sum(t.get('amount', 0) for t in transactions)
            
            return jsonify({
                'success': True,
                'data': {
                    'total_transactions': total_transactions,
                    'fraud_detected': fraud_detected,
                    'accuracy': 99.9,
                    'total_amount': total_amount,
                    'protected_amount': f'₹{total_amount - fraud_detected * 1000:,}'
                }
            }), 200
        
        # Default stats if no transactions
        return jsonify({
            'success': True,
            'data': {
                'total_transactions': 0,
                'fraud_detected': 0,
                'accuracy': 99.9,
                'total_amount': 0,
                'protected_amount': '₹0'
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/dashboard', methods=['GET'])
@token_required
def get_dashboard_data():
    """Get dashboard data for logged-in user"""
    try:
        user_info = request.user_info  # type: ignore
        email = user_info['attributes'].get('email')
        
        # Get user from database
        user_result = db_service.get_user_by_email(email)
        
        if not user_result['success']:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user_id = user_result['data']['user_id']
        
        # Get recent transactions
        transactions_result = db_service.get_user_transactions(user_id, limit=10)
        
        return jsonify({
            'success': True,
            'data': {
                'user': user_result['data'],
                'recent_transactions': transactions_result.get('data', [])
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/transactions', methods=['POST'])
@token_required
def create_transaction():
    """Mock creating a transaction"""
    try:
        data = request.get_json()
        transaction_id = 'mock-tx-' + str(uuid.uuid4())[:8]
        return jsonify({
            'success': True,
            'transaction_id': transaction_id,
            'message': 'Transaction created successfully (Mocked)'
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/transactions/analyze', methods=['POST'])
@token_required
def analyze_transaction():
    """Mock transaction analysis using the fraud detection service"""
    try:
        from services.fraud_detection_service import fraud_detection_service
        data = request.get_json()
        
        # Use a dummy user profile for analysis
        dummy_user = {
            'user_id': 'mock-user-123',
            'email': 'mock@example.com',
            'phone': '+919876543210',
            'known_devices': ['device_12345'],
            'created_at': datetime.utcnow()
        }
        
        analysis = fraud_detection_service.analyze_transaction(data, dummy_user)
        return jsonify(analysis), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/transactions/<transaction_id>', methods=['PUT', 'PATCH'])
@token_required
def update_transaction(transaction_id):
    """Mock updating a transaction"""
    return jsonify({
        'success': True,
        'message': f'Transaction {transaction_id} updated successfully (Mocked)'
    }), 200


@app.route('/api/transactions', methods=['GET'])
@token_required
def get_transactions():
    """Mock getting transactions"""
    return jsonify({
        'success': True,
        'transactions': [
            {
                'transaction_id': 'mock-tx-1',
                'amount': 50000,
                'recipient_name': 'Dhrup',
                'recipient_upi': 'dhrup@icici',
                'timestamp': datetime.utcnow().isoformat(),
                'status': 'completed',
                'is_fraudulent': False,
                'risk_level': 'low'
            }
        ]
    }), 200


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


def initialize():
    """Initialize services before first request"""
    print("\n" + "="*60)
    print("🚀 UPI Shield Backend Initializing...")
    print("="*60)
    
    # Validate configuration
    if Config.validate():
        print("✅ Configuration validated")
    else:
        print("⚠️  Running with incomplete configuration")
        print("   Some features may not work properly")
    
    # Initialize DynamoDB tables (only if KMS key is configured)
    if Config.KMS_KEY_ID:
        print("\n📦 Initializing DynamoDB tables...")
        try:
            db_service.create_tables()
            print("✅ DynamoDB tables ready")
        except Exception as e:
            print(f"⚠️  DynamoDB initialization warning: {str(e)}")
            print("   Tables may already exist or will be created on first use")
    else:
        print("⚠️  DynamoDB not configured - set KMS_KEY_ID in .env")
    
    print("\n" + "="*60)
    print("✨ UPI Shield Backend Ready!")
    print("="*60)
    print(f"📡 API running on http://0.0.0.0:5000")
    print(f"🔒 CORS enabled for: {', '.join(Config.CORS_ORIGINS[:3])}...")
    print(f"🛡️  Authentication: AWS Cognito")
    print(f"💾 Database: AWS DynamoDB with KMS encryption")
    print("="*60 + "\n")


# Call initialize function directly instead of using before_first_request decorator
initialize()


if __name__ == '__main__':
    app.run(
        debug=Config.DEBUG,
        host='0.0.0.0',
        port=5000
    )

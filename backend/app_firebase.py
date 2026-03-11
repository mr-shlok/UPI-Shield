"""
UPI Shield Backend - Firebase Version
Flask backend with Firebase Authentication and Firestore database
"""
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config_firebase import FirebaseConfig
from routes.auth_routes_firebase import auth_firebase_bp, token_required
from services.firebase_service import firebase_service
from services.fraud_detection_service import fraud_detection_service
from services.encryption_service import encrypt_field
from firebase_admin import firestore

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(FirebaseConfig)

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": FirebaseConfig.CORS_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Configure Rate Limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=[
        f"{FirebaseConfig.RATE_LIMIT_PER_MINUTE} per minute",
        f"{FirebaseConfig.RATE_LIMIT_PER_HOUR} per hour"
    ],
    storage_uri="memory://"
)

# Register blueprints
app.register_blueprint(auth_firebase_bp)


# ==================== Middleware ====================

@app.before_request
def before_request():
    """Log all requests"""
    g.start_time = datetime.utcnow()


@app.after_request
def after_request(response):
    """Add security headers and log response"""
    # Add CORS headers for all responses
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    
    # Security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    
    # HTTPS redirect header (for production)
    if not FirebaseConfig.DEBUG:
        response.headers['Content-Security-Policy'] = "upgrade-insecure-requests"
    
    return response


# ==================== Health & Info Endpoints ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': FirebaseConfig.API_VERSION,
        'services': {
            'firebase_auth': 'configured',
            'firestore': 'configured',
            'encryption': 'enabled'
        }
    }), 200


@app.route('/api/<path:path>', methods=['OPTIONS'])
@app.route('/api', methods=['OPTIONS'])
def handle_options(path=None):
    """Handle preflight OPTIONS requests"""
    response = jsonify({'status': 'OK'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Max-Age', '86400')  # 24 hours
    return response, 200


@app.route('/api/config', methods=['GET'])
def get_client_config():
    """Get Firebase configuration for client-side initialization"""
    return jsonify({
        'success': True,
        'firebase': FirebaseConfig.get_firebase_config()
    }), 200


# ==================== Transaction Endpoints ====================

@app.route('/api/transactions', methods=['GET'])
@token_required
def get_transactions():
    """Get user's transactions (requires authentication)"""
    try:
        # Get current user from request context
        uid = getattr(request, 'current_user', {}).get('uid')
        
        if not uid:
            return jsonify({
                'success': False,
                'error': 'User not authenticated'
            }), 401
        
        # Get limit from query params
        limit = request.args.get('limit', 50, type=int)
        
        result = firebase_service.get_user_transactions(uid, limit=limit)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/transactions', methods=['POST'])
@token_required
def create_transaction():
    """Create new transaction with real-time fraud detection (requires authentication)"""
    try:
        uid = getattr(request, 'current_user', {}).get('uid')
        
        if not uid:
            return jsonify({
                'success': False,
                'error': 'User not authenticated'
            }), 401
        
        data = request.get_json()
        
        # Add user ID to transaction
        data['uid'] = uid
        data['timestamp'] = datetime.utcnow()
        
        # Validate required fields
        required_fields = ['amount', 'recipient_name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Get user data for fraud analysis
        user_result = firebase_service.get_user(uid)
        if not user_result['success']:
            return jsonify(user_result), 404
        
        user_data = user_result['user']
        
        # Get historical transaction data for pattern analysis
        historical_result = firebase_service.get_user_transactions(uid, limit=100)
        historical_data = {}
        if historical_result['success']:
            transactions = historical_result['transactions']
            if transactions:
                # Calculate average transaction velocity
                total_amount = sum(t.get('amount', 0) for t in transactions)
                avg_velocity = total_amount / len(transactions) if transactions else 1.0
                historical_data['average_transaction_velocity'] = avg_velocity
        
        # Perform real-time fraud detection
        fraud_analysis = fraud_detection_service.analyze_transaction(
            transaction_data=data,
            user_data=user_data,
            historical_data=historical_data
        )
        
        # Add fraud analysis results to transaction data
        data['is_fraudulent'] = fraud_analysis['is_fraudulent']
        data['risk_score'] = fraud_analysis['risk_score']
        data['risk_level'] = fraud_analysis['risk_level']
        data['fraud_factors'] = fraud_analysis['factors']
        
        # If high risk, we might want to flag for review or block
        if fraud_analysis['risk_score'] >= 80:
            data['status'] = 'flagged'
            data['review_required'] = True
        elif fraud_analysis['risk_score'] >= 65:
            data['status'] = 'suspicious'
            data['review_required'] = True
        else:
            data['status'] = 'approved'
            data['review_required'] = False
        
        # Encrypt sensitive fields
        if 'upi_id' in data:
            data['upi_id'] = encrypt_field(data['upi_id'])
        
        if 'recipient_upi' in data:
            data['recipient_upi'] = encrypt_field(data['recipient_upi'])
        
        data['created_at'] = firestore.SERVER_TIMESTAMP
        data['updated_at'] = firestore.SERVER_TIMESTAMP
        
        # Create transaction document
        transaction_ref = firebase_service.db.collection(FirebaseConfig.COLLECTION_TRANSACTIONS).document()
        transaction_ref.set(data)
        
        # Log fraud detection result
        fraud_log = {
            'transaction_id': transaction_ref.id,
            'user_id': uid,
            'risk_score': fraud_analysis['risk_score'],
            'is_fraudulent': fraud_analysis['is_fraudulent'],
            'risk_level': fraud_analysis['risk_level'],
            'factors': fraud_analysis['factors'],
            'timestamp': firestore.SERVER_TIMESTAMP
        }
        firebase_service.create_fraud_log(fraud_log)
        
        # Update user's fraud risk score based on transaction
        current_fraud_score = user_data.get('fraud_risk_score', 0.0)
        new_fraud_score = min(100, current_fraud_score + (fraud_analysis['risk_score'] * 0.1))
        firebase_service.update_user_fraud_risk_score(uid, new_fraud_score)
        
        return jsonify({
            'success': True,
            'transaction_id': transaction_ref.id,
            'fraud_analysis': {
                'risk_score': fraud_analysis['risk_score'],
                'is_fraudulent': fraud_analysis['is_fraudulent'],
                'risk_level': fraud_analysis['risk_level'],
                'status': data['status']
            }
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/transactions/<transaction_id>', methods=['PUT'])
@token_required
def update_transaction(transaction_id):
    """Update transaction with fraud analysis results"""
    try:
        uid = getattr(request, 'current_user', {}).get('uid')
        
        if not uid:
            return jsonify({
                'success': False,
                'error': 'User not authenticated'
            }), 401
        
        data = request.get_json()
        
        # Update transaction with fraud analysis results
        update_data = {
            'is_fraudulent': data.get('is_fraudulent', False),
            'risk_score': data.get('risk_score', 0),
            'risk_level': data.get('risk_level', 'low'),
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        
        # Update transaction in Firestore
        transaction_ref = firebase_service.db.collection(FirebaseConfig.COLLECTION_TRANSACTIONS).document(transaction_id)
        transaction_ref.update(update_data)
        
        return jsonify({
            'success': True,
            'message': 'Transaction updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/transactions/analyze', methods=['POST'])
@token_required
def analyze_transaction():
    """
    Analyze transaction for fraud using comprehensive parameter analysis
    """
    try:
        data = request.get_json()
        
        # Get current user from request context
        uid = getattr(request, 'current_user', {}).get('uid')
        
        if not uid:
            return jsonify({
                'success': False,
                'error': 'User not authenticated'
            }), 401
        
        # Get user data
        user_result = firebase_service.get_user(uid)
        if not user_result['success']:
            return jsonify(user_result), 404
        
        user_data = user_result['user']
        
        # Get historical transaction data for pattern analysis
        historical_result = firebase_service.get_user_transactions(uid, limit=100)
        historical_data = {}
        if historical_result['success']:
            transactions = historical_result['transactions']
            if transactions:
                # Calculate average transaction velocity
                total_amount = sum(t.get('amount', 0) for t in transactions)
                avg_velocity = total_amount / len(transactions) if transactions else 1.0
                historical_data['average_transaction_velocity'] = avg_velocity
        
        # Import and use fraud detection service
        from services.fraud_detection_service import fraud_detection_service
        
        # Analyze transaction for fraud
        result = fraud_detection_service.analyze_transaction(
            transaction_data=data,
            user_data=user_data,
            historical_data=historical_data
        )
        
        # Log fraud detection result
        fraud_log = {
            'transaction_id': data.get('transaction_id', 'unknown'),
            'user_id': uid,
            'risk_score': result['risk_score'],
            'is_fraudulent': result['is_fraudulent'],
            'risk_level': result['risk_level'],
            'factors': result['factors'],
            'timestamp': result['timestamp']
        }
        firebase_service.create_fraud_log(fraud_log)
        
        return jsonify({
            'success': True,
            'message': 'Fraud detection analysis complete',
            'risk_score': result['risk_score'],
            'is_fraudulent': result['is_fraudulent'],
            'risk_level': result['risk_level'],
            'factors': result['factors']
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ==================== Dashboard Endpoints ====================

@app.route('/api/dashboard', methods=['GET'])
@token_required
def get_dashboard_data():
    """Get dashboard data for logged-in user"""
    try:
        uid = getattr(request, 'current_user', {}).get('uid')
        
        if not uid:
            return jsonify({
                'success': False,
                'error': 'User not authenticated'
            }), 401
        
        # Get user info
        user_result = firebase_service.get_user(uid)
        
        if not user_result['success']:
            return jsonify(user_result), 404
        
        # Get recent transactions
        transactions_result = firebase_service.get_user_transactions(uid, limit=10)
        
        return jsonify({
            'success': True,
            'data': {
                'user': user_result['user'],
                'recent_transactions': transactions_result.get('transactions', [])
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/stats', methods=['GET'])
@token_required
def get_stats():
    """Get user transaction statistics (requires authentication)"""
    try:
        uid = getattr(request, 'current_user', {}).get('uid')
        
        if not uid:
            return jsonify({
                'success': False,
                'error': 'User not authenticated'
            }), 401
        
        # Get user transactions
        transactions_result = firebase_service.get_user_transactions(uid)
        
        if not transactions_result['success']:
            return jsonify(transactions_result), 500
        
        transactions = transactions_result['transactions']
        
        # Calculate statistics
        total_transactions = len(transactions)
        total_amount = sum(t.get('amount', 0) for t in transactions)
        fraudulent_transactions = len([t for t in transactions if t.get('is_fraudulent', False)])
        
        # Get recent transactions (last 7 days)
        now = datetime.utcnow()
        week_ago = now.replace(day=now.day-7)
        recent_transactions = [t for t in transactions if t.get('created_at', datetime.min) >= week_ago]
        
        return jsonify({
            'success': True,
            'stats': {
                'total_transactions': total_transactions,
                'total_amount': total_amount,
                'fraudulent_transactions': fraudulent_transactions,
                'recent_transactions': len(recent_transactions),
                'fraud_percentage': (fraudulent_transactions / total_transactions * 100) if total_transactions > 0 else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ==================== Error Handlers ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    app.run(
        host=FirebaseConfig.HOST,
        port=FirebaseConfig.PORT,
        debug=FirebaseConfig.DEBUG
    )
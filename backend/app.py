from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import random

app = Flask(__name__)
CORS(app)

# Import Firebase authentication routes (preferred over AWS Cognito for development)
try:
    from routes.auth_routes_firebase import auth_firebase_bp, token_required
    app.register_blueprint(auth_firebase_bp)
    print("🔐 Firebase Authentication routes loaded successfully")
except ImportError:
    print("⚠️ Firebase auth routes not found - trying AWS Cognito routes")
    try:
        from routes.auth_routes import auth_bp
        app.register_blueprint(auth_bp)
        print("🔐 AWS Cognito Authentication routes loaded successfully")
    except ImportError:
        print("⚠️ Authentication routes not found - using basic API only")
        # Define a simple token_required decorator as fallback
        def token_required(f):
            def decorated(*args, **kwargs):
                # For basic functionality, allow all requests
                return f(*args, **kwargs)
            return decorated

# Import services for transaction processing
try:
    from services.firebase_service import firebase_service
    from services.fraud_detection_service import fraud_detection_service
    from services.encryption_service import encrypt_field
    from firebase_admin import firestore
    TRANSACTION_SERVICES_AVAILABLE = True
    print("💳 Transaction services loaded successfully")
except ImportError:
    TRANSACTION_SERVICES_AVAILABLE = False
    print("⚠️ Transaction services not available")

# Add a root endpoint to provide helpful information
@app.route('/')
def home():
    """Root endpoint with API information"""
    return jsonify({
        'message': 'UPI Shield Backend API',
        'version': '1.0',
        'endpoints': [
            '/api/health',
            '/api/stats', 
            '/api/alerts',
            '/api/transaction/analyze',
            '/api/dashboard',
            '/api/contact',
            '/api/subscribe',
            '/api/auth/register',  # Added auth endpoints
            '/api/auth/login',
            '/api/auth/verify-token',
            '/api/auth/forgot-password',
            '/api/transactions'  # Added transaction endpoints
        ],
        'status': 'running'
    })

# Sample data for demonstration
fraud_alerts = []
transaction_stats = {
    'total_transactions': 10245678,
    'fraud_detected': 12456,
    'accuracy': 99.9,
    'protected_amount': '₹50,00,00,000'
}


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get transaction statistics"""
    return jsonify({
        'success': True,
        'data': transaction_stats
    })


@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get fraud alerts"""
    # Generate sample alerts
    sample_alerts = [
        {
            'id': 1,
            'type': 'high_risk',
            'message': 'Suspicious transaction detected from unknown location',
            'amount': '₹50,000',
            'timestamp': datetime.now().isoformat(),
            'status': 'blocked'
        },
        {
            'id': 2,
            'type': 'medium_risk',
            'message': 'Unusual transaction pattern detected',
            'amount': '₹25,000',
            'timestamp': datetime.now().isoformat(),
            'status': 'flagged'
        },
        {
            'id': 3,
            'type': 'low_risk',
            'message': 'Multiple transactions in short time',
            'amount': '₹10,000',
            'timestamp': datetime.now().isoformat(),
            'status': 'monitoring'
        }
    ]
    
    return jsonify({
        'success': True,
        'data': sample_alerts
    })


@app.route('/api/transaction/analyze', methods=['POST'])
def analyze_transaction():
    """Analyze a transaction for fraud"""
    data = request.get_json()
    
    # Simulate fraud detection analysis
    risk_score = random.randint(0, 100)
    is_fraudulent = risk_score > 70
    
    response = {
        'success': True,
        'data': {
            'transaction_id': data.get('transaction_id', 'TXN' + str(random.randint(100000, 999999))),
            'risk_score': risk_score,
            'is_fraudulent': is_fraudulent,
            'risk_level': 'high' if risk_score > 70 else 'medium' if risk_score > 40 else 'low',
            'timestamp': datetime.now().isoformat(),
            'factors': [
                'Location verification',
                'Behavior analysis',
                'Transaction pattern',
                'Device fingerprint'
            ]
        }
    }
    
    return jsonify(response)


@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    """Get dashboard data"""
    return jsonify({
        'success': True,
        'data': {
            'transactions_today': random.randint(1000, 5000),
            'fraud_prevented': random.randint(10, 50),
            'total_saved': f'₹{random.randint(100000, 500000):,}',
            'active_alerts': random.randint(5, 20),
            'recent_transactions': [
                {
                    'id': f'TXN{i}',
                    'amount': f'₹{random.randint(100, 50000):,}',
                    'status': random.choice(['safe', 'flagged', 'blocked']),
                    'timestamp': datetime.now().isoformat()
                }
                for i in range(5)
            ]
        }
    })


@app.route('/api/contact', methods=['POST'])
def contact_form():
    """Handle contact form submissions"""
    data = request.get_json()
    
    # In a real application, you would save this to a database
    # and send notifications
    
    return jsonify({
        'success': True,
        'message': 'Thank you for contacting us! We will get back to you soon.'
    })


@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    """Handle newsletter subscriptions"""
    data = request.get_json()
    email = data.get('email')
    
    # In a real application, you would save this to a database
    
    return jsonify({
        'success': True,
        'message': f'Successfully subscribed {email} to our newsletter!'
    })


# Transaction endpoints (only if services are available)
if TRANSACTION_SERVICES_AVAILABLE:
    
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
            transaction_ref = firebase_service.db.collection('transactions').document()
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


    @app.route('/api/transactions/analyze', methods=['POST'])
    @token_required
    def analyze_transaction_endpoint():
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


if __name__ == '__main__':
    print("🚀 UPI Shield Backend Server Starting...")
    print("📡 API running on http://localhost:5000")
    print("🔒 CORS enabled for frontend communication")
    app.run(debug=True, host='0.0.0.0', port=5000)
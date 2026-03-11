"""
Firebase Authentication Routes
Includes: Email/Password, Phone OTP, Social Logins, JWT Session Management
"""
from flask import Blueprint, request, jsonify
from functools import wraps
from services.firebase_service import firebase_service
from config_firebase import FirebaseConfig
import re

auth_firebase_bp = Blueprint('auth_firebase', __name__, url_prefix='/api/auth')


# ==================== Middleware & Decorators ====================

def token_required(f):
    """Decorator to protect routes requiring authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'success': False, 'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'success': False, 'error': 'Token is missing'}), 401
        
        # Verify session token
        verification = firebase_service.verify_session_token(token)
        
        if not verification['success']:
            return jsonify({'success': False, 'error': verification['error']}), 401
        
        # Add user info to request
        request.current_user = {
            'uid': verification['uid'],
            'role': verification['role']
        }
        
        return f(*args, **kwargs)
    
    return decorated


def role_required(required_roles):
    """Decorator to check user role"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'current_user'):
                return jsonify({'success': False, 'error': 'Unauthorized'}), 401
            
            user_role = request.current_user.get('role')
            
            if user_role not in required_roles:
                return jsonify({'success': False, 'error': 'Insufficient permissions'}), 403
            
            return f(*args, **kwargs)
        return decorated
    return decorator


# ==================== Helper Functions ====================

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password):
    """Validate password strength"""
    if len(password) < FirebaseConfig.PASSWORD_MIN_LENGTH:
        return False, f'Password must be at least {FirebaseConfig.PASSWORD_MIN_LENGTH} characters'
    
    if not re.search(r'[A-Z]', password):
        return False, 'Password must contain at least one uppercase letter'
    
    if not re.search(r'[a-z]', password):
        return False, 'Password must contain at least one lowercase letter'
    
    if not re.search(r'[0-9]', password):
        return False, 'Password must contain at least one number'
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, 'Password must contain at least one special character'
    
    return True, 'Valid'


# ==================== Email/Password Authentication ====================

@auth_firebase_bp.route('/register', methods=['POST'])
def register():
    """
    Register new user with email and password
    
    Request Body:
        email: string (required)
        password: string (required)
        display_name: string (required)
        phone: string (optional)
    
    Returns:
        JSON response with registration status
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'display_name']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Validate email
        if not validate_email(data['email']):
            return jsonify({
                'success': False,
                'error': 'Invalid email format'
            }), 400
        
        # Validate password
        is_valid, message = validate_password(data['password'])
        if not is_valid:
            return jsonify({
                'success': False,
                'error': message
            }), 400
        
        # Create user
        result = firebase_service.create_user_with_email(
            email=data['email'],
            password=data['password'],
            display_name=data['display_name'],
            phone=data.get('phone')
        )
        
        if not result['success']:
            return jsonify(result), 400
        
        return jsonify({
            'success': True,
            'message': result['message'],
            'user': result['user']
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_firebase_bp.route('/login', methods=['POST'])
def login():
    """
    Login with email and password
    
    Request Body:
        email: string (required)
        password: string (required)
    
    Returns:
        JSON with custom token and session token
        Note: Client should exchange custom token for ID token using Firebase Client SDK
    """
    try:
        data = request.get_json()
        
        if 'email' not in data or 'password' not in data:
            return jsonify({
                'success': False,
                'error': 'Email and password are required'
            }), 400
        
        # Sign in user
        result = firebase_service.sign_in_with_email(
            email=data['email'],
            password=data['password']
        )
        
        if not result['success']:
            return jsonify(result), 401
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'custom_token': result['custom_token'],
            'session_token': result['session_token'],
            'session_id': result['session_id'],
            'user': result['user']
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_firebase_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """
    Verify Firebase ID token
    
    Request Body:
        id_token: string (required) - Firebase ID token from client
    
    Returns:
        JSON with verification status and user info
    """
    try:
        data = request.get_json()
        
        if 'id_token' not in data:
            return jsonify({
                'success': False,
                'error': 'ID token is required'
            }), 400
        
        result = firebase_service.verify_id_token(data['id_token'])
        
        if not result['success']:
            return jsonify(result), 401
        
        # Return the proper format expected by frontend
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'session_token': result['session_token'],
            'session_id': result['session_id'],
            'user': result['user']
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_firebase_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """
    Logout user and revoke session
    
    Headers:
        Authorization: Bearer <session_token>
    
    Request Body:
        session_id: string (required)
    
    Returns:
        JSON with logout status
    """
    try:
        data = request.get_json()
        
        if 'session_id' not in data:
            return jsonify({
                'success': False,
                'error': 'Session ID is required'
            }), 400
        
        result = firebase_service.revoke_session(data['session_id'])
        
        return jsonify({
            'success': True,
            'message': 'Logged out successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ==================== Phone Number Verification ====================

@auth_firebase_bp.route('/send-phone-otp', methods=['POST'])
@token_required
def send_phone_otp():
    """
    Initiate phone number verification
    Note: Actual OTP sending happens on client side using Firebase Client SDK
    
    Request Body:
        phone: string (required) - Phone number in E.164 format (+91xxxxxxxxxx)
    
    Returns:
        JSON with status
    """
    try:
        data = request.get_json()
        
        if 'phone' not in data:
            return jsonify({
                'success': False,
                'error': 'Phone number is required'
            }), 400
        
        result = firebase_service.send_phone_verification(data['phone'])
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_firebase_bp.route('/verify-phone', methods=['POST'])
@token_required
def verify_phone():
    """
    Verify phone number after OTP verification on client
    
    Headers:
        Authorization: Bearer <session_token>
    
    Request Body:
        phone: string (required) - Verified phone number
    
    Returns:
        JSON with verification status
    """
    try:
        data = request.get_json()
        
        if 'phone' not in data:
            return jsonify({
                'success': False,
                'error': 'Phone number is required'
            }), 400
        
        uid = request.current_user['uid']
        
        result = firebase_service.verify_phone_token(uid, data['phone'])
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ==================== Social Logins ====================

@auth_firebase_bp.route('/social-login', methods=['POST'])
def social_login():
    """
    Handle social login (Google, Facebook)
    Note: Social authentication happens on client side using Firebase Client SDK
    This endpoint creates/updates user profile after social login
    
    Request Body:
        id_token: string (required) - Firebase ID token from social login
        provider: string (required) - 'google' or 'facebook'
    
    Returns:
        JSON with session token and user data
    """
    try:
        data = request.get_json()
        
        if 'id_token' not in data:
            return jsonify({
                'success': False,
                'error': 'ID token is required'
            }), 400
        
        # Verify the ID token
        verification = firebase_service.verify_id_token(data['id_token'])
        
        if not verification['success']:
            return jsonify(verification), 401
        
        uid = verification['uid']
        
        # Check if user exists in Firestore
        user_result = firebase_service.get_user(uid)
        
        if not user_result['success']:
            # Create user profile for social login
            user_data = {
                'uid': uid,
                'email': verification.get('email', ''),
                'display_name': data.get('display_name', ''),
                'phone': '',
                'role': 'user',
                'is_active': True,
                'fraud_risk_score': 0.0,  # Initialize fraud risk score to 0%
                'email_verified': verification.get('email_verified', False),
                'phone_verified': False,
                'auth_provider': data.get('provider', 'unknown'),
                'profile': {
                    'avatar_url': data.get('photo_url', ''),
                    'preferences': {}
                }
            }
            
            firebase_service.db.collection(FirebaseConfig.COLLECTION_USERS).document(uid).set(user_data)
            user_result = {'success': True, 'user': user_data}
        
        # Generate session token
        session_token = firebase_service._generate_session_token(
            uid,
            user_result['user'].get('role', 'user')
        )
        session_id = firebase_service._create_session(uid)
        
        return jsonify({
            'success': True,
            'message': 'Social login successful',
            'session_token': session_token,
            'session_id': session_id,
            'user': user_result['user']
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ==================== User Management ====================

@auth_firebase_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    """
    Get current user information
    
    Headers:
        Authorization: Bearer <session_token>
    
    Returns:
        JSON with user data
    """
    try:
        uid = request.current_user['uid']
        
        result = firebase_service.get_user(uid)
        
        if not result['success']:
            return jsonify(result), 404
        
        return jsonify({
            'success': True,
            'user': result['user']
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_firebase_bp.route('/update-profile', methods=['PUT'])
@token_required
def update_profile():
    """
    Update user profile
    
    Headers:
        Authorization: Bearer <session_token>
    
    Request Body:
        display_name: string (optional)
        profile: object (optional) - Additional profile data
    
    Returns:
        JSON with update status
    """
    try:
        uid = request.current_user['uid']
        data = request.get_json()
        
        # Remove sensitive fields that shouldn't be updated
        disallowed_fields = ['uid', 'email', 'role', 'created_at']
        update_data = {k: v for k, v in data.items() if k not in disallowed_fields}
        
        result = firebase_service.update_user(uid, update_data)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_firebase_bp.route('/fraud-risk-score', methods=['GET'])
@token_required
def get_fraud_risk_score():
    """
    Get current user's fraud risk score
    
    Headers:
        Authorization: Bearer <session_token>
    
    Returns:
        JSON with fraud risk score
    """
    try:
        uid = request.current_user['uid']
        
        # Get user data from Firestore
        user_result = firebase_service.get_user(uid)
        
        if not user_result['success']:
            return jsonify(user_result), 404
        
        fraud_risk_score = user_result['user'].get('fraud_risk_score', 0.0)
        
        return jsonify({
            'success': True,
            'fraud_risk_score': fraud_risk_score
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_firebase_bp.route('/fraud-risk-score', methods=['PUT'])
@token_required
def update_fraud_risk_score():
    """
    Update user's fraud risk score (admin/internal use)
    
    Headers:
        Authorization: Bearer <session_token>
    
    Request Body:
        fraud_risk_score: float (required) - New fraud risk score (0-100)
    
    Returns:
        JSON with update status
    """
    try:
        uid = request.current_user['uid']
        data = request.get_json()
        
        if 'fraud_risk_score' not in data:
            return jsonify({
                'success': False,
                'error': 'fraud_risk_score is required'
            }), 400
        
        risk_score = float(data['fraud_risk_score'])
        
        # Validate risk score range
        if risk_score < 0 or risk_score > 100:
            return jsonify({
                'success': False,
                'error': 'fraud_risk_score must be between 0 and 100'
            }), 400
        
        result = firebase_service.update_user_fraud_risk_score(uid, risk_score)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ==================== Admin Routes ====================

@auth_firebase_bp.route('/admin/update-role', methods=['PUT'])
@token_required
@role_required(['admin'])
def update_user_role():
    """
    Update user role (admin only)
    
    Headers:
        Authorization: Bearer <session_token>
    
    Request Body:
        uid: string (required) - User ID to update
        role: string (required) - New role (user/admin/moderator)
    
    Returns:
        JSON with update status
    """
    try:
        data = request.get_json()
        
        if 'uid' not in data or 'role' not in data:
            return jsonify({
                'success': False,
                'error': 'UID and role are required'
            }), 400
        
        result = firebase_service.update_user_role(data['uid'], data['role'])
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
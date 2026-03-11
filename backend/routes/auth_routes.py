"""
Authentication routes using AWS Cognito
"""
from flask import Blueprint, request, jsonify
from functools import wraps
from services.cognito_service import cognito_service
from services.dynamodb_service import db_service

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def token_required(f):
    """Decorator to protect routes requiring authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]  # Bearer <token>
        
        if not token:
            return jsonify({'success': False, 'error': 'Token is missing'}), 401
        
        if not cognito_service.verify_token(token):
            return jsonify({'success': False, 'error': 'Token is invalid'}), 401
        
        # Get user info and add to request
        user_info = cognito_service.get_user(token)
        if user_info['success']:
            request.user_info = user_info
        
        return f(*args, **kwargs)
    
    return decorated


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    
    Request Body:
        email: string (required)
        password: string (required)
        name: string (required)
        phone: string (optional)
    
    Returns:
        JSON response with registration status
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Register with Cognito
        cognito_result = cognito_service.sign_up(
            email=data['email'],
            password=data['password'],
            name=data['name'],
            phone=data.get('phone')
        )
        
        if not cognito_result['success']:
            return jsonify(cognito_result), 400
        
        # Create user in DynamoDB
        db_result = db_service.create_user({
            'email': data['email'],
            'cognito_sub': cognito_result['user_sub'],
            'name': data['name'],
            'phone': data.get('phone', '')
        })
        
        if not db_result['success']:
            return jsonify(db_result), 500
        
        return jsonify({
            'success': True,
            'message': cognito_result['message'],
            'user_id': db_result['user_id']
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    """
    Verify email with confirmation code
    
    Request Body:
        email: string (required)
        code: string (required)
    
    Returns:
        JSON response with verification status
    """
    try:
        data = request.get_json()
        
        if 'email' not in data or 'code' not in data:
            return jsonify({
                'success': False,
                'error': 'Email and code are required'
            }), 400
        
        result = cognito_service.confirm_sign_up(
            email=data['email'],
            confirmation_code=data['code']
        )
        
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_bp.route('/resend-code', methods=['POST'])
def resend_code():
    """
    Resend verification code
    
    Request Body:
        email: string (required)
    
    Returns:
        JSON response with status
    """
    try:
        data = request.get_json()
        
        if 'email' not in data:
            return jsonify({
                'success': False,
                'error': 'Email is required'
            }), 400
        
        result = cognito_service.resend_confirmation_code(data['email'])
        
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user
    
    Request Body:
        email: string (required)
        password: string (required)
    
    Returns:
        JSON response with tokens and user data
    """
    try:
        data = request.get_json()
        
        if 'email' not in data or 'password' not in data:
            return jsonify({
                'success': False,
                'error': 'Email and password are required'
            }), 400
        
        # Authenticate with Cognito
        cognito_result = cognito_service.sign_in(
            email=data['email'],
            password=data['password']
        )
        
        if not cognito_result['success']:
            return jsonify(cognito_result), 401
        
        # Get user data from DynamoDB
        user_result = db_service.get_user_by_email(data['email'])
        
        response_data = {
            'success': True,
            'tokens': {
                'access_token': cognito_result['access_token'],
                'id_token': cognito_result['id_token'],
                'refresh_token': cognito_result['refresh_token'],
                'expires_in': cognito_result['expires_in']
            }
        }
        
        if user_result['success']:
            response_data['user'] = user_result['data']
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    """
    Refresh access token
    
    Request Body:
        refresh_token: string (required)
        email: string (required)
    
    Returns:
        JSON response with new tokens
    """
    try:
        data = request.get_json()
        
        if 'refresh_token' not in data or 'email' not in data:
            return jsonify({
                'success': False,
                'error': 'Refresh token and email are required'
            }), 400
        
        result = cognito_service.refresh_token(
            refresh_token=data['refresh_token'],
            email=data['email']
        )
        
        return jsonify(result), 200 if result['success'] else 401
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """
    Logout user (requires authentication)
    
    Headers:
        Authorization: Bearer <access_token>
    
    Returns:
        JSON response with logout status
    """
    try:
        token = request.headers['Authorization'].split(" ")[1]
        
        result = cognito_service.sign_out(token)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    Initiate forgot password flow
    
    Request Body:
        email: string (required)
    
    Returns:
        JSON response with status
    """
    try:
        data = request.get_json()
        
        if 'email' not in data:
            return jsonify({
                'success': False,
                'error': 'Email is required'
            }), 400
        
        result = cognito_service.forgot_password(data['email'])
        
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Reset password with confirmation code
    
    Request Body:
        email: string (required)
        code: string (required)
        new_password: string (required)
    
    Returns:
        JSON response with status
    """
    try:
        data = request.get_json()
        
        required_fields = ['email', 'code', 'new_password']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        result = cognito_service.confirm_forgot_password(
            email=data['email'],
            confirmation_code=data['code'],
            new_password=data['new_password']
        )
        
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password():
    """
    Change user password (requires authentication)
    
    Headers:
        Authorization: Bearer <access_token>
    
    Request Body:
        old_password: string (required)
        new_password: string (required)
    
    Returns:
        JSON response with status
    """
    try:
        data = request.get_json()
        token = request.headers['Authorization'].split(" ")[1]
        
        if 'old_password' not in data or 'new_password' not in data:
            return jsonify({
                'success': False,
                'error': 'Old password and new password are required'
            }), 400
        
        result = cognito_service.change_password(
            access_token=token,
            old_password=data['old_password'],
            new_password=data['new_password']
        )
        
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    """
    Get current user information (requires authentication)
    
    Headers:
        Authorization: Bearer <access_token>
    
    Returns:
        JSON response with user data
    """
    try:
        user_info = request.user_info
        
        if user_info and 'attributes' in user_info:
            email = user_info['attributes'].get('email')
            
            # Get full user data from DynamoDB
            db_result = db_service.get_user_by_email(email)
            
            if db_result['success']:
                return jsonify({
                    'success': True,
                    'user': db_result['data']
                }), 200
        
        return jsonify(user_info), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

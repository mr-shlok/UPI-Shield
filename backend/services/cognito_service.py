"""
AWS Cognito service for user authentication
"""
import boto3
from botocore.exceptions import ClientError
import hmac
import hashlib
import base64
from config import Config


class CognitoService:
    """Service for AWS Cognito authentication"""
    
    def __init__(self):
        """Initialize Cognito client"""
        self.user_pool_id = Config.COGNITO_USER_POOL_ID
        self.client_id = Config.COGNITO_APP_CLIENT_ID
        self.client_secret = Config.COGNITO_APP_CLIENT_SECRET
        self.region = Config.COGNITO_REGION

        if not self.user_pool_id or not self.client_id or 'your-' in self.user_pool_id or 'your-' in self.client_id:
            print("⚠️  Cognito configuration missing or using placeholders, entering Mock Mode")
            self.mock_mode = True
            self.client = None
        else:
            try:
                self.client = boto3.client(
                    'cognito-idp',
                    region_name=self.region
                )
                self.mock_mode = False
            except Exception as e:
                print(f"⚠️  Cognito initialization failed: {e}, entering Mock Mode")
                self.mock_mode = True
                self.client = None
    
    def _get_secret_hash(self, username):
        """Generate secret hash for Cognito"""
        message = bytes(username + self.client_id, 'utf-8')
        secret = bytes(self.client_secret, 'utf-8')
        dig = hmac.new(secret, msg=message, digestmod=hashlib.sha256).digest()
        return base64.b64encode(dig).decode()
    
    def sign_up(self, email, password, name, phone=None):
        """
        Register a new user
        
        Args:
            email: User's email address
            password: User's password
            name: User's full name
            phone: Optional phone number
        
        Returns:
            dict: Response with success status and user data
        """
        try:
            user_attributes = [
                {'Name': 'email', 'Value': email},
                {'Name': 'name', 'Value': name}
            ]
            
            if phone:
                user_attributes.append({'Name': 'phone_number', 'Value': phone})
            
            if self.mock_mode:
                return {
                    'success': True,
                    'message': 'Mock registration successful',
                    'user_sub': 'mock-sub-' + email
                }
            
            response = self.client.sign_up(
                ClientId=self.client_id,
                SecretHash=self._get_secret_hash(email),
                Username=email,
                Password=password,
                UserAttributes=user_attributes
            )
            
            return {
                'success': True,
                'message': 'User registered successfully. Please verify your email.',
                'user_sub': response['UserSub'],
                'user_confirmed': response['UserConfirmed']
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_messages = {
                'UsernameExistsException': 'User with this email already exists',
                'InvalidPasswordException': 'Password does not meet requirements',
                'InvalidParameterException': 'Invalid parameters provided',
                'UserNotConfirmedException': 'User is not confirmed'
            }
            
            return {
                'success': False,
                'error': error_messages.get(error_code, str(e))
            }
    
    def confirm_sign_up(self, email, confirmation_code):
        """
        Confirm user registration with verification code
        
        Args:
            email: User's email
            confirmation_code: Verification code sent to email
        
        Returns:
            dict: Response with success status
        """
        try:
            self.client.confirm_sign_up(
                ClientId=self.client_id,
                SecretHash=self._get_secret_hash(email),
                Username=email,
                ConfirmationCode=confirmation_code
            )
            
            return {
                'success': True,
                'message': 'Email verified successfully. You can now login.'
            }
            
        except ClientError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def resend_confirmation_code(self, email):
        """Mock resending verification code"""
        if self.mock_mode:
            return {
                'success': True,
                'message': 'Mock verification code resent successfully'
            }
        try:
            self.client.resend_confirmation_code(
                ClientId=self.client_id,
                SecretHash=self._get_secret_hash(email),
                Username=email
            )
            
            return {
                'success': True,
                'message': 'Verification code resent successfully'
            }
            
        except ClientError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def sign_in(self, email, password):
        """Mock authenticating user and getting tokens"""
        if self.mock_mode:
            return {
                'success': True,
                'access_token': 'mock-access-token-' + email,
                'id_token': 'mock-id-token-' + email,
                'refresh_token': 'mock-refresh-token-' + email,
                'expires_in': 3600,
                'token_type': 'Bearer'
            }
        try:
            response = self.client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': email,
                    'PASSWORD': password,
                    'SECRET_HASH': self._get_secret_hash(email)
                }
            )
            
            return {
                'success': True,
                'access_token': response['AuthenticationResult']['AccessToken'],
                'id_token': response['AuthenticationResult']['IdToken'],
                'refresh_token': response['AuthenticationResult']['RefreshToken'],
                'expires_in': response['AuthenticationResult']['ExpiresIn'],
                'token_type': response['AuthenticationResult']['TokenType']
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_messages = {
                'NotAuthorizedException': 'Incorrect email or password',
                'UserNotConfirmedException': 'Please verify your email first',
                'UserNotFoundException': 'User not found'
            }
            
            return {
                'success': False,
                'error': error_messages.get(error_code, str(e))
            }
    
    def refresh_token(self, refresh_token, email):
        """
        Refresh access token using refresh token
        
        Args:
            refresh_token: Refresh token from previous login
            email: User's email
        
        Returns:
            dict: Response with new tokens
        """
        try:
            response = self.client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow='REFRESH_TOKEN_AUTH',
                AuthParameters={
                    'REFRESH_TOKEN': refresh_token,
                    'SECRET_HASH': self._get_secret_hash(email)
                }
            )
            
            return {
                'success': True,
                'access_token': response['AuthenticationResult']['AccessToken'],
                'id_token': response['AuthenticationResult']['IdToken'],
                'expires_in': response['AuthenticationResult']['ExpiresIn']
            }
            
        except ClientError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def sign_out(self, access_token):
        """
        Sign out user globally
        
        Args:
            access_token: User's access token
        
        Returns:
            dict: Response with success status
        """
        try:
            self.client.global_sign_out(
                AccessToken=access_token
            )
            
            return {
                'success': True,
                'message': 'Signed out successfully'
            }
            
        except ClientError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_user(self, access_token):
        """Mock getting user information from access token"""
        if self.mock_mode:
            return {
                'success': True,
                'username': 'mock-user',
                'attributes': {
                    'email': 'mock@example.com',
                    'name': 'Mock User',
                    'sub': 'mock-sub-123'
                }
            }
        try:
            response = self.client.get_user(
                AccessToken=access_token
            )
            
            user_attributes = {}
            for attr in response['UserAttributes']:
                user_attributes[attr['Name']] = attr['Value']
            
            return {
                'success': True,
                'username': response['Username'],
                'attributes': user_attributes
            }
            
        except ClientError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def forgot_password(self, email):
        """
        Initiate forgot password flow
        
        Args:
            email: User's email
        
        Returns:
            dict: Response with success status
        """
        try:
            self.client.forgot_password(
                ClientId=self.client_id,
                SecretHash=self._get_secret_hash(email),
                Username=email
            )
            
            return {
                'success': True,
                'message': 'Password reset code sent to your email'
            }
            
        except ClientError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def confirm_forgot_password(self, email, confirmation_code, new_password):
        """
        Confirm password reset with code
        
        Args:
            email: User's email
            confirmation_code: Code sent to email
            new_password: New password
        
        Returns:
            dict: Response with success status
        """
        try:
            self.client.confirm_forgot_password(
                ClientId=self.client_id,
                SecretHash=self._get_secret_hash(email),
                Username=email,
                ConfirmationCode=confirmation_code,
                Password=new_password
            )
            
            return {
                'success': True,
                'message': 'Password reset successfully'
            }
            
        except ClientError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def change_password(self, access_token, old_password, new_password):
        """
        Change user password
        
        Args:
            access_token: User's access token
            old_password: Current password
            new_password: New password
        
        Returns:
            dict: Response with success status
        """
        try:
            self.client.change_password(
                AccessToken=access_token,
                PreviousPassword=old_password,
                ProposedPassword=new_password
            )
            
            return {
                'success': True,
                'message': 'Password changed successfully'
            }
            
        except ClientError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def verify_token(self, access_token):
        """Mock verifying if access token is valid"""
        if self.mock_mode:
            return True
        try:
            self.client.get_user(AccessToken=access_token)
            return True
        except ClientError:
            return False


# Initialize service
cognito_service = CognitoService()

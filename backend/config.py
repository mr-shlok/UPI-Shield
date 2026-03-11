"""
Configuration file for AWS services and application settings
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
    
    # AWS Cognito Configuration
    COGNITO_REGION = os.getenv('COGNITO_REGION', 'us-east-1')
    COGNITO_USER_POOL_ID = os.getenv('COGNITO_USER_POOL_ID', '')
    COGNITO_APP_CLIENT_ID = os.getenv('COGNITO_APP_CLIENT_ID', '')
    COGNITO_APP_CLIENT_SECRET = os.getenv('COGNITO_APP_CLIENT_SECRET', '')
    
    # AWS DynamoDB Configuration
    DYNAMODB_REGION = os.getenv('DYNAMODB_REGION', 'us-east-1')
    DYNAMODB_TABLE_USERS = os.getenv('DYNAMODB_TABLE_USERS', 'upi_shield_users')
    DYNAMODB_TABLE_TRANSACTIONS = os.getenv('DYNAMODB_TABLE_TRANSACTIONS', 'upi_shield_transactions')
    DYNAMODB_TABLE_FRAUD_LOGS = os.getenv('DYNAMODB_TABLE_FRAUD_LOGS', 'upi_shield_fraud_logs')
    
    # AWS KMS Configuration
    KMS_KEY_ID = os.getenv('KMS_KEY_ID', '')
    
    # API Configuration
    API_VERSION = 'v1'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # Security Configuration
    JWT_EXPIRATION_HOURS = 24
    REFRESH_TOKEN_EXPIRATION_DAYS = 30
    PASSWORD_MIN_LENGTH = 8
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://localhost:5178').split(',')
    
    # Fraud Detection Configuration
    FRAUD_THRESHOLD_HIGH = 80
    FRAUD_THRESHOLD_MEDIUM = 50
    MAX_TRANSACTION_AMOUNT = 100000  # ₹1,00,000
    
    @staticmethod
    def validate():
        """Validate required configuration"""
        required_vars = [
            'COGNITO_USER_POOL_ID',
            'COGNITO_APP_CLIENT_ID',
            'KMS_KEY_ID'
        ]
        
        missing = []
        for var in required_vars:
            if not os.getenv(var):
                missing.append(var)
        
        if missing:
            print(f"⚠️  Warning: Missing environment variables: {', '.join(missing)}")
            print("   Please configure them in .env file for production use")
        
        return len(missing) == 0

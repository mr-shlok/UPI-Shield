"""
Firebase Configuration for UPI Shield Backend
"""
import os
from dotenv import load_dotenv

load_dotenv()

class FirebaseConfig:
    """Firebase and application configuration"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', '5000'))
    
    # Firebase Configuration
    FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')
    FIREBASE_API_KEY = os.getenv('FIREBASE_API_KEY', '')
    FIREBASE_AUTH_DOMAIN = os.getenv('FIREBASE_AUTH_DOMAIN', '')
    FIREBASE_PROJECT_ID = os.getenv('FIREBASE_PROJECT_ID', '')
    FIREBASE_STORAGE_BUCKET = os.getenv('FIREBASE_STORAGE_BUCKET', '')
    FIREBASE_MESSAGING_SENDER_ID = os.getenv('FIREBASE_MESSAGING_SENDER_ID', '')
    FIREBASE_APP_ID = os.getenv('FIREBASE_APP_ID', '')
    
    # Firestore Collections
    COLLECTION_USERS = 'users'
    COLLECTION_TRANSACTIONS = 'transactions'
    COLLECTION_FRAUD_LOGS = 'fraud_logs'
    COLLECTION_SESSIONS = 'sessions'
    
    # API Configuration
    API_VERSION = 'v1'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    
    # Security Configuration
    JWT_EXPIRATION_HOURS = 24
    REFRESH_TOKEN_EXPIRATION_DAYS = 30
    PASSWORD_MIN_LENGTH = 8
    SESSION_TIMEOUT_MINUTES = 30
    
    # Encryption Configuration
    ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY', '')  # For field-level encryption
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv(
        'CORS_ORIGINS',
        'http://localhost:5173,http://localhost:5174,http://localhost:5175,'
        'http://localhost:5176,http://localhost:5177,http://localhost:5178'
    ).split(',')
    
    # Fraud Detection Configuration
    FRAUD_THRESHOLD_HIGH = 80
    FRAUD_THRESHOLD_MEDIUM = 50
    MAX_TRANSACTION_AMOUNT = 100000  # ₹1,00,000
    
    # Role-Based Access Control
    ROLES = {
        'user': ['read:own', 'write:own'],
        'admin': ['read:all', 'write:all', 'delete:all'],
        'moderator': ['read:all', 'write:all']
    }
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE = 60
    RATE_LIMIT_PER_HOUR = 1000
    
    @staticmethod
    def validate():
        """Validate required configuration"""
        required_vars = [
            'FIREBASE_PROJECT_ID',
            'FIREBASE_API_KEY'
        ]
        
        missing = []
        for var in required_vars:
            if not os.getenv(var):
                missing.append(var)
        
        if missing:
            print(f"⚠️  Warning: Missing environment variables: {', '.join(missing)}")
            print("   Please configure them in .env file")
        
        return len(missing) == 0
    
    @staticmethod
    def get_firebase_config():
        """Get Firebase client configuration"""
        return {
            'apiKey': FirebaseConfig.FIREBASE_API_KEY,
            'authDomain': FirebaseConfig.FIREBASE_AUTH_DOMAIN,
            'projectId': FirebaseConfig.FIREBASE_PROJECT_ID,
            'storageBucket': FirebaseConfig.FIREBASE_STORAGE_BUCKET,
            'messagingSenderId': FirebaseConfig.FIREBASE_MESSAGING_SENDER_ID,
            'appId': FirebaseConfig.FIREBASE_APP_ID
        }
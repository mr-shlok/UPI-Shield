"""
Encryption service for sensitive data
"""
from cryptography.fernet import Fernet
from config_firebase import FirebaseConfig
import base64
import hashlib


class EncryptionService:
    """Service for encrypting and decrypting sensitive fields"""
    
    def __init__(self):
        """Initialize encryption with key from config"""
        # Generate key from SECRET_KEY if ENCRYPTION_KEY not provided
        if FirebaseConfig.ENCRYPTION_KEY:
            key = FirebaseConfig.ENCRYPTION_KEY.encode()
        else:
            # Derive key from SECRET_KEY
            key = hashlib.sha256(FirebaseConfig.SECRET_KEY.encode()).digest()
        
        # Convert to Fernet key format
        self.fernet_key = base64.urlsafe_b64encode(key)
        self.cipher = Fernet(self.fernet_key)
    
    def encrypt(self, data):
        """
        Encrypt data
        
        Args:
            data: String to encrypt
        
        Returns:
            str: Encrypted data as string
        """
        if not data:
            return data
        
        try:
            encrypted = self.cipher.encrypt(data.encode())
            return encrypted.decode()
        except Exception as e:
            print(f"Encryption error: {str(e)}")
            return data  # Return original if encryption fails
    
    def decrypt(self, encrypted_data):
        """
        Decrypt data
        
        Args:
            encrypted_data: Encrypted string
        
        Returns:
            str: Decrypted data
        """
        if not encrypted_data:
            return encrypted_data
        
        try:
            decrypted = self.cipher.decrypt(encrypted_data.encode())
            return decrypted.decode()
        except Exception as e:
            print(f"Decryption error: {str(e)}")
            return encrypted_data  # Return original if decryption fails


# Initialize service
encryption_service = EncryptionService()


# Helper functions
def encrypt_field(data):
    """Encrypt a field"""
    return encryption_service.encrypt(data)


def decrypt_field(encrypted_data):
    """Decrypt a field"""
    return encryption_service.decrypt(encrypted_data)

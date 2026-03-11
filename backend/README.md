# UPI Shield Backend

Secure Flask backend with AWS Cognito authentication and DynamoDB database for UPI fraud detection application.

## 🛡️ Features

- **AWS Cognito Authentication**
  - User registration with email verification
  - Secure login/logout
  - Password reset functionality
  - Token-based authentication
  - Session management

- **AWS DynamoDB Database**
  - KMS encryption at rest
  - User data management
  - Transaction records
  - Fraud detection logs

- **Security**
  - JWT tokens
  - Password hashing
  - CORS protection
  - Rate limiting ready
  - Encrypted data storage

## 📋 Prerequisites

- Python 3.8 or higher
- AWS Account with:
  - Cognito User Pool
  - DynamoDB access
  - KMS key for encryption
- AWS CLI configured

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your AWS credentials
# See setup_aws.md for detailed AWS setup instructions
```

### 3. Run the Server
```bash
python app_new.py
```

Server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── app_new.py              # Main application entry point
├── config.py               # Configuration management
├── requirements.txt        # Python dependencies
├── setup_aws.md           # AWS setup guide
│
├── services/              # Business logic services
│   ├── cognito_service.py # AWS Cognito authentication
│   └── dynamodb_service.py # AWS DynamoDB operations
│
└── routes/                # API endpoints
    └── auth_routes.py     # Authentication routes
```

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```

### Authentication

#### Register User
```
POST /api/auth/register
Body: {
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+911234567890"
}
```

#### Verify Email
```
POST /api/auth/verify-email
Body: {
  "email": "user@example.com",
  "code": "123456"
}
```

#### Login
```
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Logout
```
POST /api/auth/logout
Headers: {
  "Authorization": "Bearer <access_token>"
}
```

#### Forgot Password
```
POST /api/auth/forgot-password
Body: {
  "email": "user@example.com"
}
```

#### Reset Password
```
POST /api/auth/reset-password
Body: {
  "email": "user@example.com",
  "code": "123456",
  "new_password": "NewSecurePass123!"
}
```

#### Get Current User
```
GET /api/auth/me
Headers: {
  "Authorization": "Bearer <access_token>"
}
```

### Dashboard (Protected)
```
GET /api/dashboard
Headers: {
  "Authorization": "Bearer <access_token>"
}
```

### Statistics (Protected)
```
GET /api/stats
Headers: {
  "Authorization": "Bearer <access_token>"
}
```

## 🔒 Security Features

1. **AWS Cognito**
   - Secure user authentication
   - Email verification
   - Password policies
   - MFA support (configurable)

2. **AWS DynamoDB**
   - KMS encryption at rest
   - Fine-grained access control
   - Automatic backups
   - Point-in-time recovery

3. **API Security**
   - Token-based authentication
   - CORS configuration
   - Input validation
   - Error handling

## 🌐 Environment Variables

Required environment variables (see `.env.example`):

```
# AWS Cognito
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_APP_CLIENT_ID=your-app-client-id
COGNITO_APP_CLIENT_SECRET=your-app-client-secret

# AWS DynamoDB
DYNAMODB_REGION=us-east-1
DYNAMODB_TABLE_USERS=upi_shield_users
DYNAMODB_TABLE_TRANSACTIONS=upi_shield_transactions
DYNAMODB_TABLE_FRAUD_LOGS=upi_shield_fraud_logs

# AWS KMS
KMS_KEY_ID=your-kms-key-id

# Flask
SECRET_KEY=your-secret-key
DEBUG=True

# AWS Credentials (for local development)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

## 📦 Dependencies

- **Flask**: Web framework
- **boto3**: AWS SDK for Python
- **python-dotenv**: Environment variable management
- **PyJWT**: JSON Web Tokens
- **flask-cors**: CORS support

## 🚢 Deployment

### AWS Lambda + API Gateway
1. Package application with dependencies
2. Create Lambda function
3. Configure API Gateway
4. Set environment variables
5. Deploy

### AWS EC2
1. Launch EC2 instance
2. Install Python and dependencies
3. Configure security groups
4. Set up NGINX/Apache
5. Use Gunicorn/uWSGI
6. Enable HTTPS

## 📝 Next Steps

1. Configure AWS Cognito User Pool
2. Create DynamoDB tables with KMS encryption
3. Set up environment variables
4. Implement fraud detection logic
5. Add transaction monitoring
6. Configure alerts and notifications
7. Set up monitoring and logging
8. Implement rate limiting
9. Add comprehensive testing
10. Deploy to production

## 🤝 Contributing

1. Follow PEP 8 style guide
2. Write docstrings for all functions
3. Add error handling
4. Write tests
5. Update documentation

## 📄 License

Proprietary - UPI Shield

## 🔗 Related Documentation

- [AWS Setup Guide](./setup_aws.md)
- [Frontend Repository](../frontend/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)

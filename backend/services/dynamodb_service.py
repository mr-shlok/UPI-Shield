"""
AWS DynamoDB service for database operations with KMS encryption
"""
import boto3
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
from datetime import datetime, timedelta
import uuid
from config import Config


class DynamoDBService:
    """Service for AWS DynamoDB operations"""
    
    def __init__(self):
        """Initialize DynamoDB client"""
        if not Config.KMS_KEY_ID or 'your-' in Config.KMS_KEY_ID:
            print("⚠️  KMS_KEY_ID missing or using placeholder, entering Mock Mode")
            self.mock_mode = True
            self.dynamodb = None
            self.client = None
            self.users_table = None
            self.transactions_table = None
            self.fraud_logs_table = None
        else:
            try:
                self.dynamodb = boto3.resource(
                    'dynamodb',
                    region_name=Config.DYNAMODB_REGION
                )
                self.client = boto3.client(
                    'dynamodb',
                    region_name=Config.DYNAMODB_REGION
                )
                
                # Table references
                self.users_table = self.dynamodb.Table(Config.DYNAMODB_TABLE_USERS)
                self.transactions_table = self.dynamodb.Table(Config.DYNAMODB_TABLE_TRANSACTIONS)
                self.fraud_logs_table = self.dynamodb.Table(Config.DYNAMODB_TABLE_FRAUD_LOGS)
                self.mock_mode = False
            except Exception as e:
                print(f"⚠️  DynamoDB initialization failed: {e}, entering Mock Mode")
                self.mock_mode = True
                self.dynamodb = None
                self.client = None
                self.users_table = None
                self.transactions_table = None
                self.fraud_logs_table = None
    
    def create_tables(self):
        """Create DynamoDB tables with KMS encryption if they don't exist"""
        try:
            # Create Users Table
            self._create_users_table()
            
            # Create Transactions Table
            self._create_transactions_table()
            
            # Create Fraud Logs Table
            self._create_fraud_logs_table()
            
            print("✅ All DynamoDB tables created successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error creating tables: {str(e)}")
            return False
    
    def _create_users_table(self):
        """Create users table with KMS encryption"""
        try:
            table = self.dynamodb.create_table(
                TableName=Config.DYNAMODB_TABLE_USERS,
                KeySchema=[
                    {'AttributeName': 'user_id', 'KeyType': 'HASH'},  # Partition key
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'user_id', 'AttributeType': 'S'},
                    {'AttributeName': 'email', 'AttributeType': 'S'},
                ],
                GlobalSecondaryIndexes=[
                    {
                        'IndexName': 'email-index',
                        'KeySchema': [
                            {'AttributeName': 'email', 'KeyType': 'HASH'}
                        ],
                        'Projection': {'ProjectionType': 'ALL'},
                        'ProvisionedThroughput': {
                            'ReadCapacityUnits': 5,
                            'WriteCapacityUnits': 5
                        }
                    }
                ],
                ProvisionedThroughput={
                    'ReadCapacityUnits': 5,
                    'WriteCapacityUnits': 5
                },
                SSESpecification={
                    'Enabled': True,
                    'SSEType': 'KMS',
                    'KMSMasterKeyId': Config.KMS_KEY_ID
                }
            )
            table.wait_until_exists()
            print(f"✅ Created table: {Config.DYNAMODB_TABLE_USERS}")
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceInUseException':
                print(f"ℹ️  Table {Config.DYNAMODB_TABLE_USERS} already exists")
            else:
                raise
    
    def _create_transactions_table(self):
        """Create transactions table with KMS encryption"""
        try:
            table = self.dynamodb.create_table(
                TableName=Config.DYNAMODB_TABLE_TRANSACTIONS,
                KeySchema=[
                    {'AttributeName': 'transaction_id', 'KeyType': 'HASH'},
                    {'AttributeName': 'timestamp', 'KeyType': 'RANGE'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'transaction_id', 'AttributeType': 'S'},
                    {'AttributeName': 'timestamp', 'AttributeType': 'S'},
                    {'AttributeName': 'user_id', 'AttributeType': 'S'},
                ],
                GlobalSecondaryIndexes=[
                    {
                        'IndexName': 'user-id-index',
                        'KeySchema': [
                            {'AttributeName': 'user_id', 'KeyType': 'HASH'},
                            {'AttributeName': 'timestamp', 'KeyType': 'RANGE'}
                        ],
                        'Projection': {'ProjectionType': 'ALL'},
                        'ProvisionedThroughput': {
                            'ReadCapacityUnits': 5,
                            'WriteCapacityUnits': 5
                        }
                    }
                ],
                ProvisionedThroughput={
                    'ReadCapacityUnits': 5,
                    'WriteCapacityUnits': 5
                },
                SSESpecification={
                    'Enabled': True,
                    'SSEType': 'KMS',
                    'KMSMasterKeyId': Config.KMS_KEY_ID
                }
            )
            table.wait_until_exists()
            print(f"✅ Created table: {Config.DYNAMODB_TABLE_TRANSACTIONS}")
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceInUseException':
                print(f"ℹ️  Table {Config.DYNAMODB_TABLE_TRANSACTIONS} already exists")
            else:
                raise
    
    def _create_fraud_logs_table(self):
        """Create fraud logs table with KMS encryption"""
        try:
            table = self.dynamodb.create_table(
                TableName=Config.DYNAMODB_TABLE_FRAUD_LOGS,
                KeySchema=[
                    {'AttributeName': 'log_id', 'KeyType': 'HASH'},
                    {'AttributeName': 'timestamp', 'KeyType': 'RANGE'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'log_id', 'AttributeType': 'S'},
                    {'AttributeName': 'timestamp', 'AttributeType': 'S'},
                    {'AttributeName': 'transaction_id', 'AttributeType': 'S'},
                ],
                GlobalSecondaryIndexes=[
                    {
                        'IndexName': 'transaction-id-index',
                        'KeySchema': [
                            {'AttributeName': 'transaction_id', 'KeyType': 'HASH'}
                        ],
                        'Projection': {'ProjectionType': 'ALL'},
                        'ProvisionedThroughput': {
                            'ReadCapacityUnits': 5,
                            'WriteCapacityUnits': 5
                        }
                    }
                ],
                ProvisionedThroughput={
                    'ReadCapacityUnits': 5,
                    'WriteCapacityUnits': 5
                },
                SSESpecification={
                    'Enabled': True,
                    'SSEType': 'KMS',
                    'KMSMasterKeyId': Config.KMS_KEY_ID
                }
            )
            table.wait_until_exists()
            print(f"✅ Created table: {Config.DYNAMODB_TABLE_FRAUD_LOGS}")
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceInUseException':
                print(f"ℹ️  Table {Config.DYNAMODB_TABLE_FRAUD_LOGS} already exists")
            else:
                raise
    
    # User Operations
    def create_user(self, user_data):
        """Create a new user"""
        if self.mock_mode:
            return {
                'success': True,
                'message': 'Mock user created successfully',
                'user_id': str(uuid.uuid4())
            }
        try:
            user_id = str(uuid.uuid4())
            item = {
                'user_id': user_id,
                'email': user_data['email'],
                'cognito_sub': user_data.get('cognito_sub', ''),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat(),
                'is_active': True,
                'profile': {
                    'name': user_data.get('name', ''),
                    'phone': user_data.get('phone', ''),
                }
            }
            
            self.users_table.put_item(Item=item)
            return {'success': True, 'user_id': user_id, 'data': item}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_user_by_email(self, email):
        """Get user by email"""
        if self.mock_mode:
            return {'success': True, 'data': {'email': email, 'name': 'Mock User', 'user_id': 'mock-123'}}
        try:
            response = self.users_table.query(
                IndexName='email-index',
                KeyConditionExpression=Key('email').eq(email)
            )
            
            if response['Items']:
                return {'success': True, 'data': response['Items'][0]}
            return {'success': False, 'error': 'User not found'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_user(self, user_id):
        """Get user by ID"""
        if self.mock_mode:
            return {'success': True, 'data': {'user_id': user_id, 'email': 'mock@example.com', 'name': 'Mock User'}}
        try:
            response = self.users_table.get_item(Key={'user_id': user_id})
            
            if 'Item' in response:
                return {'success': True, 'data': response['Item']}
            return {'success': False, 'error': 'User not found'}
            
        except ClientError as e:
            return {'success': False, 'error': str(e)}
    
    def update_user(self, user_id, update_data):
        """Update user information"""
        if self.mock_mode:
            mock_data = {'user_id': user_id, 'email': 'mock@example.com', 'name': 'Mock User', **update_data}
            return {'success': True, 'data': mock_data}
        try:
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            update_expression = "SET "
            expression_values = {}
            
            for key, value in update_data.items():
                update_expression += f"{key} = :{key}, "
                expression_values[f":{key}"] = value
            
            update_expression = update_expression.rstrip(', ')
            
            response = self.users_table.update_item(
                Key={'user_id': user_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values,
                ReturnValues='ALL_NEW'
            )
            
            return {'success': True, 'data': response['Attributes']}
            
        except ClientError as e:
            return {'success': False, 'error': str(e)}
    
    # Transaction Operations
    def create_transaction(self, transaction_data):
        """Create a new transaction record"""
        if self.mock_mode:
            # Check if transaction_id was provided, else generate
            transaction_id = transaction_data.get('transaction_id') or ('mock-tx-' + str(uuid.uuid4())[:8])
            return {
                'success': True,
                'message': 'Mock transaction created successfully',
                'transaction_id': transaction_id
            }
        try:
            transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
            item = {
                'transaction_id': transaction_id,
                'timestamp': datetime.utcnow().isoformat(),
                'user_id': transaction_data['user_id'],
                'amount': transaction_data['amount'],
                'recipient': transaction_data.get('recipient', ''),
                'upi_id': transaction_data.get('upi_id', ''),
                'status': transaction_data.get('status', 'pending'),
                'is_fraudulent': transaction_data.get('is_fraudulent', False),
                'risk_score': transaction_data.get('risk_score', 0),
                'metadata': transaction_data.get('metadata', {})
            }
            
            self.transactions_table.put_item(Item=item)
            return {'success': True, 'transaction_id': transaction_id, 'data': item}
            
        except ClientError as e:
            return {'success': False, 'error': str(e)}
    
    def get_user_transactions(self, user_id, limit=50):
        """Get recent transactions for a user"""
        try:
            if self.mock_mode:
                return {
                    'success': True, 
                    'data': [
                        {
                            'transaction_id': 'mock-tx-1',
                            'amount': 1500,
                            'recipient_name': 'Aman Gupta',
                            'recipient_upi': 'aman@okhdfc',
                            'timestamp': (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                            'status': 'completed',
                            'is_fraudulent': False,
                            'risk_level': 'low'
                        },
                        {
                            'transaction_id': 'mock-tx-2',
                            'amount': 50000,
                            'recipient_name': 'Dhrup',
                            'recipient_upi': 'dhrup@icici',
                            'timestamp': (datetime.utcnow() - timedelta(days=1)).isoformat(),
                            'status': 'flagged',
                            'is_fraudulent': True,
                            'risk_level': 'high',
                            'risk_score': 85
                        }
                    ]
                }
            
            response = self.transactions_table.query(
                IndexName='user-id-index',
                KeyConditionExpression=Key('user_id').eq(user_id),
                Limit=limit,
                ScanIndexForward=False  # Latest first
            )
            
            return {'success': True, 'data': response['Items']}
            
        except ClientError as e:
            return {'success': False, 'error': str(e)}
    
    # Fraud Log Operations
    def create_fraud_log(self, fraud_data):
        """Create a fraud detection log"""
        try:
            log_id = str(uuid.uuid4())
            item = {
                'log_id': log_id,
                'timestamp': datetime.utcnow().isoformat(),
                'transaction_id': fraud_data['transaction_id'],
                'risk_score': fraud_data['risk_score'],
                'risk_level': fraud_data['risk_level'],
                'is_fraudulent': fraud_data['is_fraudulent'],
                'detection_factors': fraud_data.get('detection_factors', []),
                'action_taken': fraud_data.get('action_taken', 'flagged')
            }
            
            self.fraud_logs_table.put_item(Item=item)
            return {'success': True, 'log_id': log_id, 'data': item}
            
        except ClientError as e:
            return {'success': False, 'error': str(e)}
    
    def get_fraud_logs(self, transaction_id):
        """Get fraud logs for a transaction"""
        try:
            response = self.fraud_logs_table.query(
                IndexName='transaction-id-index',
                KeyConditionExpression=Key('transaction_id').eq(transaction_id)
            )
            
            return {'success': True, 'data': response['Items']}
            
        except ClientError as e:
            return {'success': False, 'error': str(e)}


# Initialize service
db_service = DynamoDBService()

import firebase_admin
from firebase_admin import credentials, auth

def main():
    print("Initializing Firebase to create test user...")
    try:
        cred = credentials.Certificate('firebase-credentials.json')
        firebase_admin.initialize_app(cred)
        
        email = 'sample@example.com'
        password = 'password123'
        uid = 'user_12345'
        
        try:
            # Check if user already exists
            user = auth.get_user_by_email(email)
            print(f"User already exists with UID: {user.uid}")
            # Update password just in case
            auth.update_user(user.uid, password=password)
            print(f"Password updated to '{password}'")
        except firebase_admin.auth.UserNotFoundError:
            # Create the test user
            user = auth.create_user(
                uid=uid,
                email=email,
                password=password,
                display_name='Sample User',
                email_verified=True
            )
            print(f"Successfully created new test user:")
            print(f"Email: {email}")
            print(f"Password: {password}")
            
    except Exception as e:
        print(f"Error creating test user: {e}")

if __name__ == '__main__':
    main()

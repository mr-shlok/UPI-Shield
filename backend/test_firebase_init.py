import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

creds_path = 'firebase-credentials.json'

try:
    if not os.path.exists(creds_path):
        print(f"File {creds_path} DOES NOT EXIST")
    else:
        with open(creds_path, 'r') as f:
            creds_dict = json.load(f)
            print("Successfully loaded JSON file")
            
        if not firebase_admin._apps:
            cred = credentials.Certificate(creds_dict)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            print("Successfully connected to Firestore with JSON contents!")
        else:
            print("Firebase already initialized")
except Exception as e:
    print(f"FAILED: {str(e)}")
    import traceback
    traceback.print_exc()

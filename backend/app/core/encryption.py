from cryptography.fernet import Fernet
import os
import base64

# Key should be a base64 encoded 32-byte string. 
# Defaults to a dev key if not provided.
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())
fernet = Fernet(ENCRYPTION_KEY.encode())

def encrypt_uri(uri: str) -> str:
    return fernet.encrypt(uri.encode()).decode()

def decrypt_uri(encrypted_uri: str) -> str:
    return fernet.decrypt(encrypted_uri.encode()).decode()

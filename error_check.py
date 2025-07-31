#!/usr/bin/env python3
"""
Check error handling responses
"""

import requests

BACKEND_URL = "https://95892df9-8dc2-4b9b-ab78-49ab143ef1ec.preview.emergentagent.com/api"

def check_error_responses():
    print("Checking error handling responses...")
    
    # Test invalid cliente ID
    response = requests.get(f"{BACKEND_URL}/clientes/invalid-id")
    print(f"Invalid cliente ID - Status: {response.status_code}, Response: {response.text}")
    
    # Test invalid pedido estado
    response = requests.put(f"{BACKEND_URL}/pedidos/invalid-id/estado?estado=invalid")
    print(f"Invalid pedido estado - Status: {response.status_code}, Response: {response.text}")
    
    # Test invalid remito estado
    response = requests.put(f"{BACKEND_URL}/remitos/invalid-id/estado?estado=invalid")
    print(f"Invalid remito estado - Status: {response.status_code}, Response: {response.text}")

if __name__ == "__main__":
    check_error_responses()
#!/usr/bin/env python3
"""
Focused test for problematic endpoints
"""

import requests
import json
from datetime import datetime, timedelta

BACKEND_URL = "https://95892df9-8dc2-4b9b-ab78-49ab143ef1ec.preview.emergentagent.com/api"

def test_compras():
    print("Testing Compras endpoint...")
    
    compra_data = {
        "numero_compra": "COMP-TEST-001",
        "proveedor": "Test Proveedor SA",
        "categoria": "materiales",
        "items": [
            {
                "descripcion": "Test Item",
                "cantidad": 10,
                "precio_unitario": 100.0,
                "subtotal": 1000.0
            }
        ],
        "impuestos": 210.0,
        "estado_pago": "pendiente",
        "notas": "Test compra"
    }
    
    response = requests.post(f"{BACKEND_URL}/compras", json=compra_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✅ Compras endpoint working")
        return response.json()["id"]
    else:
        print(f"❌ Error: {response.text}")
        return None

def test_facturas():
    print("Testing Facturas GET endpoints...")
    
    # First create a cliente
    cliente_data = {
        "nombre": "Test Cliente",
        "email": "test@test.com"
    }
    cliente_response = requests.post(f"{BACKEND_URL}/clientes", json=cliente_data)
    if cliente_response.status_code != 200:
        print("Failed to create test cliente")
        return
    
    cliente_id = cliente_response.json()["id"]
    
    # Create a factura
    factura_data = {
        "numero_factura": "FAC-TEST-001",
        "cliente_id": cliente_id,
        "items": [
            {
                "descripcion": "Test Item",
                "cantidad": 1,
                "precio_unitario": 100.0,
                "subtotal": 100.0
            }
        ],
        "impuestos": 21.0,
        "fecha_vencimiento": (datetime.now() + timedelta(days=30)).isoformat()
    }
    
    create_response = requests.post(f"{BACKEND_URL}/facturas", json=factura_data)
    print(f"Create factura status: {create_response.status_code}")
    
    if create_response.status_code == 200:
        factura_id = create_response.json()["id"]
        
        # Test GET all facturas
        get_all_response = requests.get(f"{BACKEND_URL}/facturas")
        print(f"GET all facturas status: {get_all_response.status_code}")
        if get_all_response.status_code != 200:
            print(f"Error: {get_all_response.text}")
        
        # Test GET specific factura
        get_one_response = requests.get(f"{BACKEND_URL}/facturas/{factura_id}")
        print(f"GET specific factura status: {get_one_response.status_code}")
        if get_one_response.status_code != 200:
            print(f"Error: {get_one_response.text}")
        
        # Cleanup
        requests.delete(f"{BACKEND_URL}/clientes/{cliente_id}")

if __name__ == "__main__":
    test_compras()
    print()
    test_facturas()
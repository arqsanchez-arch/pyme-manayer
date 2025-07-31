#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for PYME Management System
Tests all CRUD endpoints and business workflow
"""

import requests
import json
from datetime import datetime, timedelta
import sys

# Get backend URL from environment
BACKEND_URL = "https://95892df9-8dc2-4b9b-ab78-49ab143ef1ec.preview.emergentagent.com/api"

class PymeAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_data = {}
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
    def log_result(self, test_name, success, message=""):
        if success:
            self.results["passed"] += 1
            print(f"✅ {test_name}")
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {message}")
            print(f"❌ {test_name}: {message}")
    
    def make_request(self, method, endpoint, data=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        try:
            if method == "GET":
                response = requests.get(url)
            elif method == "POST":
                response = requests.post(url, json=data)
            elif method == "PUT":
                response = requests.put(url, json=data)
            elif method == "DELETE":
                response = requests.delete(url)
            
            return response
        except Exception as e:
            return None
    
    def test_clientes_crud(self):
        """Test all Cliente CRUD operations"""
        print("\n🔍 Testing Clientes CRUD Operations...")
        
        # Test 1: Create Cliente
        cliente_data = {
            "nombre": "Distribuidora San Martin SRL",
            "email": "ventas@sanmartin.com.ar",
            "telefono": "+54 11 4567-8901",
            "direccion": "Av. San Martin 1234, Buenos Aires",
            "cuit_dni": "30-12345678-9"
        }
        
        response = self.make_request("POST", "/clientes", cliente_data)
        if response and response.status_code == 200:
            cliente = response.json()
            self.test_data["cliente_id"] = cliente["id"]
            self.test_data["cliente_nombre"] = cliente["nombre"]
            self.log_result("Create Cliente", True)
        else:
            self.log_result("Create Cliente", False, f"Status: {response.status_code if response else 'No response'}")
            return
        
        # Test 2: Get all Clientes
        response = self.make_request("GET", "/clientes")
        if response and response.status_code == 200:
            clientes = response.json()
            self.log_result("Get all Clientes", len(clientes) > 0, f"Found {len(clientes)} clientes")
        else:
            self.log_result("Get all Clientes", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 3: Get specific Cliente
        response = self.make_request("GET", f"/clientes/{self.test_data['cliente_id']}")
        if response and response.status_code == 200:
            cliente = response.json()
            self.log_result("Get specific Cliente", cliente["nombre"] == cliente_data["nombre"])
        else:
            self.log_result("Get specific Cliente", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 4: Update Cliente
        update_data = {"telefono": "+54 11 9999-0000"}
        response = self.make_request("PUT", f"/clientes/{self.test_data['cliente_id']}", update_data)
        if response and response.status_code == 200:
            self.log_result("Update Cliente", True)
        else:
            self.log_result("Update Cliente", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 5: Error handling - Invalid Cliente ID
        response = self.make_request("GET", "/clientes/invalid-id")
        if response and response.status_code == 404:
            self.log_result("Cliente error handling", True)
        else:
            self.log_result("Cliente error handling", False, "Should return 404 for invalid ID")
    
    def test_pedidos_crud(self):
        """Test all Pedido CRUD operations"""
        print("\n🔍 Testing Pedidos CRUD Operations...")
        
        if "cliente_id" not in self.test_data:
            self.log_result("Pedidos CRUD", False, "No cliente_id available")
            return
        
        # Test 1: Create Pedido
        pedido_data = {
            "numero_pedido": "PED-2024-001",
            "cliente_id": self.test_data["cliente_id"],
            "items": [
                {
                    "descripcion": "Producto A - Calidad Premium",
                    "cantidad": 10,
                    "precio_unitario": 150.0,
                    "subtotal": 1500.0
                },
                {
                    "descripcion": "Producto B - Línea Estándar",
                    "cantidad": 5,
                    "precio_unitario": 80.0,
                    "subtotal": 400.0
                }
            ],
            "fecha_entrega": (datetime.now() + timedelta(days=7)).isoformat(),
            "notas": "Entrega en horario comercial"
        }
        
        response = self.make_request("POST", "/pedidos", pedido_data)
        if response and response.status_code == 200:
            pedido = response.json()
            self.test_data["pedido_id"] = pedido["id"]
            # Verify total calculation
            expected_total = 1900.0
            if pedido["total"] == expected_total:
                self.log_result("Create Pedido with correct total", True)
            else:
                self.log_result("Create Pedido total calculation", False, f"Expected {expected_total}, got {pedido['total']}")
        else:
            self.log_result("Create Pedido", False, f"Status: {response.status_code if response else 'No response'}")
            return
        
        # Test 2: Get all Pedidos
        response = self.make_request("GET", "/pedidos")
        if response and response.status_code == 200:
            pedidos = response.json()
            self.log_result("Get all Pedidos", len(pedidos) > 0)
        else:
            self.log_result("Get all Pedidos", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 3: Get specific Pedido
        response = self.make_request("GET", f"/pedidos/{self.test_data['pedido_id']}")
        if response and response.status_code == 200:
            pedido = response.json()
            self.log_result("Get specific Pedido", pedido["numero_pedido"] == pedido_data["numero_pedido"])
        else:
            self.log_result("Get specific Pedido", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 4: Update Pedido estado
        response = self.make_request("PUT", f"/pedidos/{self.test_data['pedido_id']}/estado?estado=en_proceso")
        if response and response.status_code == 200:
            self.log_result("Update Pedido estado", True)
        else:
            self.log_result("Update Pedido estado", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 5: Invalid estado
        response = self.make_request("PUT", f"/pedidos/{self.test_data['pedido_id']}/estado?estado=invalid")
        if response and response.status_code == 400:
            self.log_result("Pedido invalid estado handling", True)
        else:
            self.log_result("Pedido invalid estado handling", False, "Should return 400 for invalid estado")
    
    def test_facturas_crud(self):
        """Test all Factura CRUD operations"""
        print("\n🔍 Testing Facturas CRUD Operations...")
        
        if "cliente_id" not in self.test_data:
            self.log_result("Facturas CRUD", False, "No cliente_id available")
            return
        
        # Test 1: Create Factura
        factura_data = {
            "numero_factura": "FAC-A-0001-00000001",
            "pedido_id": self.test_data.get("pedido_id"),
            "cliente_id": self.test_data["cliente_id"],
            "items": [
                {
                    "descripcion": "Producto A - Calidad Premium",
                    "cantidad": 10,
                    "precio_unitario": 150.0,
                    "subtotal": 1500.0
                },
                {
                    "descripcion": "Producto B - Línea Estándar",
                    "cantidad": 5,
                    "precio_unitario": 80.0,
                    "subtotal": 400.0
                }
            ],
            "impuestos": 399.0,  # 21% IVA
            "fecha_vencimiento": (datetime.now() + timedelta(days=30)).isoformat(),
            "notas": "Condiciones: 30 días fecha factura"
        }
        
        response = self.make_request("POST", "/facturas", factura_data)
        if response and response.status_code == 200:
            factura = response.json()
            self.test_data["factura_id"] = factura["id"]
            # Verify total calculation (subtotal + impuestos)
            expected_total = 2299.0  # 1900 + 399
            if factura["total"] == expected_total:
                self.log_result("Create Factura with correct total", True)
            else:
                self.log_result("Create Factura total calculation", False, f"Expected {expected_total}, got {factura['total']}")
        else:
            self.log_result("Create Factura", False, f"Status: {response.status_code if response else 'No response'}")
            return
        
        # Test 2: Get all Facturas
        response = self.make_request("GET", "/facturas")
        if response and response.status_code == 200:
            facturas = response.json()
            self.log_result("Get all Facturas", len(facturas) > 0)
        else:
            self.log_result("Get all Facturas", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 3: Get specific Factura
        response = self.make_request("GET", f"/facturas/{self.test_data['factura_id']}")
        if response and response.status_code == 200:
            factura = response.json()
            self.log_result("Get specific Factura", factura["numero_factura"] == factura_data["numero_factura"])
        else:
            self.log_result("Get specific Factura", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 4: Mark Factura as paid
        response = self.make_request("PUT", f"/facturas/{self.test_data['factura_id']}/pagar")
        if response and response.status_code == 200:
            self.log_result("Mark Factura as paid", True)
        else:
            self.log_result("Mark Factura as paid", False, f"Status: {response.status_code if response else 'No response'}")
    
    def test_compras_crud(self):
        """Test all Compra CRUD operations"""
        print("\n🔍 Testing Compras CRUD Operations...")
        
        # Test 1: Create Compra
        compra_data = {
            "numero_compra": "COMP-2024-001",
            "proveedor": "Proveedor Industrial SA",
            "categoria": "materiales",
            "items": [
                {
                    "descripcion": "Materia Prima A",
                    "cantidad": 100,
                    "precio_unitario": 25.0,
                    "subtotal": 2500.0
                },
                {
                    "descripcion": "Insumo B",
                    "cantidad": 50,
                    "precio_unitario": 15.0,
                    "subtotal": 750.0
                }
            ],
            "impuestos": 682.5,  # 21% IVA
            "estado_pago": "pendiente",
            "notas": "Entrega en depósito principal"
        }
        
        response = self.make_request("POST", "/compras", compra_data)
        if response and response.status_code == 200:
            compra = response.json()
            self.test_data["compra_id"] = compra["id"]
            # Verify total calculation
            expected_total = 3932.5  # 3250 + 682.5
            if compra["total"] == expected_total:
                self.log_result("Create Compra with correct total", True)
            else:
                self.log_result("Create Compra total calculation", False, f"Expected {expected_total}, got {compra['total']}")
        else:
            self.log_result("Create Compra", False, f"Status: {response.status_code if response else 'No response'}")
            return
        
        # Test 2: Get all Compras
        response = self.make_request("GET", "/compras")
        if response and response.status_code == 200:
            compras = response.json()
            self.log_result("Get all Compras", len(compras) > 0)
        else:
            self.log_result("Get all Compras", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 3: Get specific Compra
        response = self.make_request("GET", f"/compras/{self.test_data['compra_id']}")
        if response and response.status_code == 200:
            compra = response.json()
            self.log_result("Get specific Compra", compra["numero_compra"] == compra_data["numero_compra"])
        else:
            self.log_result("Get specific Compra", False, f"Status: {response.status_code if response else 'No response'}")
    
    def test_remitos_crud(self):
        """Test all Remito CRUD operations"""
        print("\n🔍 Testing Remitos CRUD Operations...")
        
        if "cliente_id" not in self.test_data or "pedido_id" not in self.test_data:
            self.log_result("Remitos CRUD", False, "Missing cliente_id or pedido_id")
            return
        
        # Test 1: Create Remito
        remito_data = {
            "numero_remito": "REM-2024-001",
            "pedido_id": self.test_data["pedido_id"],
            "factura_id": self.test_data.get("factura_id"),
            "cliente_id": self.test_data["cliente_id"],
            "items": [
                {
                    "descripcion": "Producto A - Calidad Premium",
                    "cantidad": 10,
                    "precio_unitario": 150.0,
                    "subtotal": 1500.0
                },
                {
                    "descripcion": "Producto B - Línea Estándar",
                    "cantidad": 5,
                    "precio_unitario": 80.0,
                    "subtotal": 400.0
                }
            ],
            "transportista": "Transporte Rápido SRL",
            "fecha_entrega": (datetime.now() + timedelta(days=2)).isoformat(),
            "notas": "Entregar en recepción"
        }
        
        response = self.make_request("POST", "/remitos", remito_data)
        if response and response.status_code == 200:
            remito = response.json()
            self.test_data["remito_id"] = remito["id"]
            self.log_result("Create Remito", True)
        else:
            self.log_result("Create Remito", False, f"Status: {response.status_code if response else 'No response'}")
            return
        
        # Test 2: Get all Remitos
        response = self.make_request("GET", "/remitos")
        if response and response.status_code == 200:
            remitos = response.json()
            self.log_result("Get all Remitos", len(remitos) > 0)
        else:
            self.log_result("Get all Remitos", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 3: Get specific Remito
        response = self.make_request("GET", f"/remitos/{self.test_data['remito_id']}")
        if response and response.status_code == 200:
            remito = response.json()
            self.log_result("Get specific Remito", remito["numero_remito"] == remito_data["numero_remito"])
        else:
            self.log_result("Get specific Remito", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 4: Update Remito estado
        response = self.make_request("PUT", f"/remitos/{self.test_data['remito_id']}/estado?estado=en_transito")
        if response and response.status_code == 200:
            self.log_result("Update Remito estado", True)
        else:
            self.log_result("Update Remito estado", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 5: Invalid estado
        response = self.make_request("PUT", f"/remitos/{self.test_data['remito_id']}/estado?estado=invalid")
        if response and response.status_code == 400:
            self.log_result("Remito invalid estado handling", True)
        else:
            self.log_result("Remito invalid estado handling", False, "Should return 400 for invalid estado")
    
    def test_dashboard(self):
        """Test Dashboard endpoint"""
        print("\n🔍 Testing Dashboard Endpoint...")
        
        response = self.make_request("GET", "/dashboard")
        if response and response.status_code == 200:
            dashboard = response.json()
            required_fields = ["total_ventas", "total_gastos", "ganancia_neta", 
                             "pedidos_pendientes", "facturas_pendientes", "facturas_vencidas"]
            
            all_fields_present = all(field in dashboard for field in required_fields)
            if all_fields_present:
                self.log_result("Dashboard data structure", True)
                
                # Verify calculations make sense
                if dashboard["ganancia_neta"] == dashboard["total_ventas"] - dashboard["total_gastos"]:
                    self.log_result("Dashboard calculation logic", True)
                else:
                    self.log_result("Dashboard calculation logic", False, "Ganancia neta calculation incorrect")
            else:
                missing = [f for f in required_fields if f not in dashboard]
                self.log_result("Dashboard data structure", False, f"Missing fields: {missing}")
        else:
            self.log_result("Dashboard endpoint", False, f"Status: {response.status_code if response else 'No response'}")
    
    def test_workflow_integration(self):
        """Test complete business workflow integration"""
        print("\n🔍 Testing Complete Business Workflow...")
        
        # Verify all entities were created and are linked
        if all(key in self.test_data for key in ["cliente_id", "pedido_id", "factura_id", "remito_id"]):
            self.log_result("Complete workflow data creation", True)
            
            # Test that cliente_id is consistent across all entities
            entities_to_check = [
                ("pedido", f"/pedidos/{self.test_data['pedido_id']}"),
                ("factura", f"/facturas/{self.test_data['factura_id']}"),
                ("remito", f"/remitos/{self.test_data['remito_id']}")
            ]
            
            workflow_consistent = True
            for entity_name, endpoint in entities_to_check:
                response = self.make_request("GET", endpoint)
                if response and response.status_code == 200:
                    entity = response.json()
                    if entity.get("cliente_id") != self.test_data["cliente_id"]:
                        workflow_consistent = False
                        break
                else:
                    workflow_consistent = False
                    break
            
            self.log_result("Workflow data consistency", workflow_consistent)
        else:
            missing = [k for k in ["cliente_id", "pedido_id", "factura_id", "remito_id"] if k not in self.test_data]
            self.log_result("Complete workflow data creation", False, f"Missing: {missing}")
    
    def cleanup_test_data(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete in reverse order of creation
        cleanup_order = [
            ("remito", "remito_id", "/remitos"),
            ("factura", "factura_id", "/facturas"),
            ("pedido", "pedido_id", "/pedidos"),
            ("compra", "compra_id", "/compras"),
            ("cliente", "cliente_id", "/clientes")
        ]
        
        for entity_name, id_key, endpoint in cleanup_order:
            if id_key in self.test_data:
                response = self.make_request("DELETE", f"{endpoint}/{self.test_data[id_key]}")
                if response and response.status_code == 200:
                    print(f"✅ Deleted {entity_name}")
                else:
                    print(f"⚠️  Could not delete {entity_name}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting PYME Management System Backend API Tests")
        print(f"🔗 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test basic connectivity
        response = self.make_request("GET", "/")
        if not response or response.status_code != 200:
            print(f"❌ Cannot connect to backend API at {self.base_url}")
            return False
        
        print("✅ Backend API is accessible")
        
        # Run all CRUD tests
        self.test_clientes_crud()
        self.test_pedidos_crud()
        self.test_facturas_crud()
        self.test_compras_crud()
        self.test_remitos_crud()
        self.test_dashboard()
        self.test_workflow_integration()
        
        # Clean up
        self.cleanup_test_data()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        
        if self.results["errors"]:
            print("\n🚨 ERRORS:")
            for error in self.results["errors"]:
                print(f"   • {error}")
        
        success_rate = (self.results["passed"] / (self.results["passed"] + self.results["failed"])) * 100
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        return self.results["failed"] == 0

if __name__ == "__main__":
    tester = PymeAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
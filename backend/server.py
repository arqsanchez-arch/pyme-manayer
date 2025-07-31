from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models for PYME Management System

# Cliente Model
class Cliente(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre: str
    email: str
    telefono: str = ""
    direccion: str = ""
    cuit_dni: str = ""
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)

class ClienteCreate(BaseModel):
    nombre: str
    email: str
    telefono: str = ""
    direccion: str = ""
    cuit_dni: str = ""

class ClienteUpdate(BaseModel):
    nombre: str = None
    email: str = None
    telefono: str = None
    direccion: str = None
    cuit_dni: str = None

# Pedido Model
class ItemPedido(BaseModel):
    descripcion: str
    cantidad: int
    precio_unitario: float
    subtotal: float

class Pedido(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    numero_pedido: str
    cliente_id: str
    cliente_nombre: str = ""
    items: List[ItemPedido]
    total: float
    estado: str = "pendiente"  # pendiente, en_proceso, completado, cancelado
    fecha_pedido: datetime = Field(default_factory=datetime.utcnow)
    fecha_entrega: datetime = None
    notas: str = ""

class PedidoCreate(BaseModel):
    numero_pedido: str
    cliente_id: str
    items: List[ItemPedido]
    fecha_entrega: datetime = None
    notas: str = ""

# Factura Model
class Factura(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    numero_factura: str
    pedido_id: str = None
    cliente_id: str
    cliente_nombre: str = ""
    items: List[ItemPedido]
    subtotal: float
    impuestos: float
    total: float
    estado: str = "pendiente"  # pendiente, pagada, vencida
    fecha_emision: datetime = Field(default_factory=datetime.utcnow)
    fecha_vencimiento: datetime
    fecha_pago: datetime = None
    notas: str = ""

class FacturaCreate(BaseModel):
    numero_factura: str
    pedido_id: str = None
    cliente_id: str
    items: List[ItemPedido]
    impuestos: float = 0.0
    fecha_vencimiento: datetime
    notas: str = ""

# Compra Model
class ItemCompra(BaseModel):
    descripcion: str
    cantidad: int = 1
    precio_unitario: float
    subtotal: float

class Compra(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    numero_compra: str
    proveedor: str
    categoria: str = "general"  # general, materiales, servicios, gastos
    items: List[ItemCompra]
    subtotal: float
    impuestos: float
    total: float
    fecha_compra: datetime = Field(default_factory=datetime.utcnow)
    fecha_pago: datetime = None
    estado_pago: str = "pendiente"  # pendiente, pagado
    notas: str = ""

class CompraCreate(BaseModel):
    numero_compra: str
    proveedor: str
    categoria: str = "general"
    items: List[ItemCompra]
    impuestos: float = 0.0
    fecha_pago: datetime = None
    estado_pago: str = "pendiente"
    notas: str = ""

# Remito Model
class Remito(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    numero_remito: str
    pedido_id: str
    factura_id: str = None
    cliente_id: str
    cliente_nombre: str = ""
    items: List[ItemPedido]
    transportista: str = ""
    fecha_emision: datetime = Field(default_factory=datetime.utcnow)
    fecha_entrega: datetime = None
    estado: str = "pendiente"  # pendiente, en_transito, entregado
    notas: str = ""

class RemitoCreate(BaseModel):
    numero_remito: str
    pedido_id: str
    factura_id: str = None
    cliente_id: str
    items: List[ItemPedido]
    transportista: str = ""
    fecha_entrega: datetime = None
    notas: str = ""

# Dashboard Model
class DashboardData(BaseModel):
    total_ventas: float
    total_gastos: float
    ganancia_neta: float
    pedidos_pendientes: int
    facturas_pendientes: int
    facturas_vencidas: int

# Legacy model (keep for existing functionality)
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

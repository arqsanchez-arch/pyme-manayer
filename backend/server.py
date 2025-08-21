from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
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

# Articulo Model
class Articulo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    codigo: str = ""
    nombre: str
    descripcion: str = ""
    precio: float
    categoria: str = "general"  # general, producto, servicio
    unidad_medida: str = "unidad"  # unidad, kg, m, litro, etc.
    activo: bool = True
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)

class ArticuloCreate(BaseModel):
    codigo: str = ""
    nombre: str
    descripcion: str = ""
    precio: float
    categoria: str = "general"
    unidad_medida: str = "unidad"
    activo: bool = True

class ArticuloUpdate(BaseModel):
    codigo: str = None
    nombre: str = None
    descripcion: str = None
    precio: float = None
    categoria: str = None
    unidad_medida: str = None
    activo: bool = None

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
    fecha_entrega: Optional[datetime] = None
    notas: str = ""

class PedidoCreate(BaseModel):
    numero_pedido: str
    cliente_id: str
    items: List[ItemPedido]
    fecha_entrega: Optional[datetime] = None
    notas: str = ""

# Presupuesto Model
class Presupuesto(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    numero_presupuesto: str
    cliente_id: str
    cliente_nombre: str = ""
    items: List[ItemPedido]
    subtotal: float
    impuestos: float
    total: float
    estado: str = "borrador"  # borrador, enviado, aceptado, rechazado, convertido
    fecha_emision: datetime = Field(default_factory=datetime.utcnow)
    fecha_vencimiento: datetime
    validez_dias: int = 30
    notas: str = ""

class PresupuestoCreate(BaseModel):
    numero_presupuesto: str
    cliente_id: str
    items: List[ItemPedido]
    impuestos: float = 0.0
    fecha_vencimiento: datetime
    validez_dias: int = 30
    notas: str = ""

# Nota de Crédito Model
class NotaCredito(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    numero_nota: str
    factura_id: str
    cliente_id: str
    cliente_nombre: str = ""
    motivo: str
    items: List[ItemPedido]
    subtotal: float
    impuestos: float
    total: float
    fecha_emision: datetime = Field(default_factory=datetime.utcnow)
    estado: str = "pendiente"  # pendiente, aplicada
    notas: str = ""

class NotaCreditoCreate(BaseModel):
    numero_nota: str
    factura_id: str
    cliente_id: str
    motivo: str
    items: List[ItemPedido]
    impuestos: float = 0.0
    notas: str = ""

# Nota de Débito Model
class NotaDebito(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    numero_nota: str
    factura_id: str = None
    cliente_id: str
    cliente_nombre: str = ""
    motivo: str
    items: List[ItemPedido]
    subtotal: float
    impuestos: float
    total: float
    fecha_emision: datetime = Field(default_factory=datetime.utcnow)
    estado: str = "pendiente"  # pendiente, aplicada
    notas: str = ""

class NotaDebitoCreate(BaseModel):
    numero_nota: str
    factura_id: str = None
    cliente_id: str
    motivo: str
    items: List[ItemPedido]
    impuestos: float = 0.0
    notas: str = ""

# Cuenta Corriente Model
class MovimientoCuentaCorriente(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    cliente_id: str
    cliente_nombre: str = ""
    tipo_movimiento: str  # factura, pago, nota_credito, nota_debito
    documento_id: str  # ID del documento relacionado
    numero_documento: str
    debe: float = 0.0
    haber: float = 0.0
    saldo: float = 0.0
    fecha: datetime = Field(default_factory=datetime.utcnow)
    descripcion: str = ""

class CuentaCorrienteResumen(BaseModel):
    cliente_id: str
    cliente_nombre: str
    saldo_actual: float
    movimientos: List[MovimientoCuentaCorriente]

# Recibo Model
class Recibo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    numero_recibo: str
    cliente_id: str
    cliente_nombre: str = ""
    facturas_aplicadas: List[str] = []  # IDs de facturas
    forma_pago: str = "efectivo"  # efectivo, transferencia, cheque, tarjeta
    monto_total: float
    fecha_pago: datetime = Field(default_factory=datetime.utcnow)
    observaciones: str = ""
    estado: str = "activo"  # activo, anulado

class ReciboCreate(BaseModel):
    numero_recibo: str
    cliente_id: str
    facturas_aplicadas: List[str] = []
    forma_pago: str = "efectivo"
    monto_total: float
    observaciones: str = ""

# Factura Model
class Factura(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    numero_factura: str
    pedido_id: Optional[str] = None
    cliente_id: str
    cliente_nombre: str = ""
    items: List[ItemPedido]
    subtotal: float
    impuestos: float
    total: float
    estado: str = "pendiente"  # pendiente, pagada, vencida
    fecha_emision: datetime = Field(default_factory=datetime.utcnow)
    fecha_vencimiento: datetime
    fecha_pago: Optional[datetime] = None
    notas: str = ""

class FacturaCreate(BaseModel):
    numero_factura: str
    pedido_id: Optional[str] = None
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
    fecha_pago: Optional[datetime] = None
    estado_pago: str = "pendiente"  # pendiente, pagado
    notas: str = ""

class CompraCreate(BaseModel):
    numero_compra: str
    proveedor: str
    categoria: str = "general"
    items: List[ItemCompra]
    impuestos: float = 0.0
    fecha_pago: Optional[datetime] = None
    estado_pago: str = "pendiente"
    notas: str = ""

# Remito Model
class Remito(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    numero_remito: str
    pedido_id: str
    factura_id: Optional[str] = None
    cliente_id: str
    cliente_nombre: str = ""
    items: List[ItemPedido]
    transportista: str = ""
    fecha_emision: datetime = Field(default_factory=datetime.utcnow)
    fecha_entrega: Optional[datetime] = None
    estado: str = "pendiente"  # pendiente, en_transito, entregado
    notas: str = ""

class RemitoCreate(BaseModel):
    numero_remito: str
    pedido_id: str
    factura_id: Optional[str] = None
    cliente_id: str
    items: List[ItemPedido]
    transportista: str = ""
    fecha_entrega: Optional[datetime] = None
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

# CRUD Endpoints for Presupuestos
@api_router.post("/presupuestos", response_model=Presupuesto)
async def create_presupuesto(presupuesto: PresupuestoCreate):
    # Get client name
    cliente = await db.clientes.find_one({"id": presupuesto.cliente_id})
    cliente_nombre = cliente["nombre"] if cliente else ""
    
    # Calculate totals
    subtotal = sum(item.subtotal for item in presupuesto.items)
    total = subtotal + presupuesto.impuestos
    
    presupuesto_dict = presupuesto.dict()
    presupuesto_dict["cliente_nombre"] = cliente_nombre
    presupuesto_dict["subtotal"] = subtotal
    presupuesto_dict["total"] = total
    presupuesto_obj = Presupuesto(**presupuesto_dict)
    await db.presupuestos.insert_one(presupuesto_obj.dict())
    return presupuesto_obj

@api_router.get("/presupuestos", response_model=List[Presupuesto])
async def get_presupuestos():
    presupuestos = await db.presupuestos.find().to_list(1000)
    return [Presupuesto(**presupuesto) for presupuesto in presupuestos]

@api_router.get("/presupuestos/{presupuesto_id}", response_model=Presupuesto)
async def get_presupuesto(presupuesto_id: str):
    presupuesto = await db.presupuestos.find_one({"id": presupuesto_id})
    if not presupuesto:
        raise HTTPException(status_code=404, detail="Presupuesto not found")
    return Presupuesto(**presupuesto)

@api_router.put("/presupuestos/{presupuesto_id}/estado")
async def update_presupuesto_estado(presupuesto_id: str, estado: str):
    valid_estados = ["borrador", "enviado", "aceptado", "rechazado", "convertido"]
    if estado not in valid_estados:
        raise HTTPException(status_code=400, detail="Invalid estado")
    
    result = await db.presupuestos.update_one({"id": presupuesto_id}, {"$set": {"estado": estado}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Presupuesto not found")
    return {"message": f"Presupuesto estado updated to {estado}"}

# CRUD Endpoints for Notas de Crédito
@api_router.post("/notas-credito", response_model=NotaCredito)
async def create_nota_credito(nota: NotaCreditoCreate):
    # Get client name
    cliente = await db.clientes.find_one({"id": nota.cliente_id})
    cliente_nombre = cliente["nombre"] if cliente else ""
    
    # Calculate totals
    subtotal = sum(item.subtotal for item in nota.items)
    total = subtotal + nota.impuestos
    
    nota_dict = nota.dict()
    nota_dict["cliente_nombre"] = cliente_nombre
    nota_dict["subtotal"] = subtotal
    nota_dict["total"] = total
    nota_obj = NotaCredito(**nota_dict)
    await db.notas_credito.insert_one(nota_obj.dict())
    return nota_obj

@api_router.get("/notas-credito", response_model=List[NotaCredito])
async def get_notas_credito():
    notas = await db.notas_credito.find().to_list(1000)
    return [NotaCredito(**nota) for nota in notas]

@api_router.put("/notas-credito/{nota_id}/aplicar")
async def aplicar_nota_credito(nota_id: str):
    result = await db.notas_credito.update_one({"id": nota_id}, {"$set": {"estado": "aplicada"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Nota de crédito not found")
    return {"message": "Nota de crédito aplicada"}

# CRUD Endpoints for Notas de Débito
@api_router.post("/notas-debito", response_model=NotaDebito)
async def create_nota_debito(nota: NotaDebitoCreate):
    # Get client name
    cliente = await db.clientes.find_one({"id": nota.cliente_id})
    cliente_nombre = cliente["nombre"] if cliente else ""
    
    # Calculate totals
    subtotal = sum(item.subtotal for item in nota.items)
    total = subtotal + nota.impuestos
    
    nota_dict = nota.dict()
    nota_dict["cliente_nombre"] = cliente_nombre
    nota_dict["subtotal"] = subtotal
    nota_dict["total"] = total
    nota_obj = NotaDebito(**nota_dict)
    await db.notas_debito.insert_one(nota_obj.dict())
    return nota_obj

@api_router.get("/notas-debito", response_model=List[NotaDebito])
async def get_notas_debito():
    notas = await db.notas_debito.find().to_list(1000)
    return [NotaDebito(**nota) for nota in notas]

@api_router.put("/notas-debito/{nota_id}/aplicar")
async def aplicar_nota_debito(nota_id: str):
    result = await db.notas_debito.update_one({"id": nota_id}, {"$set": {"estado": "aplicada"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Nota de débito not found")
    return {"message": "Nota de débito aplicada"}

# CRUD Endpoints for Cuentas Corrientes
@api_router.get("/cuentas-corrientes/{cliente_id}", response_model=CuentaCorrienteResumen)
async def get_cuenta_corriente(cliente_id: str):
    # Get client name
    cliente = await db.clientes.find_one({"id": cliente_id})
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente not found")
    
    # Get all movements for this client
    movimientos = await db.movimientos_cc.find({"cliente_id": cliente_id}).sort("fecha", -1).to_list(1000)
    movimientos_list = [MovimientoCuentaCorriente(**mov) for mov in movimientos]
    
    # Calculate current balance
    saldo_actual = sum(mov.haber - mov.debe for mov in movimientos_list)
    
    return CuentaCorrienteResumen(
        cliente_id=cliente_id,
        cliente_nombre=cliente["nombre"],
        saldo_actual=saldo_actual,
        movimientos=movimientos_list
    )

@api_router.get("/cuentas-corrientes", response_model=List[CuentaCorrienteResumen])
async def get_all_cuentas_corrientes():
    # Get all clients with movements
    pipeline = [
        {"$group": {"_id": "$cliente_id", "count": {"$sum": 1}}},
        {"$match": {"count": {"$gt": 0}}}
    ]
    clientes_con_movimientos = await db.movimientos_cc.aggregate(pipeline).to_list(1000)
    
    result = []
    for cliente_data in clientes_con_movimientos:
        cliente_id = cliente_data["_id"]
        cuenta_corriente = await get_cuenta_corriente(cliente_id)
        result.append(cuenta_corriente)
    
    return result

# CRUD Endpoints for Recibos
@api_router.post("/recibos", response_model=Recibo)
async def create_recibo(recibo: ReciboCreate):
    # Get client name
    cliente = await db.clientes.find_one({"id": recibo.cliente_id})
    cliente_nombre = cliente["nombre"] if cliente else ""
    
    recibo_dict = recibo.dict()
    recibo_dict["cliente_nombre"] = cliente_nombre
    recibo_obj = Recibo(**recibo_dict)
    await db.recibos.insert_one(recibo_obj.dict())
    
    # Create movement in cuenta corriente
    movimiento = MovimientoCuentaCorriente(
        cliente_id=recibo.cliente_id,
        cliente_nombre=cliente_nombre,
        tipo_movimiento="pago",
        documento_id=recibo_obj.id,
        numero_documento=recibo.numero_recibo,
        haber=recibo.monto_total,
        descripcion=f"Pago recibido - {recibo.observaciones}"
    )
    await db.movimientos_cc.insert_one(movimiento.dict())
    
    return recibo_obj

@api_router.get("/recibos", response_model=List[Recibo])
async def get_recibos():
    recibos = await db.recibos.find().to_list(1000)
    return [Recibo(**recibo) for recibo in recibos]

@api_router.get("/recibos/{recibo_id}", response_model=Recibo)
async def get_recibo(recibo_id: str):
    recibo = await db.recibos.find_one({"id": recibo_id})
    if not recibo:
        raise HTTPException(status_code=404, detail="Recibo not found")
    return Recibo(**recibo)

@api_router.put("/recibos/{recibo_id}/anular")
async def anular_recibo(recibo_id: str):
    result = await db.recibos.update_one({"id": recibo_id}, {"$set": {"estado": "anulado"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Recibo not found")
    return {"message": "Recibo anulado"}

# CRUD Endpoints for Articulos
@api_router.post("/articulos", response_model=Articulo)
async def create_articulo(articulo: ArticuloCreate):
    articulo_dict = articulo.dict()
    articulo_obj = Articulo(**articulo_dict)
    await db.articulos.insert_one(articulo_obj.dict())
    return articulo_obj

@api_router.get("/articulos", response_model=List[Articulo])
async def get_articulos(activos_only: bool = True):
    filter_query = {"activo": True} if activos_only else {}
    articulos = await db.articulos.find(filter_query).to_list(1000)
    return [Articulo(**articulo) for articulo in articulos]

@api_router.get("/articulos/{articulo_id}", response_model=Articulo)
async def get_articulo(articulo_id: str):
    articulo = await db.articulos.find_one({"id": articulo_id})
    if not articulo:
        raise HTTPException(status_code=404, detail="Articulo not found")
    return Articulo(**articulo)

@api_router.put("/articulos/{articulo_id}", response_model=Articulo)
async def update_articulo(articulo_id: str, articulo_update: ArticuloUpdate):
    update_data = {k: v for k, v in articulo_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.articulos.update_one({"id": articulo_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Articulo not found")
    
    updated_articulo = await db.articulos.find_one({"id": articulo_id})
    return Articulo(**updated_articulo)

@api_router.delete("/articulos/{articulo_id}")
async def delete_articulo(articulo_id: str):
    result = await db.articulos.delete_one({"id": articulo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Articulo not found")
    return {"message": "Articulo deleted successfully"}

@api_router.put("/articulos/{articulo_id}/toggle")
async def toggle_articulo_activo(articulo_id: str):
    articulo = await db.articulos.find_one({"id": articulo_id})
    if not articulo:
        raise HTTPException(status_code=404, detail="Articulo not found")
    
    new_status = not articulo.get("activo", True)
    await db.articulos.update_one({"id": articulo_id}, {"$set": {"activo": new_status}})
    return {"message": f"Articulo {'activated' if new_status else 'deactivated'}"}

# CRUD Endpoints for Clientes
@api_router.post("/clientes", response_model=Cliente)
async def create_cliente(cliente: ClienteCreate):
    cliente_dict = cliente.dict()
    cliente_obj = Cliente(**cliente_dict)
    await db.clientes.insert_one(cliente_obj.dict())
    return cliente_obj

@api_router.get("/clientes", response_model=List[Cliente])
async def get_clientes():
    clientes = await db.clientes.find().to_list(1000)
    return [Cliente(**cliente) for cliente in clientes]

@api_router.get("/clientes/{cliente_id}", response_model=Cliente)
async def get_cliente(cliente_id: str):
    cliente = await db.clientes.find_one({"id": cliente_id})
    if not cliente:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Cliente not found")
    return Cliente(**cliente)

@api_router.put("/clientes/{cliente_id}", response_model=Cliente)
async def update_cliente(cliente_id: str, cliente_update: ClienteUpdate):
    update_data = {k: v for k, v in cliente_update.dict().items() if v is not None}
    if not update_data:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.clientes.update_one({"id": cliente_id}, {"$set": update_data})
    if result.matched_count == 0:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Cliente not found")
    
    updated_cliente = await db.clientes.find_one({"id": cliente_id})
    return Cliente(**updated_cliente)

@api_router.delete("/clientes/{cliente_id}")
async def delete_cliente(cliente_id: str):
    result = await db.clientes.delete_one({"id": cliente_id})
    if result.deleted_count == 0:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Cliente not found")
    return {"message": "Cliente deleted successfully"}

# CRUD Endpoints for Pedidos
@api_router.post("/pedidos", response_model=Pedido)
async def create_pedido(pedido: PedidoCreate):
    # Get client name
    cliente = await db.clientes.find_one({"id": pedido.cliente_id})
    cliente_nombre = cliente["nombre"] if cliente else ""
    
    # Calculate total
    total = sum(item.subtotal for item in pedido.items)
    
    pedido_dict = pedido.dict()
    pedido_dict["cliente_nombre"] = cliente_nombre
    pedido_dict["total"] = total
    pedido_obj = Pedido(**pedido_dict)
    await db.pedidos.insert_one(pedido_obj.dict())
    return pedido_obj

@api_router.get("/pedidos", response_model=List[Pedido])
async def get_pedidos():
    pedidos = await db.pedidos.find().to_list(1000)
    return [Pedido(**pedido) for pedido in pedidos]

@api_router.get("/pedidos/{pedido_id}", response_model=Pedido)
async def get_pedido(pedido_id: str):
    pedido = await db.pedidos.find_one({"id": pedido_id})
    if not pedido:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Pedido not found")
    return Pedido(**pedido)

@api_router.put("/pedidos/{pedido_id}/estado")
async def update_pedido_estado(pedido_id: str, estado: str):
    valid_estados = ["pendiente", "en_proceso", "completado", "cancelado"]
    if estado not in valid_estados:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Invalid estado")
    
    result = await db.pedidos.update_one({"id": pedido_id}, {"$set": {"estado": estado}})
    if result.matched_count == 0:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Pedido not found")
    return {"message": f"Pedido estado updated to {estado}"}

# CRUD Endpoints for Facturas
@api_router.post("/facturas", response_model=Factura)
async def create_factura(factura: FacturaCreate):
    # Get client name
    cliente = await db.clientes.find_one({"id": factura.cliente_id})
    cliente_nombre = cliente["nombre"] if cliente else ""
    
    # Calculate totals
    subtotal = sum(item.subtotal for item in factura.items)
    total = subtotal + factura.impuestos
    
    factura_dict = factura.dict()
    factura_dict["cliente_nombre"] = cliente_nombre
    factura_dict["subtotal"] = subtotal
    factura_dict["total"] = total
    factura_obj = Factura(**factura_dict)
    await db.facturas.insert_one(factura_obj.dict())
    return factura_obj

@api_router.get("/facturas", response_model=List[Factura])
async def get_facturas():
    facturas = await db.facturas.find().to_list(1000)
    return [Factura(**factura) for factura in facturas]

@api_router.get("/facturas/{factura_id}", response_model=Factura)
async def get_factura(factura_id: str):
    factura = await db.facturas.find_one({"id": factura_id})
    if not factura:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Factura not found")
    return Factura(**factura)

@api_router.put("/facturas/{factura_id}/pagar")
async def marcar_factura_pagada(factura_id: str):
    result = await db.facturas.update_one(
        {"id": factura_id}, 
        {"$set": {"estado": "pagada", "fecha_pago": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Factura not found")
    return {"message": "Factura marked as paid"}

@api_router.delete("/facturas/{factura_id}")
async def delete_factura(factura_id: str):
    result = await db.facturas.delete_one({"id": factura_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Factura not found")
    return {"message": "Factura deleted successfully"}

# CRUD Endpoints for Compras
@api_router.post("/compras", response_model=Compra)
async def create_compra(compra: CompraCreate):
    # Calculate totals
    subtotal = sum(item.subtotal for item in compra.items)
    total = subtotal + compra.impuestos
    
    compra_dict = compra.dict()
    compra_dict["subtotal"] = subtotal
    compra_dict["total"] = total
    compra_obj = Compra(**compra_dict)
    await db.compras.insert_one(compra_obj.dict())
    return compra_obj

@api_router.get("/compras", response_model=List[Compra])
async def get_compras():
    compras = await db.compras.find().to_list(1000)
    return [Compra(**compra) for compra in compras]

@api_router.get("/compras/{compra_id}", response_model=Compra)
async def get_compra(compra_id: str):
    compra = await db.compras.find_one({"id": compra_id})
    if not compra:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Compra not found")
    return Compra(**compra)

# CRUD Endpoints for Remitos
@api_router.post("/remitos", response_model=Remito)
async def create_remito(remito: RemitoCreate):
    # Get client name
    cliente = await db.clientes.find_one({"id": remito.cliente_id})
    cliente_nombre = cliente["nombre"] if cliente else ""
    
    remito_dict = remito.dict()
    remito_dict["cliente_nombre"] = cliente_nombre
    remito_obj = Remito(**remito_dict)
    await db.remitos.insert_one(remito_obj.dict())
    return remito_obj

@api_router.get("/remitos", response_model=List[Remito])
async def get_remitos():
    remitos = await db.remitos.find().to_list(1000)
    return [Remito(**remito) for remito in remitos]

@api_router.get("/remitos/{remito_id}", response_model=Remito)
async def get_remito(remito_id: str):
    remito = await db.remitos.find_one({"id": remito_id})
    if not remito:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Remito not found")
    return Remito(**remito)

@api_router.put("/remitos/{remito_id}/estado")
async def update_remito_estado(remito_id: str, estado: str):
    valid_estados = ["pendiente", "en_transito", "entregado"]
    if estado not in valid_estados:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Invalid estado")
    
    result = await db.remitos.update_one({"id": remito_id}, {"$set": {"estado": estado}})
    if result.matched_count == 0:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Remito not found")
    return {"message": f"Remito estado updated to {estado}"}

# Dashboard Endpoint
@api_router.get("/dashboard", response_model=DashboardData)
async def get_dashboard_data():
    # Calculate total sales from paid invoices
    facturas_pagadas = await db.facturas.find({"estado": "pagada"}).to_list(1000)
    total_ventas = sum(factura["total"] for factura in facturas_pagadas)
    
    # Calculate total expenses from purchases
    compras = await db.compras.find().to_list(1000)
    total_gastos = sum(compra["total"] for compra in compras)
    
    # Calculate net profit
    ganancia_neta = total_ventas - total_gastos
    
    # Count pending orders and invoices
    pedidos_pendientes = await db.pedidos.count_documents({"estado": "pendiente"})
    facturas_pendientes = await db.facturas.count_documents({"estado": "pendiente"})
    facturas_vencidas = await db.facturas.count_documents({
        "estado": "pendiente",
        "fecha_vencimiento": {"$lt": datetime.utcnow()}
    })
    
    return DashboardData(
        total_ventas=total_ventas,
        total_gastos=total_gastos,
        ganancia_neta=ganancia_neta,
        pedidos_pendientes=pedidos_pendientes,
        facturas_pendientes=facturas_pendientes,
        facturas_vencidas=facturas_vencidas
    )

# Legacy endpoints (keep for existing functionality)
@api_router.get("/")
async def root():
    return {"message": "PYME Management API"}

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

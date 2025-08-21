import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Eye, Printer, FileText, Mail, MessageCircle, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Facturas = ({ searchTerm }) => {
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingFactura, setViewingFactura] = useState(null);
  
  // Filtros específicos
  const [filtros, setFiltros] = useState({
    busqueda: "",
    estado: "todos" // todos, cobro_total, cobro_parcial, pendiente, vencida
  });

  const [formData, setFormData] = useState({
    // Datos de la factura
    numero_factura: "",
    tipo_factura: "A",
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_vencimiento: "",
    
    // Cliente
    cliente_id: "",
    condicion_iva: "Responsable Inscripto",
    contacto_nombre: "",
    contacto_telefono: "",
    
    // Pedido base
    pedido_id: "",
    
    // Items
    items: [{ articulo_id: "", descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0 }],
    
    // Totales
    porcentaje_iva: "21", // 21% o 10.5%
    impuestos: 0,
    
    // Notas y condiciones
    notas: "",
    condiciones: ""
  });

  useEffect(() => {
    fetchFacturas();
    fetchClientes();
    fetchPedidos();
    fetchArticulos();
  }, []);

  const fetchArticulos = async () => {
    try {
      const response = await axios.get(`${API}/articulos`);
      setArticulos(response.data);
    } catch (error) {
      console.error("Error fetching articulos:", error);
    }
  };

  const fetchFacturas = async () => {
    try {
      const response = await axios.get(`${API}/facturas`);
      setFacturas(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching facturas:", error);
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await axios.get(`${API}/clientes`);
      setClientes(response.data);
    } catch (error) {
      console.error("Error fetching clientes:", error);
    }
  };

  const fetchPedidos = async () => {
    try {
      const response = await axios.get(`${API}/pedidos`);
      setPedidos(response.data.filter(p => p.estado === 'completado'));
    } catch (error) {
      console.error("Error fetching pedidos:", error);
    }
  };

  const calculateItemSubtotal = (cantidad, precio) => {
    return parseFloat(cantidad) * parseFloat(precio) || 0;
  };

  // Función para calcular IVA automáticamente
  const calculateIVA = (subtotal, porcentaje) => {
    const porcentajeDecimal = parseFloat(porcentaje) / 100;
    return subtotal * porcentajeDecimal;
  };

  // Calcular subtotal e IVA automáticamente
  const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
  const impuestosCalculados = calculateIVA(subtotal, formData.porcentaje_iva);
  const total = subtotal + impuestosCalculados;

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Si se selecciona un artículo, autocompletar los datos
    if (field === 'articulo_id' && value) {
      const articulo = articulos.find(a => a.id === value);
      if (articulo) {
        newItems[index].descripcion = articulo.nombre;
        newItems[index].precio_unitario = articulo.precio;
        newItems[index].subtotal = calculateItemSubtotal(
          newItems[index].cantidad,
          articulo.precio
        );
      }
    }
    
    // Recalcular subtotal si cambia cantidad o precio
    if (field === 'cantidad' || field === 'precio_unitario') {
      newItems[index].subtotal = calculateItemSubtotal(
        newItems[index].cantidad,
        newItems[index].precio_unitario
      );
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { articulo_id: "", descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const loadPedidoItems = (pedidoId) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (pedido) {
      setFormData({
        ...formData,
        pedido_id: pedidoId,
        cliente_id: pedido.cliente_id,
        items: pedido.items
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const facturaData = { ...formData };
      if (!facturaData.numero_factura) {
        facturaData.numero_factura = `FAC-${Date.now()}`;
      }

      await axios.post(`${API}/facturas`, facturaData);
      
      setDialogOpen(false);
      setFormData({
        numero_factura: "",
        tipo_factura: "A",
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: "",
        cliente_id: "",
        condicion_iva: "Responsable Inscripto",
        contacto_nombre: "",
        contacto_telefono: "",
        pedido_id: "",
        items: [{ articulo_id: "", descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0 }],
        impuestos: 0,
        notas: "",
        condiciones: ""
      });
      fetchFacturas();
    } catch (error) {
      console.error("Error saving factura:", error);
    }
  };

  const marcarPagada = async (facturaId) => {
    try {
      await axios.put(`${API}/facturas/${facturaId}/pagar`);
      fetchFacturas();
    } catch (error) {
      console.error("Error marking factura as paid:", error);
    }
  };

  const deleteFactura = async (facturaId) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta factura?")) {
      try {
        await axios.delete(`${API}/facturas/${facturaId}`);
        fetchFacturas();
      } catch (error) {
        console.error("Error deleting factura:", error);
      }
    }
  };

  const getEstadoBadge = (estado, fechaVencimiento, fechaPago, total, montoPagado = 0) => {
    const now = new Date();
    const vencimiento = new Date(fechaVencimiento);
    
    if (estado === 'pagada' || montoPagado >= total) {
      return <Badge variant="outline" className="bg-green-50 text-green-700">Cobro Total</Badge>;
    } else if (montoPagado > 0 && montoPagado < total) {
      return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">Cobro Parcial</Badge>;
    } else if (now > vencimiento && estado === 'pendiente') {
      return <Badge variant="destructive">Vencida</Badge>;
    } else {
      return <Badge variant="default">Pendiente</Badge>;
    }
  };

  // Función para obtener el estado real de la factura
  const getFacturaEstado = (factura) => {
    const now = new Date();
    const vencimiento = new Date(factura.fecha_vencimiento);
    const montoPagado = factura.monto_pagado || 0;
    
    if (factura.estado === 'pagada' || montoPagado >= factura.total) {
      return 'cobro_total';
    } else if (montoPagado > 0 && montoPagado < factura.total) {
      return 'cobro_parcial';
    } else if (now > vencimiento && factura.estado === 'pendiente') {
      return 'vencida';
    } else {
      return 'pendiente';
    }
  };

  // Filtrado de facturas
  const filteredFacturas = facturas.filter(factura => {
    // Filtro por búsqueda (cliente o número)
    const matchesSearch = !filtros.busqueda || 
      factura.numero_factura?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      factura.cliente_nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    // Filtro por estado
    const facturaEstado = getFacturaEstado(factura);
    const matchesEstado = filtros.estado === 'todos' || facturaEstado === filtros.estado;
    
    // También aplicar el searchTerm del componente padre si existe
    const matchesParentSearch = !searchTerm || 
      factura.numero_factura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch && matchesEstado && matchesParentSearch;
  });

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      estado: "todos"
    });
  };

  // Funciones para acciones
  const handlePrint = (factura) => {
    console.log("Imprimir factura:", factura.numero_factura);
    // Implementar lógica de impresión
  };

  const handleDownloadPDF = (factura) => {
    console.log("Descargar PDF:", factura.numero_factura);
    // Implementar lógica de descarga PDF
  };

  const handleSendEmail = (factura) => {
    console.log("Enviar email:", factura.numero_factura);
    // Implementar lógica de envío por email
  };

  const handleSendWhatsApp = (factura) => {
    console.log("Enviar WhatsApp:", factura.numero_factura);
    // Implementar lógica de envío por WhatsApp
  };

  const handleEdit = (factura) => {
    setFormData({
      numero_factura: factura.numero_factura,
      tipo_factura: factura.tipo_factura || "A",
      fecha_emision: new Date(factura.fecha_emision).toISOString().split('T')[0],
      fecha_vencimiento: new Date(factura.fecha_vencimiento).toISOString().split('T')[0],
      cliente_id: factura.cliente_id,
      condicion_iva: factura.condicion_iva || "Responsable Inscripto",
      contacto_nombre: factura.contacto_nombre || "",
      contacto_telefono: factura.contacto_telefono || "",
      pedido_id: factura.pedido_id || "",
      items: factura.items,
      impuestos: factura.impuestos,
      notas: factura.notas,
      condiciones: factura.condiciones || ""
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-lg">Cargando facturas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros específicos */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Búsqueda por cliente o número */}
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Buscar por cliente o número de factura..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
              />
            </div>
            
            {/* Filtros de estado */}
            <Button 
              variant={filtros.estado === 'cobro_total' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltros({...filtros, estado: 'cobro_total'})}
              className="text-green-700"
            >
              Cobro Total
            </Button>
            
            <Button 
              variant={filtros.estado === 'cobro_parcial' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltros({...filtros, estado: 'cobro_parcial'})}
              className="text-yellow-700"
            >
              Cobro Parcial
            </Button>
            
            <Button 
              variant={filtros.estado === 'pendiente' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltros({...filtros, estado: 'pendiente'})}
            >
              Pendiente
            </Button>
            
            <Button 
              variant={filtros.estado === 'vencida' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltros({...filtros, estado: 'vencida'})}
              className="text-red-700"
            >
              Vencidas
            </Button>
            
            {/* Botón para restaurar filtros */}
            <Button 
              variant="ghost"
              size="sm"
              onClick={limpiarFiltros}
              className="text-gray-600"
            >
              Restaurar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Factura</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* BLOQUE 1: DATOS DE LA FACTURA */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos de la Factura</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="numero_factura">N° de Factura</Label>
                    <Input
                      id="numero_factura"
                      value={formData.numero_factura}
                      onChange={(e) => setFormData({...formData, numero_factura: e.target.value})}
                      placeholder="Se generará automáticamente"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tipo_factura">Tipo de Factura</Label>
                    <Select value={formData.tipo_factura} onValueChange={(value) => setFormData({...formData, tipo_factura: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Tipo A</SelectItem>
                        <SelectItem value="B">Tipo B</SelectItem>
                        <SelectItem value="C">Tipo C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="fecha_emision">Fecha de Emisión</Label>
                    <Input
                      id="fecha_emision"
                      type="date"
                      value={formData.fecha_emision}
                      onChange={(e) => setFormData({...formData, fecha_emision: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento *</Label>
                    <Input
                      id="fecha_vencimiento"
                      type="date"
                      value={formData.fecha_vencimiento}
                      onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BLOQUE 2: DATOS DEL CLIENTE */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="cliente_id">Cliente *</Label>
                    <Select value={formData.cliente_id} onValueChange={(value) => setFormData({...formData, cliente_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nombre} - {cliente.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Mostrar datos del cliente seleccionado */}
                {formData.cliente_id && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    {(() => {
                      const clienteSeleccionado = clientes.find(c => c.id === formData.cliente_id);
                      return clienteSeleccionado ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div><strong>Nombre:</strong> {clienteSeleccionado.nombre}</div>
                          <div><strong>Email:</strong> {clienteSeleccionado.email}</div>
                          <div><strong>Dirección:</strong> {clienteSeleccionado.direccion}</div>
                          <div><strong>Teléfono:</strong> {clienteSeleccionado.telefono}</div>
                          <div><strong>CUIT:</strong> {clienteSeleccionado.cuit_dni}</div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="condicion_iva">Condición del IVA</Label>
                    <Select value={formData.condicion_iva} onValueChange={(value) => setFormData({...formData, condicion_iva: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Responsable Inscripto">Responsable Inscripto</SelectItem>
                        <SelectItem value="Monotributista">Monotributista</SelectItem>
                        <SelectItem value="Exento">Exento</SelectItem>
                        <SelectItem value="Consumidor Final">Consumidor Final</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="contacto_nombre">Contacto</Label>
                    <Input
                      id="contacto_nombre"
                      value={formData.contacto_nombre}
                      onChange={(e) => setFormData({...formData, contacto_nombre: e.target.value})}
                      placeholder="Nombre del contacto"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contacto_telefono">Teléfono Contacto</Label>
                    <Input
                      id="contacto_telefono"
                      value={formData.contacto_telefono}
                      onChange={(e) => setFormData({...formData, contacto_telefono: e.target.value})}
                      placeholder="Teléfono del contacto"
                    />
                  </div>
                </div>

                {/* Opción de cargar desde pedido */}
                <div>
                  <Label htmlFor="pedido_id">Basado en Pedido (Opcional)</Label>
                  <Select value={formData.pedido_id} onValueChange={loadPedidoItems}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar pedido completado" />
                    </SelectTrigger>
                    <SelectContent>
                      {pedidos.map((pedido) => (
                        <SelectItem key={pedido.id} value={pedido.id}>
                          {pedido.numero_pedido} - {pedido.cliente_nombre} - ${pedido.total}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* BLOQUE 3: DETALLE DE PRODUCTOS */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Detalle de Productos</CardTitle>
                  <Button type="button" onClick={addItem} size="sm">
                    Agregar Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 p-3 border rounded-lg">
                      <div className="col-span-5">
                        <Label className="text-xs">Descripción *</Label>
                        <Input
                          placeholder="Descripción del producto/servicio"
                          value={item.descripcion}
                          onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Cantidad *</Label>
                        <Input
                          type="number"
                          placeholder="1"
                          value={item.cantidad}
                          onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                          min="1"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Precio Unitario *</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={item.precio_unitario}
                          onChange={(e) => handleItemChange(index, 'precio_unitario', e.target.value)}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Subtotal</Label>
                        <Input
                          value={`$${item.subtotal.toFixed(2)}`}
                          readOnly
                          className="bg-gray-50 font-medium"
                        />
                      </div>
                      <div className="col-span-1">
                        <Label className="text-xs text-transparent">-</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1}
                          className="w-full"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* BLOQUE 4: TOTALES */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="impuestos">Impuestos/IVA</Label>
                      <Input
                        id="impuestos"
                        type="number"
                        value={formData.impuestos}
                        onChange={(e) => setFormData({...formData, impuestos: e.target.value})}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center text-lg">
                      <span>Subtotal:</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span>Impuestos:</span>
                      <span className="font-medium">${parseFloat(formData.impuestos || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold text-blue-700 mt-2 pt-2 border-t border-blue-200">
                      <span>TOTAL FACTURA:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BLOQUE 5: NOTAS Y CONDICIONES */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notas y Condiciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notas">Notas</Label>
                  <textarea
                    id="notas"
                    value={formData.notas}
                    onChange={(e) => setFormData({...formData, notas: e.target.value})}
                    className="w-full min-h-20 p-3 border border-gray-300 rounded-md"
                    placeholder="Notas adicionales para la factura..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="condiciones">Condiciones</Label>
                  <textarea
                    id="condiciones"
                    value={formData.condiciones}
                    onChange={(e) => setFormData({...formData, condiciones: e.target.value})}
                    className="w-full min-h-20 p-3 border border-gray-300 rounded-md"
                    placeholder="Términos y condiciones de la factura..."
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Botones de acción */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Crear Factura
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Facturas Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">N° de Factura</th>
                  <th className="text-left p-4 font-medium text-gray-700">Cliente</th>
                  <th className="text-left p-4 font-medium text-gray-700">Fecha</th>
                  <th className="text-right p-4 font-medium text-gray-700">Monto</th>
                  <th className="text-center p-4 font-medium text-gray-700">Estado</th>
                  <th className="text-center p-4 font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacturas.map((factura, index) => (
                  <tr key={factura.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{factura.numero_factura}</p>
                        <p className="text-sm text-gray-500">
                          Emisión: {new Date(factura.fecha_emision).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{factura.cliente_nombre}</p>
                        <p className="text-sm text-gray-500">
                          Vence: {new Date(factura.fecha_vencimiento).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(factura.fecha_emision).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div>
                        <p className="font-bold text-gray-900">${factura.total.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">IVA inc.</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {getEstadoBadge(factura.estado, factura.fecha_vencimiento, factura.fecha_pago, factura.total, factura.monto_pagado)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setViewingFactura(factura);
                            setViewDialogOpen(true);
                          }}
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(factura)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFactura(factura.id)}
                          title="Eliminar"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrint(factura)}
                          title="Imprimir"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPDF(factura)}
                          title="Descargar PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendEmail(factura)}
                          title="Enviar por Email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendWhatsApp(factura)}
                          title="Enviar por WhatsApp"
                          className="text-green-600"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredFacturas.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? "No se encontraron facturas con ese criterio" : "No hay facturas registradas"}
          </p>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de la Factura</DialogTitle>
          </DialogHeader>
          {viewingFactura && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Número:</strong> {viewingFactura.numero_factura}</p>
                <p><strong>Cliente:</strong> {viewingFactura.cliente_nombre}</p>
                <p><strong>Estado:</strong> {getEstadoBadge(viewingFactura.estado, viewingFactura.fecha_vencimiento)}</p>
                <p><strong>Total:</strong> ${viewingFactura.total.toLocaleString()}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Items:</h4>
                <div className="space-y-2">
                  {viewingFactura.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <p><strong>{item.descripcion}</strong></p>
                      <p>Cantidad: {item.cantidad} × ${item.precio_unitario} = ${item.subtotal}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 p-3 bg-blue-50 rounded">
                  <p>Subtotal: ${viewingFactura.subtotal}</p>
                  <p>Impuestos: ${viewingFactura.impuestos}</p>
                  <p className="font-bold">Total: ${viewingFactura.total}</p>
                </div>
              </div>
              
              {viewingFactura.notas && (
                <div>
                  <strong>Notas:</strong>
                  <p className="text-gray-600">{viewingFactura.notas}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Facturas;
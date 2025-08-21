import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Eye, Printer, FileText, Mail, MessageCircle, Download, Send, Check, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Presupuestos = ({ searchTerm }) => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingPresupuesto, setViewingPresupuesto] = useState(null);
  
  // Filtros específicos
  const [filtros, setFiltros] = useState({
    busqueda: "",
    estado: "todos" // todos, borrador, enviado, aceptado, rechazado, convertido, vencido
  });

  const [formData, setFormData] = useState({
    // Datos del presupuesto
    numero_presupuesto: "",
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_vencimiento: "",
    validez_dias: 30,
    
    // Cliente
    cliente_id: "",
    condicion_iva: "Responsable Inscripto",
    contacto_nombre: "",
    contacto_telefono: "",
    
    // Items
    items: [{ articulo_id: "", descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0 }],
    
    // Totales
    porcentaje_iva: "21",
    impuestos: 0,
    
    // Notas y condiciones
    notas: "",
    condiciones: ""
  });

  useEffect(() => {
    fetchPresupuestos();
    fetchClientes();
    fetchArticulos();
  }, []);

  const fetchPresupuestos = async () => {
    try {
      const response = await axios.get(`${API}/presupuestos`);
      setPresupuestos(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching presupuestos:", error);
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

  const fetchArticulos = async () => {
    try {
      const response = await axios.get(`${API}/articulos`);
      setArticulos(response.data);
    } catch (error) {
      console.error("Error fetching articulos:", error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const presupuestoData = { 
        ...formData,
        impuestos: impuestosCalculados
      };
      if (!presupuestoData.numero_presupuesto) {
        presupuestoData.numero_presupuesto = `PRES-${Date.now()}`;
      }

      await axios.post(`${API}/presupuestos`, presupuestoData);
      
      setDialogOpen(false);
      setFormData({
        numero_presupuesto: "",
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: "",
        validez_dias: 30,
        cliente_id: "",
        condicion_iva: "Responsable Inscripto",
        contacto_nombre: "",
        contacto_telefono: "",
        items: [{ articulo_id: "", descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0 }],
        porcentaje_iva: "21",
        impuestos: 0,
        notas: "",
        condiciones: ""
      });
      fetchPresupuestos();
    } catch (error) {
      console.error("Error saving presupuesto:", error);
    }
  };

  const updateEstado = async (presupuestoId, nuevoEstado) => {
    try {
      await axios.put(`${API}/presupuestos/${presupuestoId}/estado`, null, {
        params: { estado: nuevoEstado }
      });
      fetchPresupuestos();
    } catch (error) {
      console.error("Error updating estado:", error);
    }
  };

  const deletePresupuesto = async (presupuestoId) => {
    if (window.confirm("¿Está seguro de que desea eliminar este presupuesto?")) {
      try {
        await axios.delete(`${API}/presupuestos/${presupuestoId}`);
        fetchPresupuestos();
      } catch (error) {
        console.error("Error deleting presupuesto:", error);
      }
    }
  };

  const getEstadoBadge = (estado, fechaVencimiento) => {
    const now = new Date();
    const vencimiento = new Date(fechaVencimiento);
    
    if (estado === 'convertido') {
      return <Badge variant="outline" className="bg-green-50 text-green-700">Convertido</Badge>;
    } else if (estado === 'aceptado') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700">Aceptado</Badge>;
    } else if (estado === 'rechazado') {
      return <Badge variant="destructive">Rechazado</Badge>;
    } else if (now > vencimiento && estado !== 'convertido' && estado !== 'aceptado') {
      return <Badge variant="destructive">Vencido</Badge>;
    } else if (estado === 'enviado') {
      return <Badge variant="secondary">Enviado</Badge>;
    } else {
      return <Badge variant="default">Borrador</Badge>;
    }
  };

  // Función para obtener el estado real del presupuesto
  const getPresupuestoEstado = (presupuesto) => {
    const now = new Date();
    const vencimiento = new Date(presupuesto.fecha_vencimiento);
    
    if (presupuesto.estado === 'convertido') {
      return 'convertido';
    } else if (presupuesto.estado === 'aceptado') {
      return 'aceptado';
    } else if (presupuesto.estado === 'rechazado') {
      return 'rechazado';
    } else if (now > vencimiento && presupuesto.estado !== 'convertido' && presupuesto.estado !== 'aceptado') {
      return 'vencido';
    } else if (presupuesto.estado === 'enviado') {
      return 'enviado';
    } else {
      return 'borrador';
    }
  };

  // Filtrado
  const filteredPresupuestos = presupuestos.filter(presupuesto => {
    const matchesSearch = !filtros.busqueda || 
      presupuesto.numero_presupuesto?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      presupuesto.cliente_nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const presupuestoEstado = getPresupuestoEstado(presupuesto);
    const matchesEstado = filtros.estado === 'todos' || presupuestoEstado === filtros.estado;
    
    const matchesParentSearch = !searchTerm || 
      presupuesto.numero_presupuesto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      presupuesto.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch && matchesEstado && matchesParentSearch;
  });

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      estado: "todos"
    });
  };

  // Funciones para acciones
  const handlePrint = (presupuesto) => {
    console.log("Imprimir presupuesto:", presupuesto.numero_presupuesto);
  };

  const handleDownloadPDF = (presupuesto) => {
    console.log("Descargar PDF:", presupuesto.numero_presupuesto);
  };

  const handleSendEmail = (presupuesto) => {
    console.log("Enviar email:", presupuesto.numero_presupuesto);
  };

  const handleSendWhatsApp = (presupuesto) => {
    console.log("Enviar WhatsApp:", presupuesto.numero_presupuesto);
  };

  const handleEdit = (presupuesto) => {
    setFormData({
      numero_presupuesto: presupuesto.numero_presupuesto,
      fecha_emision: new Date(presupuesto.fecha_emision).toISOString().split('T')[0],
      fecha_vencimiento: new Date(presupuesto.fecha_vencimiento).toISOString().split('T')[0],
      validez_dias: presupuesto.validez_dias || 30,
      cliente_id: presupuesto.cliente_id,
      condicion_iva: presupuesto.condicion_iva || "Responsable Inscripto",
      contacto_nombre: presupuesto.contacto_nombre || "",
      contacto_telefono: presupuesto.contacto_telefono || "",
      items: presupuesto.items,
      porcentaje_iva: "21",
      impuestos: presupuesto.impuestos,
      notas: presupuesto.notas,
      condiciones: presupuesto.condiciones || ""
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-lg">Cargando presupuestos...</div>
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
                placeholder="Buscar por cliente o número de presupuesto..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
              />
            </div>
            
            {/* Filtros de estado */}
            <Button 
              variant={filtros.estado === 'borrador' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltros({...filtros, estado: 'borrador'})}
            >
              Borrador
            </Button>
            
            <Button 
              variant={filtros.estado === 'enviado' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltros({...filtros, estado: 'enviado'})}
              className="text-blue-700"
            >
              Enviado
            </Button>
            
            <Button 
              variant={filtros.estado === 'aceptado' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltros({...filtros, estado: 'aceptado'})}
              className="text-green-700"
            >
              Aceptado
            </Button>
            
            <Button 
              variant={filtros.estado === 'vencido' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltros({...filtros, estado: 'vencido'})}
              className="text-red-700"
            >
              Vencidos
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
            Nuevo Presupuesto
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Presupuesto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* BLOQUE 1: DATOS DEL PRESUPUESTO */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos del Presupuesto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="numero_presupuesto">N° de Presupuesto</Label>
                    <Input
                      id="numero_presupuesto"
                      value={formData.numero_presupuesto}
                      onChange={(e) => setFormData({...formData, numero_presupuesto: e.target.value})}
                      placeholder="Se generará automáticamente"
                    />
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
                  
                  <div>
                    <Label htmlFor="validez_dias">Validez (días)</Label>
                    <Input
                      id="validez_dias"
                      type="number"
                      value={formData.validez_dias}
                      onChange={(e) => setFormData({...formData, validez_dias: parseInt(e.target.value)})}
                      min="1"
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
                    <div key={index} className="grid grid-cols-14 gap-2 p-3 border rounded-lg">
                      <div className="col-span-4">
                        <Label className="text-xs">Tipo de Producto *</Label>
                        <Select 
                          value={item.articulo_id} 
                          onValueChange={(value) => handleItemChange(index, 'articulo_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {articulos.filter(a => a.activo).map((articulo) => (
                              <SelectItem key={articulo.id} value={articulo.id}>
                                {articulo.codigo ? `${articulo.codigo} - ` : ''}{articulo.nombre} - ${articulo.precio}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-4">
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
                      <div className="col-span-1">
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
                      <Label htmlFor="porcentaje_iva">Porcentaje de IVA</Label>
                      <Select 
                        value={formData.porcentaje_iva} 
                        onValueChange={(value) => setFormData({...formData, porcentaje_iva: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="21">21% (General)</SelectItem>
                          <SelectItem value="10.5">10.5% (Reducido)</SelectItem>
                          <SelectItem value="0">0% (Exento)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>IVA Calculado</Label>
                      <Input
                        value={`$${impuestosCalculados.toFixed(2)}`}
                        readOnly
                        className="bg-gray-50 font-medium"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center text-lg">
                      <span>Subtotal:</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span>IVA ({formData.porcentaje_iva}%):</span>
                      <span className="font-medium">${impuestosCalculados.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold text-blue-700 mt-2 pt-2 border-t border-blue-200">
                      <span>TOTAL PRESUPUESTO:</span>
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
                    placeholder="Notas adicionales para el presupuesto..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="condiciones">Condiciones</Label>
                  <textarea
                    id="condiciones"
                    value={formData.condiciones}
                    onChange={(e) => setFormData({...formData, condiciones: e.target.value})}
                    className="w-full min-h-20 p-3 border border-gray-300 rounded-md"
                    placeholder="Términos y condiciones del presupuesto..."
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Botones de acción */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Crear Presupuesto
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

      {/* Presupuestos Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">N° de Presupuesto</th>
                  <th className="text-left p-4 font-medium text-gray-700">Cliente</th>
                  <th className="text-left p-4 font-medium text-gray-700">Fecha</th>
                  <th className="text-right p-4 font-medium text-gray-700">Monto</th>
                  <th className="text-center p-4 font-medium text-gray-700">Estado</th>
                  <th className="text-center p-4 font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPresupuestos.map((presupuesto, index) => (
                  <tr key={presupuesto.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{presupuesto.numero_presupuesto}</p>
                        <p className="text-sm text-gray-500">
                          Emisión: {new Date(presupuesto.fecha_emision).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{presupuesto.cliente_nombre}</p>
                        <p className="text-sm text-gray-500">
                          Vence: {new Date(presupuesto.fecha_vencimiento).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(presupuesto.fecha_emision).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div>
                        <p className="font-bold text-gray-900">${presupuesto.total.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">IVA inc.</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {getEstadoBadge(presupuesto.estado, presupuesto.fecha_vencimiento)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setViewingPresupuesto(presupuesto);
                            setViewDialogOpen(true);
                          }}
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(presupuesto)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePresupuesto(presupuesto.id)}
                          title="Eliminar"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrint(presupuesto)}
                          title="Imprimir"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPDF(presupuesto)}
                          title="Descargar PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendEmail(presupuesto)}
                          title="Enviar por Email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendWhatsApp(presupuesto)}
                          title="Enviar por WhatsApp"
                          className="text-green-600"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>

                        {/* Botones específicos de presupuesto */}
                        {presupuesto.estado === 'borrador' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateEstado(presupuesto.id, 'enviado')}
                            title="Enviar"
                            className="text-blue-600"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {presupuesto.estado === 'enviado' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateEstado(presupuesto.id, 'aceptado')}
                              title="Aceptar"
                              className="text-green-600"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateEstado(presupuesto.id, 'rechazado')}
                              title="Rechazar"
                              className="text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredPresupuestos.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {filtros.busqueda || filtros.estado !== "todos" ? "No se encontraron presupuestos con ese criterio" : "No hay presupuestos registrados"}
          </p>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Presupuesto</DialogTitle>
          </DialogHeader>
          {viewingPresupuesto && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Número:</strong> {viewingPresupuesto.numero_presupuesto}</p>
                <p><strong>Cliente:</strong> {viewingPresupuesto.cliente_nombre}</p>
                <p><strong>Estado:</strong> {getEstadoBadge(viewingPresupuesto.estado, viewingPresupuesto.fecha_vencimiento)}</p>
                <p><strong>Total:</strong> ${viewingPresupuesto.total.toLocaleString()}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Items:</h4>
                <div className="space-y-2">
                  {viewingPresupuesto.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <p><strong>{item.descripcion}</strong></p>
                      <p>Cantidad: {item.cantidad} × ${item.precio_unitario} = ${item.subtotal}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 p-3 bg-blue-50 rounded">
                  <p>Subtotal: ${viewingPresupuesto.subtotal}</p>
                  <p>Impuestos: ${viewingPresupuesto.impuestos}</p>
                  <p className="font-bold">Total: ${viewingPresupuesto.total}</p>
                </div>
              </div>
              
              {viewingPresupuesto.notas && (
                <div>
                  <strong>Notas:</strong>
                  <p className="text-gray-600">{viewingPresupuesto.notas}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Presupuestos;
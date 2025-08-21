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
      {/* Quick Create Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Presupuesto
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Presupuesto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero_presupuesto">Número de Presupuesto</Label>
                <Input
                  id="numero_presupuesto"
                  value={formData.numero_presupuesto}
                  onChange={(e) => setFormData({...formData, numero_presupuesto: e.target.value})}
                  placeholder="Se generará automáticamente"
                />
              </div>
              
              <div>
                <Label htmlFor="cliente_id">Cliente *</Label>
                <Select value={formData.cliente_id} onValueChange={(value) => setFormData({...formData, cliente_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            {/* Items */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Items del Presupuesto *</Label>
                <Button type="button" onClick={addItem} size="sm">
                  Agregar Item
                </Button>
              </div>
              
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2 p-3 border rounded">
                  <div className="col-span-5">
                    <Input
                      placeholder="Descripción"
                      value={item.descripcion}
                      onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Cantidad"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Precio"
                      value={item.precio_unitario}
                      onChange={(e) => handleItemChange(index, 'precio_unitario', e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Subtotal"
                      value={item.subtotal.toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="space-y-2 mt-4 p-3 bg-gray-50 rounded">
                <div>
                  <Label htmlFor="impuestos">Impuestos/IVA</Label>
                  <Input
                    id="impuestos"
                    type="number"
                    value={formData.impuestos}
                    onChange={(e) => setFormData({...formData, impuestos: e.target.value})}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="text-right">
                  <p>Subtotal: ${subtotal.toFixed(2)}</p>
                  <p>Impuestos: ${parseFloat(formData.impuestos || 0).toFixed(2)}</p>
                  <p className="text-lg font-bold">Total: ${total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notas">Notas</Label>
              <Input
                id="notas"
                value={formData.notas}
                onChange={(e) => setFormData({...formData, notas: e.target.value})}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
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

      {/* Presupuestos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPresupuestos.map((presupuesto) => (
          <Card key={presupuesto.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{presupuesto.numero_presupuesto}</CardTitle>
                  <p className="text-sm text-gray-600">{presupuesto.cliente_nombre}</p>
                </div>
                {getEstadoBadge(presupuesto.estado, presupuesto.fecha_vencimiento)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Total:</strong> ${presupuesto.total.toLocaleString()}</p>
                <p><strong>Emisión:</strong> {new Date(presupuesto.fecha_emision).toLocaleDateString()}</p>
                <p><strong>Vencimiento:</strong> {new Date(presupuesto.fecha_vencimiento).toLocaleDateString()}</p>
                <p><strong>Validez:</strong> {presupuesto.validez_dias} días</p>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewingPresupuesto(presupuesto);
                    setViewDialogOpen(true);
                  }}
                  className="flex-1"
                >
                  <Eye className="mr-1 h-3 w-3" />
                  Ver
                </Button>
                
                {presupuesto.estado === 'borrador' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateEstado(presupuesto.id, 'enviado')}
                    className="px-2"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                )}
                
                {presupuesto.estado === 'enviado' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateEstado(presupuesto.id, 'aceptado')}
                      className="px-2"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateEstado(presupuesto.id, 'rechazado')}
                      className="px-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPresupuestos.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? "No se encontraron presupuestos con ese criterio" : "No hay presupuestos registrados"}
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
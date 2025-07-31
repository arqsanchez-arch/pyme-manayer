import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Eye, CreditCard, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Facturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingFactura, setViewingFactura] = useState(null);
  const [formData, setFormData] = useState({
    numero_factura: "",
    cliente_id: "",
    pedido_id: "",
    items: [{ descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0 }],
    impuestos: 0,
    fecha_vencimiento: "",
    notas: ""
  });

  useEffect(() => {
    fetchFacturas();
    fetchClientes();
    fetchPedidos();
  }, []);

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

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
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
      items: [...formData.items, { descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0 }]
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
        cliente_id: "",
        pedido_id: "",
        items: [{ descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0 }],
        impuestos: 0,
        fecha_vencimiento: "",
        notas: ""
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

  const getEstadoBadge = (estado, fechaVencimiento) => {
    const now = new Date();
    const vencimiento = new Date(fechaVencimiento);
    
    if (estado === 'pagada') {
      return <Badge variant="outline" className="bg-green-50 text-green-700">Pagada</Badge>;
    } else if (now > vencimiento) {
      return <Badge variant="destructive">Vencida</Badge>;
    } else {
      return <Badge variant="default">Pendiente</Badge>;
    }
  };

  const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal + parseFloat(formData.impuestos || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando facturas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-600">Gestión de facturas y facturación</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Factura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Factura</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero_factura">Número de Factura</Label>
                  <Input
                    id="numero_factura"
                    value={formData.numero_factura}
                    onChange={(e) => setFormData({...formData, numero_factura: e.target.value})}
                    placeholder="Se generará automáticamente si se deja vacío"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pedido_id">Basado en Pedido (Opcional)</Label>
                  <Select value={formData.pedido_id} onValueChange={loadPedidoItems}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar pedido" />
                    </SelectTrigger>
                    <SelectContent>
                      {pedidos.map((pedido) => (
                        <SelectItem key={pedido.id} value={pedido.id}>
                          {pedido.numero_pedido} - {pedido.cliente_nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              {/* Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Items de la Factura *</Label>
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
      </div>

      {/* Facturas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facturas.map((factura) => (
          <Card key={factura.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{factura.numero_factura}</CardTitle>
                  <p className="text-sm text-gray-600">{factura.cliente_nombre}</p>
                </div>
                {getEstadoBadge(factura.estado, factura.fecha_vencimiento)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Total:</strong> ${factura.total.toLocaleString()}</p>
                <p><strong>Emisión:</strong> {new Date(factura.fecha_emision).toLocaleDateString()}</p>
                <p><strong>Vencimiento:</strong> {new Date(factura.fecha_vencimiento).toLocaleDateString()}</p>
                {factura.fecha_pago && (
                  <p><strong>Pagada:</strong> {new Date(factura.fecha_pago).toLocaleDateString()}</p>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewingFactura(factura);
                    setViewDialogOpen(true);
                  }}
                  className="flex-1"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver
                </Button>
                
                {factura.estado === 'pendiente' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => marcarPagada(factura.id)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CreditCard className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {facturas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay facturas registradas</p>
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
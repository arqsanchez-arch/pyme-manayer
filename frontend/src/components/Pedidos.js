import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Eye, Package } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingPedido, setViewingPedido] = useState(null);
  const [formData, setFormData] = useState({
    numero_pedido: "",
    cliente_id: "",
    items: [{ descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0 }],
    fecha_entrega: "",
    notas: ""
  });

  useEffect(() => {
    fetchPedidos();
    fetchClientes();
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await axios.get(`${API}/pedidos`);
      setPedidos(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pedidos:", error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate automatic order number if empty
      const orderData = { ...formData };
      if (!orderData.numero_pedido) {
        orderData.numero_pedido = `PED-${Date.now()}`;
      }

      await axios.post(`${API}/pedidos`, orderData);
      
      setDialogOpen(false);
      setFormData({
        numero_pedido: "",
        cliente_id: "",
        items: [{ descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0 }],
        fecha_entrega: "",
        notas: ""
      });
      fetchPedidos();
    } catch (error) {
      console.error("Error saving pedido:", error);
    }
  };

  const updateEstado = async (pedidoId, nuevoEstado) => {
    try {
      await axios.put(`${API}/pedidos/${pedidoId}/estado`, null, {
        params: { estado: nuevoEstado }
      });
      fetchPedidos();
    } catch (error) {
      console.error("Error updating estado:", error);
    }
  };

  const getEstadoBadge = (estado) => {
    const variants = {
      'pendiente': 'default',
      'en_proceso': 'secondary',
      'completado': 'outline',
      'cancelado': 'destructive'
    };
    
    const labels = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En Proceso',
      'completado': 'Completado',
      'cancelado': 'Cancelado'
    };

    return (
      <Badge variant={variants[estado] || 'default'}>
        {labels[estado] || estado}
      </Badge>
    );
  };

  const totalPedido = formData.items.reduce((sum, item) => sum + item.subtotal, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando pedidos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600">Gestión de pedidos y órdenes</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo Pedido</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero_pedido">Número de Pedido</Label>
                  <Input
                    id="numero_pedido"
                    value={formData.numero_pedido}
                    onChange={(e) => setFormData({...formData, numero_pedido: e.target.value})}
                    placeholder="Se generará automáticamente si se deja vacío"
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

              <div>
                <Label htmlFor="fecha_entrega">Fecha de Entrega</Label>
                <Input
                  id="fecha_entrega"
                  type="datetime-local"
                  value={formData.fecha_entrega}
                  onChange={(e) => setFormData({...formData, fecha_entrega: e.target.value})}
                />
              </div>

              {/* Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Items del Pedido *</Label>
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
                
                <div className="text-right text-lg font-bold">
                  Total: ${totalPedido.toFixed(2)}
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
                  Crear Pedido
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

      {/* Pedidos List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pedidos.map((pedido) => (
          <Card key={pedido.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{pedido.numero_pedido}</CardTitle>
                  <p className="text-sm text-gray-600">{pedido.cliente_nombre}</p>
                </div>
                {getEstadoBadge(pedido.estado)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Total:</strong> ${pedido.total.toLocaleString()}</p>
                <p><strong>Items:</strong> {pedido.items.length}</p>
                <p><strong>Fecha:</strong> {new Date(pedido.fecha_pedido).toLocaleDateString()}</p>
                {pedido.fecha_entrega && (
                  <p><strong>Entrega:</strong> {new Date(pedido.fecha_entrega).toLocaleDateString()}</p>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewingPedido(pedido);
                    setViewDialogOpen(true);
                  }}
                  className="flex-1"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver
                </Button>
                
                {pedido.estado === 'pendiente' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateEstado(pedido.id, 'en_proceso')}
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                )}
                
                {pedido.estado === 'en_proceso' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateEstado(pedido.id, 'completado')}
                  >
                    ✓
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pedidos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay pedidos registrados</p>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Pedido</DialogTitle>
          </DialogHeader>
          {viewingPedido && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Número:</strong> {viewingPedido.numero_pedido}</p>
                <p><strong>Cliente:</strong> {viewingPedido.cliente_nombre}</p>
                <p><strong>Estado:</strong> {getEstadoBadge(viewingPedido.estado)}</p>
                <p><strong>Total:</strong> ${viewingPedido.total.toLocaleString()}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Items:</h4>
                <div className="space-y-2">
                  {viewingPedido.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <p><strong>{item.descripcion}</strong></p>
                      <p>Cantidad: {item.cantidad} × ${item.precio_unitario} = ${item.subtotal}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {viewingPedido.notas && (
                <div>
                  <strong>Notas:</strong>
                  <p className="text-gray-600">{viewingPedido.notas}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pedidos;
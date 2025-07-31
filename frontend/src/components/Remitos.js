import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Eye, Truck, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Remitos = () => {
  const [remitos, setRemitos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingRemito, setViewingRemito] = useState(null);
  const [formData, setFormData] = useState({
    numero_remito: "",
    pedido_id: "",
    factura_id: "",
    cliente_id: "",
    items: [],
    transportista: "",
    fecha_entrega: "",
    notas: ""
  });

  useEffect(() => {
    fetchRemitos();
    fetchPedidos();
    fetchFacturas();
  }, []);

  const fetchRemitos = async () => {
    try {
      const response = await axios.get(`${API}/remitos`);
      setRemitos(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching remitos:", error);
      setLoading(false);
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

  const fetchFacturas = async () => {
    try {
      const response = await axios.get(`${API}/facturas`);
      setFacturas(response.data);
    } catch (error) {
      console.error("Error fetching facturas:", error);
    }
  };

  const loadPedidoData = (pedidoId) => {
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
      const remitoData = { ...formData };
      if (!remitoData.numero_remito) {
        remitoData.numero_remito = `REM-${Date.now()}`;
      }

      await axios.post(`${API}/remitos`, remitoData);
      
      setDialogOpen(false);
      setFormData({
        numero_remito: "",
        pedido_id: "",
        factura_id: "",
        cliente_id: "",
        items: [],
        transportista: "",
        fecha_entrega: "",
        notas: ""
      });
      fetchRemitos();
    } catch (error) {
      console.error("Error saving remito:", error);
    }
  };

  const updateEstado = async (remitoId, nuevoEstado) => {
    try {
      await axios.put(`${API}/remitos/${remitoId}/estado`, null, {
        params: { estado: nuevoEstado }
      });
      fetchRemitos();
    } catch (error) {
      console.error("Error updating estado:", error);
    }
  };

  const getEstadoBadge = (estado) => {
    const variants = {
      'pendiente': 'default',
      'en_transito': 'secondary',
      'entregado': 'outline'
    };
    
    const labels = {
      'pendiente': 'Pendiente',
      'en_transito': 'En Tránsito',
      'entregado': 'Entregado'
    };

    return (
      <Badge variant={variants[estado] || 'default'}>
        {labels[estado] || estado}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando remitos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Remitos</h1>
          <p className="text-gray-600">Gestión de remitos y entregas</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Remito
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo Remito</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero_remito">Número de Remito</Label>
                  <Input
                    id="numero_remito"
                    value={formData.numero_remito}
                    onChange={(e) => setFormData({...formData, numero_remito: e.target.value})}
                    placeholder="Se generará automáticamente"
                  />
                </div>
                
                <div>
                  <Label htmlFor="transportista">Transportista</Label>
                  <Input
                    id="transportista"
                    value={formData.transportista}
                    onChange={(e) => setFormData({...formData, transportista: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pedido_id">Pedido *</Label>
                  <Select value={formData.pedido_id} onValueChange={loadPedidoData}>
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
                  <Label htmlFor="factura_id">Factura (Opcional)</Label>
                  <Select value={formData.factura_id} onValueChange={(value) => setFormData({...formData, factura_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar factura" />
                    </SelectTrigger>
                    <SelectContent>
                      {facturas.filter(f => f.cliente_id === formData.cliente_id).map((factura) => (
                        <SelectItem key={factura.id} value={factura.id}>
                          {factura.numero_factura}
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

              {/* Items Preview */}
              {formData.items.length > 0 && (
                <div>
                  <Label>Items del Remito:</Label>
                  <div className="space-y-2 mt-2">
                    {formData.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p><strong>{item.descripcion}</strong></p>
                        <p>Cantidad: {item.cantidad} × ${item.precio_unitario} = ${item.subtotal}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="notas">Notas</Label>
                <Input
                  id="notas"
                  value={formData.notas}
                  onChange={(e) => setFormData({...formData, notas: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={!formData.pedido_id}>
                  Crear Remito
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

      {/* Remitos List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {remitos.map((remito) => (
          <Card key={remito.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{remito.numero_remito}</CardTitle>
                  <p className="text-sm text-gray-600">{remito.cliente_nombre}</p>
                </div>
                {getEstadoBadge(remito.estado)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Emisión:</strong> {new Date(remito.fecha_emision).toLocaleDateString()}</p>
                {remito.fecha_entrega && (
                  <p><strong>Entrega:</strong> {new Date(remito.fecha_entrega).toLocaleDateString()}</p>
                )}
                {remito.transportista && (
                  <p><strong>Transportista:</strong> {remito.transportista}</p>
                )}
                <p><strong>Items:</strong> {remito.items.length}</p>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewingRemito(remito);
                    setViewDialogOpen(true);
                  }}
                  className="flex-1"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver
                </Button>
                
                {remito.estado === 'pendiente' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateEstado(remito.id, 'en_transito')}
                  >
                    <Truck className="h-4 w-4" />
                  </Button>
                )}
                
                {remito.estado === 'en_transito' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateEstado(remito.id, 'entregado')}
                    className="text-green-600 hover:text-green-700"
                  >
                    ✓
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {remitos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay remitos registrados</p>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Remito</DialogTitle>
          </DialogHeader>
          {viewingRemito && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Número:</strong> {viewingRemito.numero_remito}</p>
                <p><strong>Cliente:</strong> {viewingRemito.cliente_nombre}</p>
                <p><strong>Estado:</strong> {getEstadoBadge(viewingRemito.estado)}</p>
                {viewingRemito.transportista && (
                  <p><strong>Transportista:</strong> {viewingRemito.transportista}</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Items:</h4>
                <div className="space-y-2">
                  {viewingRemito.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <p><strong>{item.descripcion}</strong></p>
                      <p>Cantidad: {item.cantidad} × ${item.precio_unitario} = ${item.subtotal}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {viewingRemito.notas && (
                <div>
                  <strong>Notas:</strong>
                  <p className="text-gray-600">{viewingRemito.notas}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Remitos;
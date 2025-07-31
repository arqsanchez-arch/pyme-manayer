import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Eye, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingCompra, setViewingCompra] = useState(null);
  const [formData, setFormData] = useState({
    numero_compra: "",
    proveedor: "",
    categoria: "general",
    items: [{ descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0 }],
    impuestos: 0,
    fecha_pago: "",
    estado_pago: "pendiente",
    notas: ""
  });

  useEffect(() => {
    fetchCompras();
  }, []);

  const fetchCompras = async () => {
    try {
      const response = await axios.get(`${API}/compras`);
      setCompras(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching compras:", error);
      setLoading(false);
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
      const compraData = { ...formData };
      if (!compraData.numero_compra) {
        compraData.numero_compra = `COM-${Date.now()}`;
      }

      await axios.post(`${API}/compras`, compraData);
      
      setDialogOpen(false);
      setFormData({
        numero_compra: "",
        proveedor: "",
        categoria: "general",
        items: [{ descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0 }],
        impuestos: 0,
        fecha_pago: "",
        estado_pago: "pendiente",
        notas: ""
      });
      fetchCompras();
    } catch (error) {
      console.error("Error saving compra:", error);
    }
  };

  const getCategoriaBadge = (categoria) => {
    const variants = {
      'general': 'default',
      'materiales': 'secondary',
      'servicios': 'outline',
      'gastos': 'destructive'
    };
    
    const labels = {
      'general': 'General',
      'materiales': 'Materiales',
      'servicios': 'Servicios',
      'gastos': 'Gastos'
    };

    return (
      <Badge variant={variants[categoria] || 'default'}>
        {labels[categoria] || categoria}
      </Badge>
    );
  };

  const getEstadoPagoBadge = (estado) => {
    return estado === 'pagado' 
      ? <Badge variant="outline" className="bg-green-50 text-green-700">Pagado</Badge>
      : <Badge variant="default">Pendiente</Badge>;
  };

  const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal + parseFloat(formData.impuestos || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando compras...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compras y Gastos</h1>
          <p className="text-gray-600">Gestión de compras, gastos y proveedores</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Compra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Compra/Gasto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="numero_compra">Número de Compra</Label>
                  <Input
                    id="numero_compra"
                    value={formData.numero_compra}
                    onChange={(e) => setFormData({...formData, numero_compra: e.target.value})}
                    placeholder="Se generará automáticamente"
                  />
                </div>
                
                <div>
                  <Label htmlFor="proveedor">Proveedor *</Label>
                  <Input
                    id="proveedor"
                    value={formData.proveedor}
                    onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="materiales">Materiales</SelectItem>
                      <SelectItem value="servicios">Servicios</SelectItem>
                      <SelectItem value="gastos">Gastos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha_pago">Fecha de Pago</Label>
                  <Input
                    id="fecha_pago"
                    type="date"
                    value={formData.fecha_pago}
                    onChange={(e) => setFormData({...formData, fecha_pago: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="estado_pago">Estado de Pago</Label>
                  <Select value={formData.estado_pago} onValueChange={(value) => setFormData({...formData, estado_pago: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="pagado">Pagado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Items de la Compra *</Label>
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
                  Registrar Compra
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

      {/* Compras List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {compras.map((compra) => (
          <Card key={compra.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{compra.numero_compra}</CardTitle>
                  <p className="text-sm text-gray-600">{compra.proveedor}</p>
                </div>
                <div className="space-y-1">
                  {getCategoriaBadge(compra.categoria)}
                  {getEstadoPagoBadge(compra.estado_pago)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Total:</strong> ${compra.total.toLocaleString()}</p>
                <p><strong>Fecha:</strong> {new Date(compra.fecha_compra).toLocaleDateString()}</p>
                {compra.fecha_pago && (
                  <p><strong>Pagado:</strong> {new Date(compra.fecha_pago).toLocaleDateString()}</p>
                )}
                <p><strong>Items:</strong> {compra.items.length}</p>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewingCompra(compra);
                    setViewDialogOpen(true);
                  }}
                  className="flex-1"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalle
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {compras.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay compras registradas</p>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de la Compra</DialogTitle>
          </DialogHeader>
          {viewingCompra && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Número:</strong> {viewingCompra.numero_compra}</p>
                <p><strong>Proveedor:</strong> {viewingCompra.proveedor}</p>
                <p><strong>Categoría:</strong> {getCategoriaBadge(viewingCompra.categoria)}</p>
                <p><strong>Estado:</strong> {getEstadoPagoBadge(viewingCompra.estado_pago)}</p>
                <p><strong>Total:</strong> ${viewingCompra.total.toLocaleString()}</p>
                <p><strong>Fecha:</strong> {new Date(viewingCompra.fecha_compra).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Items:</h4>
                <div className="space-y-2">
                  {viewingCompra.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <p><strong>{item.descripcion}</strong></p>
                      <p>Cantidad: {item.cantidad} × ${item.precio_unitario} = ${item.subtotal}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 p-3 bg-red-50 rounded">
                  <p>Subtotal: ${viewingCompra.subtotal}</p>
                  <p>Impuestos: ${viewingCompra.impuestos}</p>
                  <p className="font-bold">Total: ${viewingCompra.total}</p>
                </div>
              </div>
              
              {viewingCompra.notas && (
                <div>
                  <strong>Notas:</strong>
                  <p className="text-gray-600">{viewingCompra.notas}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Compras;
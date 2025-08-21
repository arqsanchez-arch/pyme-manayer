import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Eye, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NotasDebito = ({ searchTerm }) => {
  const [notasDebito, setNotasDebito] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingNota, setViewingNota] = useState(null);
  const [formData, setFormData] = useState({
    numero_nota: "",
    factura_id: "",
    cliente_id: "",
    motivo: "",
    items: [{ descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0 }],
    impuestos: 0,
    notas: ""
  });

  useEffect(() => {
    fetchNotasDebito();
    fetchClientes();
    fetchFacturas();
  }, []);

  const fetchNotasDebito = async () => {
    try {
      const response = await axios.get(`${API}/notas-debito`);
      setNotasDebito(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notas debito:", error);
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

  const fetchFacturas = async () => {
    try {
      const response = await axios.get(`${API}/facturas`);
      setFacturas(response.data);
    } catch (error) {
      console.error("Error fetching facturas:", error);
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
      const notaData = { ...formData };
      if (!notaData.numero_nota) {
        notaData.numero_nota = `ND-${Date.now()}`;
      }

      await axios.post(`${API}/notas-debito`, notaData);
      
      setDialogOpen(false);
      setFormData({
        numero_nota: "",
        factura_id: "",
        cliente_id: "",
        motivo: "",
        items: [{ descripcion: "", cantidad: 1, precio_unitario: 0, subtotal: 0 }],
        impuestos: 0,
        notas: ""
      });
      fetchNotasDebito();
    } catch (error) {
      console.error("Error saving nota debito:", error);
    }
  };

  const aplicarNota = async (notaId) => {
    try {
      await axios.put(`${API}/notas-debito/${notaId}/aplicar`);
      fetchNotasDebito();
    } catch (error) {
      console.error("Error aplicando nota:", error);
    }
  };

  const getEstadoBadge = (estado) => {
    return estado === 'aplicada' 
      ? <Badge variant="outline" className="bg-green-50 text-green-700">Aplicada</Badge>
      : <Badge variant="default">Pendiente</Badge>;
  };

  const filteredNotas = notasDebito.filter(nota =>
    nota.numero_nota.toLowerCase().includes(searchTerm?.toLowerCase() || "") ||
    nota.cliente_nombre.toLowerCase().includes(searchTerm?.toLowerCase() || "") ||
    nota.motivo.toLowerCase().includes(searchTerm?.toLowerCase() || "")
  );

  const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal + parseFloat(formData.impuestos || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-lg">Cargando notas de débito...</div>
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
            Nueva Nota de Débito
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Nota de Débito</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero_nota">Número de Nota</Label>
                <Input
                  id="numero_nota"
                  value={formData.numero_nota}
                  onChange={(e) => setFormData({...formData, numero_nota: e.target.value})}
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
                <Label htmlFor="factura_id">Factura Relacionada (Opcional)</Label>
                <Select value={formData.factura_id} onValueChange={(value) => setFormData({...formData, factura_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar factura" />
                  </SelectTrigger>
                  <SelectContent>
                    {facturas.filter(f => f.cliente_id === formData.cliente_id).map((factura) => (
                      <SelectItem key={factura.id} value={factura.id}>
                        {factura.numero_factura} - ${factura.total.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="motivo">Motivo *</Label>
                <Input
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                  placeholder="Ej: Intereses por mora"
                  required
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Items de la Nota de Débito *</Label>
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
              
              <div className="space-y-2 mt-4 p-3 bg-orange-50 rounded">
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
                  <p className="text-lg font-bold text-orange-600">Total: ${total.toFixed(2)}</p>
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
                Crear Nota de Débito
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

      {/* Notas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotas.map((nota) => (
          <Card key={nota.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{nota.numero_nota}</CardTitle>
                  <p className="text-sm text-gray-600">{nota.cliente_nombre}</p>
                </div>
                {getEstadoBadge(nota.estado)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Total:</strong> ${nota.total.toLocaleString()}</p>
                <p><strong>Motivo:</strong> {nota.motivo}</p>
                <p><strong>Fecha:</strong> {new Date(nota.fecha_emision).toLocaleDateDate()}</p>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewingNota(nota);
                    setViewDialogOpen(true);
                  }}
                  className="flex-1"
                >
                  <Eye className="mr-1 h-3 w-3" />
                  Ver
                </Button>
                
                {nota.estado === 'pendiente' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => aplicarNota(nota.id)}
                    className="text-green-600 hover:text-green-700 px-2"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotas.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? "No se encontraron notas de débito con ese criterio" : "No hay notas de débito registradas"}
          </p>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de la Nota de Débito</DialogTitle>
          </DialogHeader>
          {viewingNota && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Número:</strong> {viewingNota.numero_nota}</p>
                <p><strong>Cliente:</strong> {viewingNota.cliente_nombre}</p>
                <p><strong>Estado:</strong> {getEstadoBadge(viewingNota.estado)}</p>
                <p><strong>Total:</strong> ${viewingNota.total.toLocaleString()}</p>
                <p><strong>Motivo:</strong> {viewingNota.motivo}</p>
                <p><strong>Fecha:</strong> {new Date(viewingNota.fecha_emision).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Items:</h4>
                <div className="space-y-2">
                  {viewingNota.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <p><strong>{item.descripcion}</strong></p>
                      <p>Cantidad: {item.cantidad} × ${item.precio_unitario} = ${item.subtotal}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 p-3 bg-orange-50 rounded">
                  <p>Subtotal: ${viewingNota.subtotal}</p>
                  <p>Impuestos: ${viewingNota.impuestos}</p>
                  <p className="font-bold text-orange-600">Total: ${viewingNota.total}</p>
                </div>
              </div>
              
              {viewingNota.notas && (
                <div>
                  <strong>Notas:</strong>
                  <p className="text-gray-600">{viewingNota.notas}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotasDebito;
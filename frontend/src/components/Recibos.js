import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Eye, X as Cancel } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Recibos = ({ searchTerm }) => {
  const [recibos, setRecibos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingRecibo, setViewingRecibo] = useState(null);
  const [formData, setFormData] = useState({
    numero_recibo: "",
    cliente_id: "",
    facturas_aplicadas: [],
    forma_pago: "efectivo",
    monto_total: "",
    observaciones: ""
  });

  useEffect(() => {
    fetchRecibos();
    fetchClientes();
    fetchFacturas();
  }, []);

  const fetchRecibos = async () => {
    try {
      const response = await axios.get(`${API}/recibos`);
      setRecibos(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching recibos:", error);
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
      setFacturas(response.data.filter(f => f.estado === 'pendiente'));
    } catch (error) {
      console.error("Error fetching facturas:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const reciboData = {
        ...formData,
        monto_total: parseFloat(formData.monto_total)
      };
      
      if (!reciboData.numero_recibo) {
        reciboData.numero_recibo = `REC-${Date.now()}`;
      }

      await axios.post(`${API}/recibos`, reciboData);
      
      setDialogOpen(false);
      setFormData({
        numero_recibo: "",
        cliente_id: "",
        facturas_aplicadas: [],
        forma_pago: "efectivo",
        monto_total: "",
        observaciones: ""
      });
      fetchRecibos();
    } catch (error) {
      console.error("Error saving recibo:", error);
    }
  };

  const anularRecibo = async (reciboId) => {
    if (window.confirm("¿Está seguro de que desea anular este recibo?")) {
      try {
        await axios.put(`${API}/recibos/${reciboId}/anular`);
        fetchRecibos();
      } catch (error) {
        console.error("Error anulando recibo:", error);
      }
    }
  };

  const getEstadoBadge = (estado) => {
    return estado === 'anulado' 
      ? <Badge variant="destructive">Anulado</Badge>
      : <Badge variant="outline" className="bg-green-50 text-green-700">Activo</Badge>;
  };

  const getFormaPagoBadge = (formaPago) => {
    const variants = {
      'efectivo': 'default',
      'transferencia': 'secondary',
      'cheque': 'outline',
      'tarjeta': 'destructive'
    };
    
    const labels = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia',
      'cheque': 'Cheque',
      'tarjeta': 'Tarjeta'
    };

    return (
      <Badge variant={variants[formaPago] || 'default'}>
        {labels[formaPago] || formaPago}
      </Badge>
    );
  };

  const handleFacturaCheck = (facturaId, checked) => {
    if (checked) {
      setFormData({
        ...formData,
        facturas_aplicadas: [...formData.facturas_aplicadas, facturaId]
      });
    } else {
      setFormData({
        ...formData,
        facturas_aplicadas: formData.facturas_aplicadas.filter(id => id !== facturaId)
      });
    }
  };

  const clienteFacturas = facturas.filter(f => f.cliente_id === formData.cliente_id);
  const totalFacturasSeleccionadas = clienteFacturas
    .filter(f => formData.facturas_aplicadas.includes(f.id))
    .reduce((sum, f) => sum + f.total, 0);

  const filteredRecibos = recibos.filter(recibo =>
    recibo.numero_recibo.toLowerCase().includes(searchTerm?.toLowerCase() || "") ||
    recibo.cliente_nombre.toLowerCase().includes(searchTerm?.toLowerCase() || "")
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-lg">Cargando recibos...</div>
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
            Nuevo Recibo
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Recibo de Pago</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero_recibo">Número de Recibo</Label>
                <Input
                  id="numero_recibo"
                  value={formData.numero_recibo}
                  onChange={(e) => setFormData({...formData, numero_recibo: e.target.value})}
                  placeholder="Se generará automáticamente"
                />
              </div>
              
              <div>
                <Label htmlFor="cliente_id">Cliente *</Label>
                <Select value={formData.cliente_id} onValueChange={(value) => setFormData({...formData, cliente_id: value, facturas_aplicadas: []})}>
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
                <Label htmlFor="forma_pago">Forma de Pago</Label>
                <Select value={formData.forma_pago} onValueChange={(value) => setFormData({...formData, forma_pago: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="monto_total">Monto Total *</Label>
                <Input
                  id="monto_total"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monto_total}
                  onChange={(e) => setFormData({...formData, monto_total: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Facturas to Apply */}
            {formData.cliente_id && clienteFacturas.length > 0 && (
              <div>
                <Label>Facturas a Aplicar (Opcional)</Label>
                <div className="max-h-48 overflow-y-auto border rounded p-3 space-y-2">
                  {clienteFacturas.map((factura) => (
                    <div key={factura.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`factura-${factura.id}`}
                        checked={formData.facturas_aplicadas.includes(factura.id)}
                        onCheckedChange={(checked) => handleFacturaCheck(factura.id, checked)}
                      />
                      <label htmlFor={`factura-${factura.id}`} className="flex-1 text-sm">
                        <span className="font-medium">{factura.numero_factura}</span> - ${factura.total.toLocaleString()}
                        <span className="text-gray-500 ml-2">
                          (Vence: {new Date(factura.fecha_vencimiento).toLocaleDateString()})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
                {totalFacturasSeleccionadas > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Total seleccionado: ${totalFacturasSeleccionadas.toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="observaciones">Observaciones</Label>
              <Input
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                placeholder="Observaciones del pago"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Crear Recibo
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

      {/* Recibos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecibos.map((recibo) => (
          <Card key={recibo.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{recibo.numero_recibo}</CardTitle>
                  <p className="text-sm text-gray-600">{recibo.cliente_nombre}</p>
                </div>
                <div className="space-y-1">
                  {getEstadoBadge(recibo.estado)}
                  {getFormaPagoBadge(recibo.forma_pago)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Monto:</strong> ${recibo.monto_total.toLocaleString()}</p>
                <p><strong>Fecha:</strong> {new Date(recibo.fecha_pago).toLocaleDateString()}</p>
                {recibo.facturas_aplicadas.length > 0 && (
                  <p><strong>Facturas:</strong> {recibo.facturas_aplicadas.length} aplicadas</p>
                )}
                {recibo.observaciones && (
                  <p><strong>Obs:</strong> {recibo.observaciones.substring(0, 30)}{recibo.observaciones.length > 30 ? '...' : ''}</p>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewingRecibo(recibo);
                    setViewDialogOpen(true);
                  }}
                  className="flex-1"
                >
                  <Eye className="mr-1 h-3 w-3" />
                  Ver
                </Button>
                
                {recibo.estado === 'activo' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => anularRecibo(recibo.id)}
                    className="text-red-600 hover:text-red-700 px-2"
                  >
                    <Cancel className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecibos.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? "No se encontraron recibos con ese criterio" : "No hay recibos registrados"}
          </p>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Recibo</DialogTitle>
          </DialogHeader>
          {viewingRecibo && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Número:</strong> {viewingRecibo.numero_recibo}</p>
                <p><strong>Cliente:</strong> {viewingRecibo.cliente_nombre}</p>
                <p><strong>Estado:</strong> {getEstadoBadge(viewingRecibo.estado)}</p>
                <p><strong>Forma de Pago:</strong> {getFormaPagoBadge(viewingRecibo.forma_pago)}</p>
                <p><strong>Monto:</strong> ${viewingRecibo.monto_total.toLocaleString()}</p>
                <p><strong>Fecha:</strong> {new Date(viewingRecibo.fecha_pago).toLocaleDateString()}</p>
              </div>
              
              {viewingRecibo.facturas_aplicadas.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Facturas Aplicadas:</h4>
                  <div className="space-y-1">
                    {viewingRecibo.facturas_aplicadas.map((facturaId, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        Factura ID: {facturaId}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              
              {viewingRecibo.observaciones && (
                <div>
                  <strong>Observaciones:</strong>
                  <p className="text-gray-600">{viewingRecibo.observaciones}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Recibos;
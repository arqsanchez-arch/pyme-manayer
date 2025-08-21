import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CuentasCorrientes = ({ searchTerm }) => {
  const [cuentasCorrientes, setCuentasCorrientes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingCuenta, setViewingCuenta] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState("");

  useEffect(() => {
    fetchCuentasCorrientes();
    fetchClientes();
  }, []);

  const fetchCuentasCorrientes = async () => {
    try {
      const response = await axios.get(`${API}/cuentas-corrientes`);
      setCuentasCorrientes(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cuentas corrientes:", error);
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

  const fetchCuentaCliente = async (clienteId) => {
    try {
      const response = await axios.get(`${API}/cuentas-corrientes/${clienteId}`);
      setViewingCuenta(response.data);
      setViewDialogOpen(true);
    } catch (error) {
      console.error("Error fetching cuenta corriente:", error);
    }
  };

  const getSaldoBadge = (saldo) => {
    if (saldo > 0) {
      return <Badge variant="outline" className="bg-green-50 text-green-700">A Favor</Badge>;
    } else if (saldo < 0) {
      return <Badge variant="destructive">Deudor</Badge>;
    } else {
      return <Badge variant="secondary">Sin Saldo</Badge>;
    }
  };

  const getTipoMovimientoBadge = (tipo) => {
    const variants = {
      'factura': 'destructive',
      'pago': 'outline',
      'nota_credito': 'secondary',
      'nota_debito': 'default'
    };
    
    const labels = {
      'factura': 'Factura',
      'pago': 'Pago',
      'nota_credito': 'N. Crédito',
      'nota_debito': 'N. Débito'
    };

    return (
      <Badge variant={variants[tipo] || 'default'}>
        {labels[tipo] || tipo}
      </Badge>
    );
  };

  const filteredCuentas = cuentasCorrientes.filter(cuenta =>
    cuenta.cliente_nombre.toLowerCase().includes(searchTerm?.toLowerCase() || "")
  );

  // Statistics
  const totalCuentas = filteredCuentas.length;
  const cuentasDeudoras = filteredCuentas.filter(c => c.saldo_actual < 0).length;
  const cuentasAcreditadas = filteredCuentas.filter(c => c.saldo_actual > 0).length;
  const saldoTotal = filteredCuentas.reduce((sum, c) => sum + c.saldo_actual, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-lg">Cargando cuentas corrientes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Cuentas</p>
                <p className="text-xl font-bold">{totalCuentas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Deudores</p>
                <p className="text-xl font-bold text-red-600">{cuentasDeudoras}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">A Favor</p>
                <p className="text-xl font-bold text-green-600">{cuentasAcreditadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Saldo Total</p>
              <p className={`text-xl font-bold ${saldoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(saldoTotal).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Client Lookup */}
      <div className="flex gap-4">
        <Select value={selectedCliente} onValueChange={setSelectedCliente}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Ver cuenta de cliente específico" />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedCliente && (
          <Button onClick={() => fetchCuentaCliente(selectedCliente)}>
            Ver Cuenta Corriente
          </Button>
        )}
      </div>

      {/* Cuentas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCuentas.map((cuenta) => (
          <Card key={cuenta.cliente_id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{cuenta.cliente_nombre}</CardTitle>
                  <p className="text-sm text-gray-600">Cuenta Corriente</p>
                </div>
                {getSaldoBadge(cuenta.saldo_actual)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Saldo Actual:</strong> 
                  <span className={`ml-2 font-bold ${cuenta.saldo_actual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(cuenta.saldo_actual).toLocaleString()}
                  </span>
                </p>
                <p><strong>Movimientos:</strong> {cuenta.movimientos.length}</p>
                {cuenta.movimientos.length > 0 && (
                  <p><strong>Último:</strong> {new Date(cuenta.movimientos[0].fecha).toLocaleDateString()}</p>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchCuentaCliente(cuenta.cliente_id)}
                className="w-full mt-4"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalle
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCuentas.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? "No se encontraron cuentas corrientes con ese criterio" : "No hay cuentas corrientes con movimientos"}
          </p>
        </div>
      )}

      {/* Detailed View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cuenta Corriente Detallada</DialogTitle>
          </DialogHeader>
          {viewingCuenta && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{viewingCuenta.cliente_nombre}</h3>
                  <p className="text-gray-600">Cuenta Corriente</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Saldo Actual</p>
                  <p className={`text-2xl font-bold ${viewingCuenta.saldo_actual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(viewingCuenta.saldo_actual).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {viewingCuenta.saldo_actual >= 0 ? 'A favor del cliente' : 'Debe el cliente'}
                  </p>
                </div>
              </div>

              {/* Movements Table */}
              <div>
                <h4 className="font-medium mb-4">Historial de Movimientos</h4>
                {viewingCuenta.movimientos.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">Fecha</th>
                          <th className="text-left p-3 text-sm font-medium">Tipo</th>
                          <th className="text-left p-3 text-sm font-medium">Documento</th>
                          <th className="text-right p-3 text-sm font-medium">Debe</th>
                          <th className="text-right p-3 text-sm font-medium">Haber</th>
                          <th className="text-right p-3 text-sm font-medium">Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingCuenta.movimientos.map((movimiento, index) => (
                          <tr key={movimiento.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="p-3 text-sm">
                              {new Date(movimiento.fecha).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-sm">
                              {getTipoMovimientoBadge(movimiento.tipo_movimiento)}
                            </td>
                            <td className="p-3 text-sm">
                              <div>
                                <p className="font-medium">{movimiento.numero_documento}</p>
                                {movimiento.descripcion && (
                                  <p className="text-gray-500 text-xs">{movimiento.descripcion}</p>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-sm text-right">
                              {movimiento.debe > 0 && (
                                <span className="text-red-600 font-medium">
                                  ${movimiento.debe.toLocaleString()}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-sm text-right">
                              {movimiento.haber > 0 && (
                                <span className="text-green-600 font-medium">
                                  ${movimiento.haber.toLocaleString()}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-sm text-right font-medium">
                              ${Math.abs(movimiento.saldo).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay movimientos registrados para este cliente
                  </div>
                )}
              </div>

              {/* Summary */}
              {viewingCuenta.movimientos.length > 0 && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Debe</p>
                    <p className="text-lg font-bold text-red-600">
                      ${viewingCuenta.movimientos.reduce((sum, m) => sum + m.debe, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Haber</p>
                    <p className="text-lg font-bold text-green-600">
                      ${viewingCuenta.movimientos.reduce((sum, m) => sum + m.haber, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Saldo Final</p>
                    <p className={`text-lg font-bold ${viewingCuenta.saldo_actual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(viewingCuenta.saldo_actual).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CuentasCorrientes;
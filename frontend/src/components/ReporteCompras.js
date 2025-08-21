import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Download, CreditCard, Package, Truck, DollarSign } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReporteCompras = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");

  useEffect(() => {
    fetchComprasData();
  }, []);

  const fetchComprasData = async () => {
    try {
      const response = await axios.get(`${API}/compras`);
      setCompras(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching compras data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Generando reporte de compras...</div>
      </div>
    );
  }

  // Analytics calculations
  const totalCompras = compras.length;
  const comprasPagadas = compras.filter(c => c.estado_pago === 'pagado').length;
  const comprasPendientes = compras.filter(c => c.estado_pago === 'pendiente').length;
  const totalGastos = compras.reduce((sum, c) => sum + c.total, 0);
  const gastosPagados = compras.filter(c => c.estado_pago === 'pagado').reduce((sum, c) => sum + c.total, 0);

  // Group by category
  const gastosPorCategoria = compras.reduce((acc, compra) => {
    const categoria = compra.categoria || 'general';
    if (!acc[categoria]) {
      acc[categoria] = { total: 0, cantidad: 0 };
    }
    acc[categoria].total += compra.total;
    acc[categoria].cantidad += 1;
    return acc;
  }, {});

  const categoriaData = Object.entries(gastosPorCategoria).map(([categoria, data]) => ({
    categoria,
    total: data.total,
    cantidad: data.cantidad
  }));

  // Monthly data (mock - would be calculated from dates)
  const monthlyData = [
    { month: 'Ene', compras: 32000, general: 15000, materiales: 10000, servicios: 4000, gastos: 3000 },
    { month: 'Feb', compras: 38000, general: 18000, materiales: 12000, servicios: 5000, gastos: 3000 },
    { month: 'Mar', compras: 35000, general: 16000, materiales: 11000, servicios: 4500, gastos: 3500 },
    { month: 'Abr', compras: 42000, general: 20000, materiales: 14000, servicios: 5000, gastos: 3000 },
    { month: 'May', compras: 39000, general: 18500, materiales: 13000, servicios: 4500, gastos: 3000 },
    { month: 'Jun', compras: 45000, general: 22000, materiales: 15000, servicios: 5000, gastos: 3000 },
  ];

  // Top suppliers
  const proveedorGastos = compras.reduce((acc, compra) => {
    if (!acc[compra.proveedor]) {
      acc[compra.proveedor] = { total: 0, cantidad: 0 };
    }
    acc[compra.proveedor].total += compra.total;
    acc[compra.proveedor].cantidad += 1;
    return acc;
  }, {});

  const topProveedores = Object.entries(proveedorGastos)
    .map(([proveedor, data]) => ({ proveedor, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const pieData = categoriaData.map((item, index) => ({
    ...item,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index] || '#6B7280'
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reporte de Compras</h1>
          <p className="text-gray-600">Análisis de gastos, proveedores y gestión de compras</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Compras</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalCompras}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {comprasPagadas} pagadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalGastos.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Todos los períodos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Pagados</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${gastosPagados.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((gastosPagados / totalGastos) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes de Pago</CardTitle>
            <Truck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {comprasPendientes}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${(totalGastos - gastosPagados).toLocaleString()} pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="total"
                  label={({ categoria, percent }) => `${categoria}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendencia Mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Gastos Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Bar dataKey="compras" fill="#EF4444" name="Total Compras" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Category Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Detallado por Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="general" fill="#3B82F6" name="General" />
              <Bar dataKey="materiales" fill="#10B981" name="Materiales" />
              <Bar dataKey="servicios" fill="#F59E0B" name="Servicios" />
              <Bar dataKey="gastos" fill="#EF4444" name="Gastos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Suppliers and Category Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Proveedores */}
        <Card>
          <CardHeader>
            <CardTitle>Principales Proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProveedores.map((proveedor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <h4 className="font-medium">{proveedor.proveedor}</h4>
                    <p className="text-sm text-gray-600">
                      {proveedor.cantidad} compras realizadas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      ${proveedor.total.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${(proveedor.total / proveedor.cantidad).toFixed(0)} promedio
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resumen por Categorías */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoriaData.map((categoria, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <h4 className="font-medium capitalize">{categoria.categoria}</h4>
                    <p className="text-sm text-gray-600">
                      {categoria.cantidad} compras
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      ${categoria.total.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {((categoria.total / totalGastos) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReporteCompras;
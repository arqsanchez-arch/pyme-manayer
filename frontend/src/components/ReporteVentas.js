import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Download, ShoppingCart, FileText, CheckCircle, Clock } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReporteVentas = () => {
  const [pedidos, setPedidos] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");

  useEffect(() => {
    fetchVentasData();
  }, []);

  const fetchVentasData = async () => {
    try {
      const [pedidosRes, facturasRes] = await Promise.all([
        axios.get(`${API}/pedidos`),
        axios.get(`${API}/facturas`)
      ]);
      
      setPedidos(pedidosRes.data);
      setFacturas(facturasRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching ventas data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Generando reporte de ventas...</div>
      </div>
    );
  }

  // Analytics calculations
  const totalPedidos = pedidos.length;
  const pedidosCompletados = pedidos.filter(p => p.estado === 'completado').length;
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length;
  const totalFacturas = facturas.length;
  const facturasPagadas = facturas.filter(f => f.estado === 'pagada').length;
  
  const totalVentasPedidos = pedidos.reduce((sum, p) => sum + p.total, 0);
  const totalVentasFacturadas = facturas.filter(f => f.estado === 'pagada').reduce((sum, f) => sum + f.total, 0);

  // Monthly sales data (mock data - in reality would come from date filtering)
  const monthlySalesData = [
    { month: 'Ene', pedidos: 8, facturas: 6, ingresos: 45000 },
    { month: 'Feb', pedidos: 12, facturas: 10, ingresos: 52000 },
    { month: 'Mar', pedidos: 9, facturas: 8, ingresos: 48000 },
    { month: 'Abr', pedidos: 15, facturas: 13, ingresos: 61000 },
    { month: 'May', pedidos: 11, facturas: 9, ingresos: 55000 },
    { month: 'Jun', pedidos: 18, facturas: 16, ingresos: 67000 },
  ];

  // Top products/services (based on pedidos items)
  const productSales = {};
  pedidos.forEach(pedido => {
    pedido.items.forEach(item => {
      if (productSales[item.descripcion]) {
        productSales[item.descripcion].cantidad += item.cantidad;
        productSales[item.descripcion].total += item.subtotal;
      } else {
        productSales[item.descripcion] = {
          cantidad: item.cantidad,
          total: item.subtotal,
          precio_promedio: item.precio_unitario
        };
      }
    });
  });

  const topProducts = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reporte de Ventas</h1>
          <p className="text-gray-600">Análisis de pedidos, facturación y rendimiento comercial</p>
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
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalPedidos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {pedidosCompletados} completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Emitidas</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalFacturas}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {facturasPagadas} pagadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {totalPedidos > 0 ? ((pedidosCompletados / totalPedidos) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pedidos completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Facturados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalVentasFacturadas.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              De ${totalVentasPedidos.toLocaleString()} en pedidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de Ventas */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ventas Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ingresos" stroke="#10B981" strokeWidth={2} name="Ingresos ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pedidos vs Facturas */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos vs Facturas por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pedidos" fill="#3B82F6" name="Pedidos" />
                <Bar dataKey="facturas" fill="#10B981" name="Facturas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Productos/Servicios Más Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-sm text-gray-600">
                    {product.cantidad} unidades vendidas
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    ${product.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    ${product.precio_promedio.toFixed(2)} c/u
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sales Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de Pedidos */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Completados
                </span>
                <span className="font-bold">{pedidosCompletados}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                  Pendientes
                </span>
                <span className="font-bold">{pedidosPendientes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <ShoppingCart className="h-4 w-4 text-blue-600 mr-2" />
                  En Proceso
                </span>
                <span className="font-bold">
                  {pedidos.filter(p => p.estado === 'en_proceso').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado de Facturas */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Facturación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Pagadas
                </span>
                <span className="font-bold">{facturasPagadas}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                  Pendientes
                </span>
                <span className="font-bold">
                  {facturas.filter(f => f.estado === 'pendiente').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <FileText className="h-4 w-4 text-red-600 mr-2" />
                  Vencidas
                </span>
                <span className="font-bold">
                  {facturas.filter(f => f.estado === 'vencida').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReporteVentas;
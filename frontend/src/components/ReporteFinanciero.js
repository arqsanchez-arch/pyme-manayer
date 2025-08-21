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
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DatePicker } from "./ui/date-picker";
import { Button } from "./ui/button";
import { Download, TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReporteFinanciero = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");

  useEffect(() => {
    fetchFinancialData();
  }, [period]);

  const fetchFinancialData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`);
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Generando reporte financiero...</div>
      </div>
    );
  }

  const financialData = [
    {
      category: 'Ingresos',
      amount: dashboardData?.total_ventas || 0,
      color: '#10B981'
    },
    {
      category: 'Gastos',
      amount: dashboardData?.total_gastos || 0,
      color: '#EF4444'
    },
    {
      category: 'Ganancia',
      amount: dashboardData?.ganancia_neta || 0,
      color: '#3B82F6'
    }
  ];

  const monthlyData = [
    { month: 'Ene', ventas: 45000, gastos: 32000, ganancia: 13000 },
    { month: 'Feb', ventas: 52000, gastos: 38000, ganancia: 14000 },
    { month: 'Mar', ventas: 48000, gastos: 35000, ganancia: 13000 },
    { month: 'Abr', ventas: 61000, gastos: 42000, ganancia: 19000 },
    { month: 'May', ventas: 55000, gastos: 39000, ganancia: 16000 },
    { month: 'Jun', ventas: 67000, gastos: 45000, ganancia: 22000 },
  ];

  const distributionData = [
    { name: 'Ventas', value: dashboardData?.total_ventas || 0, color: '#10B981' },
    { name: 'Gastos', value: dashboardData?.total_gastos || 0, color: '#EF4444' }
  ];

  const margenGanancia = dashboardData?.total_ventas > 0 
    ? ((dashboardData?.ganancia_neta / dashboardData?.total_ventas) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reporte Financiero</h1>
          <p className="text-gray-600">Análisis completo de rendimiento financiero</p>
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
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(dashboardData?.total_ventas || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +12.5% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${(dashboardData?.total_gastos || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              -3.2% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(dashboardData?.ganancia_neta || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ${(dashboardData?.ganancia_neta || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(dashboardData?.ganancia_neta || 0) >= 0 ? '+' : ''}
              {((dashboardData?.ganancia_neta || 0) / (dashboardData?.total_ventas || 1) * 100).toFixed(1)}% margen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen de Ganancia</CardTitle>
            <Percent className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {margenGanancia}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Objetivo: 25%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia Mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Financiera</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="ventas" stroke="#10B981" strokeWidth={2} name="Ventas" />
                <Line type="monotone" dataKey="gastos" stroke="#EF4444" strokeWidth={2} name="Gastos" />
                <Line type="monotone" dataKey="ganancia" stroke="#3B82F6" strokeWidth={2} name="Ganancia" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución de Ingresos vs Gastos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución Ingresos vs Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comparative Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Comparativo Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="ventas" fill="#10B981" name="Ventas" />
              <Bar dataKey="gastos" fill="#EF4444" name="Gastos" />
              <Bar dataKey="ganancia" fill="#3B82F6" name="Ganancia Neta" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen por Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Categoría</th>
                  <th className="text-right py-2 px-4">Monto</th>
                  <th className="text-right py-2 px-4">% del Total</th>
                  <th className="text-right py-2 px-4">Variación</th>
                </tr>
              </thead>
              <tbody>
                {financialData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4 font-medium">{item.category}</td>
                    <td className="py-2 px-4 text-right font-mono">
                      ${item.amount.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right">
                      {((item.amount / (dashboardData?.total_ventas + dashboardData?.total_gastos || 1)) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 px-4 text-right text-green-600">
                      +5.2%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReporteFinanciero;
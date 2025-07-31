import { useState, useEffect } from "react";
import axios from "axios";
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  FileText, 
  AlertTriangle 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`);
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  const chartData = [
    {
      name: 'Ventas',
      value: dashboardData?.total_ventas || 0,
      color: '#10B981'
    },
    {
      name: 'Gastos',
      value: dashboardData?.total_gastos || 0,
      color: '#EF4444'
    }
  ];

  const financialData = [
    {
      category: 'Ventas',
      amount: dashboardData?.total_ventas || 0
    },
    {
      category: 'Gastos',
      amount: dashboardData?.total_gastos || 0
    },
    {
      category: 'Ganancia',
      amount: dashboardData?.ganancia_neta || 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Financiero</h1>
        <p className="text-gray-600">Resumen general de su empresa</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(dashboardData?.total_ventas || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${(dashboardData?.total_gastos || 0).toLocaleString()}
            </div>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dashboardData?.pedidos_pendientes || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardData?.facturas_vencidas || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Overview Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ventas vs Gastos Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución Ventas vs Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Estado General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Facturas Pendientes</p>
                  <p className="text-xl font-bold text-blue-600">
                    {dashboardData?.facturas_pendientes || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Pedidos Activos</p>
                  <p className="text-xl font-bold text-green-600">
                    {dashboardData?.pedidos_pendientes || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Facturas Vencidas</p>
                  <p className="text-xl font-bold text-red-600">
                    {dashboardData?.facturas_vencidas || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
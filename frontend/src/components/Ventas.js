import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plus, Filter, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

// Import existing components that we'll reuse
import Facturas from "./Facturas";
import Remitos from "./Remitos";

// Import new components that we'll create
import Presupuestos from "./Presupuestos";
import NotasCredito from "./NotasCredito";
import NotasDebito from "./NotasDebito";
import CuentasCorrientes from "./CuentasCorrientes";
import Recibos from "./Recibos";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Ventas = () => {
  const [activeTab, setActiveTab] = useState("facturas");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const tabs = [
    {
      id: "facturas",
      label: "Facturas",
      component: Facturas,
      description: "Gestión de facturas de venta"
    },
    {
      id: "presupuestos",
      label: "Presupuestos",
      component: Presupuestos,
      description: "Cotizaciones y presupuestos"
    },
    {
      id: "remitos",
      label: "Remitos",
      component: Remitos,
      description: "Notas de entrega y remitos"
    },
    {
      id: "notas-credito",
      label: "N. de Crédito",
      component: NotasCredito,
      description: "Notas de crédito emitidas"
    },
    {
      id: "notas-debito",
      label: "N. de Débito",
      component: NotasDebito,
      description: "Notas de débito emitidas"
    },
    {
      id: "ctas-ctes",
      label: "Ctas. Ctes.",
      component: CuentasCorrientes,
      description: "Cuentas corrientes de clientes"
    },
    {
      id: "recibos",
      label: "Recibos",
      component: Recibos,
      description: "Recibos de pago"
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-600 mt-1">
            {activeTabData?.description || "Gestión integral de ventas"}
          </p>
        </div>
        
        {/* Global Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <TabsList className="grid w-full grid-cols-7 bg-transparent h-auto p-0">
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-700 px-4 py-3 rounded-none text-sm font-medium"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Search and Actions Bar */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={`Buscar en ${activeTabData?.label?.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Quick Stats - could be populated with real data */}
                <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
                  <span>Total: 0</span>
                  <span>Pendientes: 0</span>
                  <span>Este mes: $0</span>
                </div>

                {/* Add Button */}
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo {activeTabData?.label?.slice(0, -1) || "Item"}
                </Button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                  {ActiveComponent && tab.id === activeTab ? (
                    <div className="space-y-4">
                      <ActiveComponent searchTerm={searchTerm} />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Componente en desarrollo: {tab.label}
                    </div>
                  )}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Ventas;
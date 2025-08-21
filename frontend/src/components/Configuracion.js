import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { 
  Settings, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Bell, 
  Database,
  Download,
  Upload,
  Trash2,
  Save
} from "lucide-react";

const Configuracion = () => {
  const [companyData, setCompanyData] = useState({
    nombre: "Mi Empresa PYME",
    email: "contacto@miempresa.com",
    telefono: "+54 11 4567-8901",
    direccion: "Av. Corrientes 1234, CABA",
    cuit: "30-12345678-9",
    moneda: "ARS",
    timezone: "America/Argentina/Buenos_Aires"
  });

  const [notifications, setNotifications] = useState({
    facturas_vencidas: true,
    pedidos_pendientes: true,
    stock_bajo: false,
    pagos_recibidos: true,
    email_reportes: true
  });

  const [facturacion, setFacturacion] = useState({
    iva_default: 21,
    numeracion_auto: true,
    prefijo_factura: "FAC",
    prefijo_pedido: "PED",
    prefijo_remito: "REM",
    prefijo_compra: "COM"
  });

  const handleSave = () => {
    // Here would save to backend
    alert("Configuración guardada exitosamente");
  };

  const handleExportData = () => {
    // Here would trigger data export
    alert("Iniciando exportación de datos...");
  };

  const handleImportData = () => {
    // Here would trigger data import
    document.getElementById('import-file').click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600">Configuración general del sistema</p>
        </div>
        
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Información de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre de la Empresa</Label>
              <Input
                id="nombre"
                value={companyData.nombre}
                onChange={(e) => setCompanyData({...companyData, nombre: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={companyData.email}
                onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={companyData.telefono}
                onChange={(e) => setCompanyData({...companyData, telefono: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={companyData.direccion}
                onChange={(e) => setCompanyData({...companyData, direccion: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="cuit">CUIT</Label>
              <Input
                id="cuit"
                value={companyData.cuit}
                onChange={(e) => setCompanyData({...companyData, cuit: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Configuración Regional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="moneda">Moneda</Label>
              <Select value={companyData.moneda} onValueChange={(value) => setCompanyData({...companyData, moneda: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                  <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="BRL">Real Brasileño (BRL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="timezone">Zona Horaria</Label>
              <Select value={companyData.timezone} onValueChange={(value) => setCompanyData({...companyData, timezone: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</SelectItem>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/Santiago">Santiago (GMT-3)</SelectItem>
                  <SelectItem value="America/Montevideo">Montevideo (GMT-3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Configuración de Facturación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="iva_default">IVA por Defecto (%)</Label>
              <Input
                id="iva_default"
                type="number"
                value={facturacion.iva_default}
                onChange={(e) => setFacturacion({...facturacion, iva_default: parseFloat(e.target.value)})}
              />
            </div>
            
            <div>
              <Label htmlFor="prefijo_factura">Prefijo Facturas</Label>
              <Input
                id="prefijo_factura"
                value={facturacion.prefijo_factura}
                onChange={(e) => setFacturacion({...facturacion, prefijo_factura: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="prefijo_pedido">Prefijo Pedidos</Label>
              <Input
                id="prefijo_pedido"
                value={facturacion.prefijo_pedido}
                onChange={(e) => setFacturacion({...facturacion, prefijo_pedido: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="prefijo_remito">Prefijo Remitos</Label>
              <Input
                id="prefijo_remito"
                value={facturacion.prefijo_remito}
                onChange={(e) => setFacturacion({...facturacion, prefijo_remito: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="prefijo_compra">Prefijo Compras</Label>
              <Input
                id="prefijo_compra"
                value={facturacion.prefijo_compra}
                onChange={(e) => setFacturacion({...facturacion, prefijo_compra: e.target.value})}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="numeracion_auto"
                checked={facturacion.numeracion_auto}
                onCheckedChange={(checked) => setFacturacion({...facturacion, numeracion_auto: checked})}
              />
              <Label htmlFor="numeracion_auto">Numeración Automática</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="facturas_vencidas">Facturas Vencidas</Label>
                <p className="text-sm text-gray-500">Recibir alertas de facturas vencidas</p>
              </div>
              <Switch
                id="facturas_vencidas"
                checked={notifications.facturas_vencidas}
                onCheckedChange={(checked) => setNotifications({...notifications, facturas_vencidas: checked})}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pedidos_pendientes">Pedidos Pendientes</Label>
                <p className="text-sm text-gray-500">Notificar sobre pedidos pendientes</p>
              </div>
              <Switch
                id="pedidos_pendientes"
                checked={notifications.pedidos_pendientes}
                onCheckedChange={(checked) => setNotifications({...notifications, pedidos_pendientes: checked})}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pagos_recibidos">Pagos Recibidos</Label>
                <p className="text-sm text-gray-500">Confirmar cuando se reciban pagos</p>
              </div>
              <Switch
                id="pagos_recibidos"
                checked={notifications.pagos_recibidos}
                onCheckedChange={(checked) => setNotifications({...notifications, pagos_recibidos: checked})}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_reportes">Reportes por Email</Label>
                <p className="text-sm text-gray-500">Enviar reportes mensuales por email</p>
              </div>
              <Switch
                id="email_reportes"
                checked={notifications.email_reportes}
                onCheckedChange={(checked) => setNotifications({...notifications, email_reportes: checked})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Gestión de Datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" onClick={handleExportData} className="flex items-center justify-center">
              <Download className="mr-2 h-4 w-4" />
              Exportar Datos
            </Button>
            
            <Button variant="outline" onClick={handleImportData} className="flex items-center justify-center">
              <Upload className="mr-2 h-4 w-4" />
              Importar Datos
            </Button>
            
            <Button variant="destructive" className="flex items-center justify-center">
              <Trash2 className="mr-2 h-4 w-4" />
              Limpiar Datos
            </Button>
          </div>
          
          <input
            id="import-file"
            type="file"
            accept=".json,.csv,.xlsx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files[0]) {
                alert(`Archivo seleccionado: ${e.target.files[0].name}`);
              }
            }}
          />
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-800">Información Importante</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Los datos exportados incluyen toda la información de clientes, pedidos, facturas y compras. 
              Mantenga estos archivos seguros ya que contienen información sensible.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracion;
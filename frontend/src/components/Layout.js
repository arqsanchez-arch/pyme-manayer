import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  FileText, 
  CreditCard, 
  Truck,
  Package,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight
} from "lucide-react";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    ventas: false,
    compras: false,
    productos: false,
    contactos: false,
    reportes: false,
    datos: false
  });
  const location = useLocation();

  const navigationSections = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      isSection: false
    },
    {
      id: 'ventas',
      name: 'Ventas',
      icon: TrendingUp,
      isSection: true,
      items: [
        { name: 'Pedidos', href: '/pedidos', icon: ShoppingCart },
        { name: 'Facturas', href: '/facturas', icon: FileText },
        { name: 'Remitos', href: '/remitos', icon: Truck },
      ]
    },
    {
      id: 'compras',
      name: 'Compras',
      icon: TrendingDown,
      isSection: true,
      items: [
        { name: 'Compras y Gastos', href: '/compras', icon: CreditCard },
      ]
    },
    {
      id: 'productos',
      name: 'Productos',
      icon: Package,
      isSection: true,
      items: [
        { name: 'Artículos', href: '/articulos', icon: Package },
      ]
    },
    {
      id: 'contactos',
      name: 'Contactos',
      icon: Users,
      isSection: true,
      items: [
        { name: 'Clientes', href: '/clientes', icon: Users },
      ]
    },
    {
      id: 'reportes',
      name: 'Reportes',
      icon: BarChart3,
      isSection: true,
      items: [
        { name: 'Reporte Financiero', href: '/reportes/financiero', icon: BarChart3 },
        { name: 'Reporte de Ventas', href: '/reportes/ventas', icon: TrendingUp },
        { name: 'Reporte de Compras', href: '/reportes/compras', icon: TrendingDown },
      ]
    },
    {
      id: 'datos',
      name: 'Datos',
      icon: Settings,
      isSection: true,
      items: [
        { name: 'Configuración', href: '/configuracion', icon: Settings },
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isActive = (href) => {
    return location.pathname === href || 
           (location.pathname === '/' && href === '/dashboard');
  };

  const isSectionActive = (items) => {
    return items?.some(item => isActive(item.href));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">PYME Manager</h1>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigationSections.map((section) => {
              if (!section.isSection) {
                // Simple navigation item (Dashboard)
                return (
                  <Link
                    key={section.id}
                    to={section.href}
                    className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                      isActive(section.href)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <section.icon className="h-5 w-5 mr-3" />
                    {section.name}
                  </Link>
                );
              } else {
                // Section with subitems
                const expanded = expandedSections[section.id];
                const sectionActiveState = isSectionActive(section.items);

                return (
                  <div key={section.id}>
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-colors ${
                        sectionActiveState
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <section.icon className="h-5 w-5 mr-3" />
                        {section.name}
                      </div>
                      {expanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    {/* Section Items */}
                    {expanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {section.items.map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                              isActive(item.href)
                                ? 'bg-blue-100 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <item.icon className="h-4 w-4 mr-3" />
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
            })}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              Sistema de Gestión PYME
            </div>
            <div className="text-xs text-gray-400 mt-1">
              v1.0.0
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
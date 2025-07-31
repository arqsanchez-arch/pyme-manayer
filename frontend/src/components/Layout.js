import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  FileText, 
  CreditCard, 
  Truck,
  Menu,
  X
} from "lucide-react";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Pedidos', href: '/pedidos', icon: ShoppingCart },
    { name: 'Facturas', href: '/facturas', icon: FileText },
    { name: 'Compras', href: '/compras', icon: CreditCard },
    { name: 'Remitos', href: '/remitos', icon: Truck },
  ];

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
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                              (location.pathname === '/' && item.href === '/dashboard');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t text-sm text-gray-500">
            Sistema de Gestión PYME
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
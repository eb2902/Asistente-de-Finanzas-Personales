import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { pathname } = router;

  // No mostrar sidebar en páginas de autenticación
  const hideSidebar = pathname === '/login' || pathname === '/register';

  if (hideSidebar) {
    return <div>{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Botón de menú para mobile */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6 text-gray-400" />
                </button>
                
                {/* Título basado en la página actual */}
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {pathname === '/dashboard' && 'Dashboard Financiero'}
                    {pathname === '/transactions' && 'Gestión de Transacciones'}
                    {pathname === '/goals' && 'Configuración de Metas'}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {pathname === '/dashboard' && 'Visión general de tu situación financiera'}
                    {pathname === '/transactions' && 'Administra tus ingresos y gastos'}
                    {pathname === '/goals' && 'Gestiona tus objetivos financieros'}
                  </p>
                </div>
              </div>
              
              {/* Información del usuario */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Bienvenido</p>
                  <p className="text-white font-semibold">Usuario</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">U</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
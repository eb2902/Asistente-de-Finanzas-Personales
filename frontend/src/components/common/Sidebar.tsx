import React from 'react';
import { useRouter } from 'next/router';
import {
  BarChart3,
  CreditCard,
  Settings,
  TrendingUp,
  Calendar,
  Home,
  X,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Visión general financiera'
  },
  {
    name: 'Historial Completo',
    href: '/transactions',
    icon: Calendar,
    description: 'Todas tus transacciones'
  },
  {
    name: 'Nueva Transacción',
    href: '/new-transaction',
    icon: CreditCard,
    description: 'Crear transacción'
  },
  {
    name: 'Configuración de Metas',
    href: '/goals',
    icon: TrendingUp,
    description: 'Gestiona tus objetivos'
  },
  {
    name: 'Análisis de Gastos',
    href: '/analytics',
    icon: TrendingUp,
    description: 'Patrones y tendencias'
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: Settings,
    description: 'Personaliza tu experiencia'
  },
  {
    name: 'Centro de Ayuda',
    href: '/support',
    icon: HelpCircle,
    description: 'Soporte y FAQ'
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { pathname } = router;

  const handleNavigation = (href: string) => {
    router.push(href);
    // En mobile, cerrar el sidebar después de navegar
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Asistente Financiero</h2>
              <p className="text-xs text-gray-400">Panel de Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${
                  isActive ? 'text-blue-400' : 'text-gray-400'
                }`} />
                <div className="text-left">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Versión 1.0.0</span>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleNavigation('/settings')}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Configuración"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de hamburguesa para mobile */}
      <button
        onClick={() => router.push('/dashboard')}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <Home className="w-5 h-5 text-white" />
      </button>
    </>
  );
};

export default Sidebar;
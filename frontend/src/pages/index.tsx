import React from 'react';
import { useRouter } from 'next/router';
import { 
  BarChart3, 
  CreditCard, 
  Settings, 
  DollarSign,
  TrendingUp,
  Users
} from 'lucide-react';

const HomePage: React.FC = () => {
  const router = useRouter();

  const navigationItems = [
    {
      title: 'Dashboard Principal',
      description: 'Visión general de tu situación financiera',
      icon: BarChart3,
      color: 'from-blue-500 to-purple-600',
      href: '/dashboard'
    },
    {
      title: 'Gestión de Transacciones',
      description: 'Administra tus ingresos y gastos',
      icon: CreditCard,
      color: 'from-green-500 to-emerald-600',
      href: '/transactions'
    },
    {
      title: 'Metas Financieras',
      description: 'Configura y monitorea tus objetivos',
      icon: TrendingUp,
      color: 'from-yellow-500 to-orange-600',
      href: '/goals'
    },
    {
      title: 'Análisis de Gastos',
      description: 'Descubre patrones y optimiza',
      icon: DollarSign,
      color: 'from-red-500 to-pink-600',
      href: '/analytics'
    },
    {
      title: 'Configuración',
      description: 'Personaliza tu experiencia',
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      href: '/settings'
    },
    {
      title: 'Soporte',
      description: 'Ayuda y documentación',
      icon: Users,
      color: 'from-indigo-500 to-blue-600',
      href: '/support'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Asistente Financiero Inteligente</h1>
              <p className="text-gray-400 text-sm">Tu compañero para el manejo financiero</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Bienvenido</p>
                <p className="text-white font-semibold">Usuario</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Comienza a tomar el control de tus finanzas
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Descubre cómo nuestra plataforma puede ayudarte a alcanzar tus metas financieras 
            con herramientas inteligentes y análisis en tiempo real.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                onClick={() => router.push(item.href)}
                className="group bg-gray-800/50 hover:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-gray-600 transition-colors duration-200">
                    <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.description}
                </p>
                
                {/* Hover effect background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Transacciones este mes</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Ahorro actual</p>
                <p className="text-2xl font-bold text-green-400">$2,450</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Metas activas</p>
                <p className="text-2xl font-bold text-yellow-400">3</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Puntuación financiera</p>
                <p className="text-2xl font-bold text-purple-400">85%</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-8 border border-blue-500/30">
            <h3 className="text-2xl font-bold text-white mb-2">¿Listo para comenzar?</h3>
            <p className="text-gray-300 mb-6">
              Explora nuestras herramientas y descubre cómo podemos ayudarte a alcanzar tus metas financieras.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Comenzar con el Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
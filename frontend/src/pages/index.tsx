import { GetServerSideProps } from 'next';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  return (
    <>
      <Head>
        <title>Asistente de Finanzas - Gestión Inteligente de Finanzas Personales</title>
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Asistente Financiero</h1>
                  <p className="text-sm text-gray-600">Gestión Inteligente</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <a href="/login" className="btn-secondary">
                  Iniciar Sesión
                </a>
                <a href="/register" className="btn-primary">
                  Registrarse
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Toma el control de tus{' '}
                  <span className="text-gradient">finanzas</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Simplifica tu vida financiera con herramientas inteligentes que te ayudan 
                  a gestionar tus ingresos, gastos y metas de ahorro de manera efectiva.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="card">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Control Total</h3>
                    <p className="text-sm text-gray-600">Gestiona todos tus ingresos y gastos en un solo lugar</p>
                  </div>
                  
                  <div className="card">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-8 8" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Análisis Inteligente</h3>
                    <p className="text-sm text-gray-600">Descubre patrones de gasto y optimiza tu presupuesto</p>
                  </div>
                  
                  <div className="card">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Seguridad Total</h3>
                    <p className="text-sm text-gray-600">Tus datos están protegidos con autenticación segura</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="/register" className="btn-primary text-center py-3 px-8 text-base">
                    Comenzar Gratis
                  </a>
                  <a href="/login" className="btn-secondary text-center py-3 px-8 text-base">
                    Ya tengo cuenta
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">+$2,450</div>
                          <div className="text-gray-600">Este mes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">-$1,200</div>
                          <div className="text-gray-600">Gastos</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Alimentación</span>
                        <span className="font-medium">$450</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Transporte</span>
                        <span className="font-medium">$200</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Entretenimiento</span>
                        <span className="font-medium">$150</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full w-1/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
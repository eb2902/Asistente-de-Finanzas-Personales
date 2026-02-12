import React from 'react';
import Layout from '../components/common/Layout';
import { HelpCircle, Book, MessageCircle, Mail, Phone, FileText, ExternalLink } from 'lucide-react';

const SupportPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Centro de Ayuda</h1>
          <p className="text-gray-400">Encuentra respuestas y contacta nuestro equipo</p>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <Book className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Documentación</h3>
            <p className="text-gray-400 text-sm mb-4">
              Explora guías detalladas sobre cómo usar todas las funcionalidades del asistente financiero.
            </p>
            <span className="text-blue-400 text-sm flex items-center">
              Ver documentación <ExternalLink className="w-4 h-4 ml-1" />
            </span>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500/50 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Chat en Vivo</h3>
            <p className="text-gray-400 text-sm mb-4">
              Chatea con nuestro equipo de soporte en tiempo real para resolver tus dudas.
            </p>
            <span className="text-green-400 text-sm flex items-center">
              Iniciar chat <ExternalLink className="w-4 h-4 ml-1" />
            </span>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">FAQ</h3>
            <p className="text-gray-400 text-sm mb-4">
              Encuentra respuestas a las preguntas más frecuentes de nuestros usuarios.
            </p>
            <span className="text-purple-400 text-sm flex items-center">
              Ver preguntas frecuentes <ExternalLink className="w-4 h-4 ml-1" />
            </span>
          </div>
        </div>

        {/* Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6">Envíanos un mensaje</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tu@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Asunto
                </label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Selecciona un tema</option>
                  <option value="general">Consulta general</option>
                  <option value="technical">Problema técnico</option>
                  <option value="billing">Facturación y pagos</option>
                  <option value="feature">Sugerencia de功能</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mensaje
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  placeholder="Describe tu consulta o problema..."
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200"
              >
                Enviar mensaje
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6">Información de contacto</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Correo electrónico</p>
                    <p className="text-white">soporte@asistentefinanciero.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Teléfono</p>
                    <p className="text-white">+54 (11) 1234-5678</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Horario de atención</p>
                    <p className="text-white">Lunes a Viernes 9:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Estado del servicio</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">API</span>
                  <span className="flex items-center text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Operativo
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Base de datos</span>
                  <span className="flex items-center text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Operativo
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Servidor de autenticación</span>
                  <span className="flex items-center text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Operativo
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400">NLP Service</span>
                  <span className="flex items-center text-yellow-400">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                    Mantenimiento
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SupportPage;

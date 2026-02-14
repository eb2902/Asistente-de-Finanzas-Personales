import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { useAuth } from '../contexts/AuthContext';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { User, Bell, Shield, Palette, Check, AlertCircle, Loader2 } from 'lucide-react';

type ToastType = 'success' | 'error';

interface Toast {
  show: boolean;
  message: string;
  type: ToastType;
}

const SettingsPage: React.FC = () => {
  const { user, updateProfile, changePassword, updatePreferences, updateNotifications, deleteAccount } = useAuth();
  
  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<Toast>({ show: false, message: '', type: 'success' });

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  // Preferences form
  const [preferencesForm, setPreferencesForm] = useState<{
    theme: 'dark' | 'light' | 'system';
    currency: 'USD' | 'EUR' | 'ARS' | 'MXN';
    language: 'es' | 'en' | 'pt';
  }>({
    theme: 'dark',
    currency: 'USD',
    language: 'es'
  });

  // Notifications form
  const [notificationsForm, setNotificationsForm] = useState({
    emailAlerts: true,
    goalReminders: true,
    weeklySummary: true,
    aiSuggestions: true
  });

  // Delete account dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Password change dialog
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Initialize forms with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || ''
      });
      
      // Load preferences from user data or localStorage
      setPreferencesForm({
        theme: (user.preferences?.theme || localStorage.getItem('theme') || 'dark') as 'dark' | 'light' | 'system',
        currency: (user.preferences?.currency || localStorage.getItem('currency') || 'USD') as 'USD' | 'EUR' | 'ARS' | 'MXN',
        language: (user.preferences?.language || localStorage.getItem('language') || 'es') as 'es' | 'en' | 'pt'
      });

      // Load notifications from user data
      if (user.notifications) {
        setNotificationsForm({
          emailAlerts: user.notifications.emailAlerts ?? true,
          goalReminders: user.notifications.goalReminders ?? true,
          weeklySummary: user.notifications.weeklySummary ?? true,
          aiSuggestions: user.notifications.aiSuggestions ?? true
        });
      }
    }
  }, [user]);

  // Show toast notification
  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);

    try {
      const success = await updateProfile(profileForm.name, profileForm.email);
      if (success) {
        showToast('Perfil actualizado correctamente');
      } else {
        showToast('Error al actualizar el perfil', 'error');
      }
    } catch {
      showToast('Error al actualizar el perfil', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    // Validate passwords
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    setPasswordError('');
    setLoadingPassword(true);

    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (result.success) {
        showToast('Contraseña actualizada correctamente');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordDialog(false);
      } else {
        setPasswordError(result.error || 'Error al cambiar la contraseña');
      }
    } catch {
      setPasswordError('Error al cambiar la contraseña');
    } finally {
      setLoadingPassword(false);
    }
  };

  // Handle preferences update
  const handlePreferencesUpdate = async () => {
    setLoadingPreferences(true);

    try {
      const success = await updatePreferences(preferencesForm);
      if (success) {
        showToast('Preferencias guardadas correctamente');
        // Apply theme change
        applyTheme(preferencesForm.theme);
      } else {
        showToast('Error al guardar las preferencias', 'error');
      }
    } catch {
      showToast('Error al guardar las preferencias', 'error');
    } finally {
      setLoadingPreferences(false);
    }
  };

  // Apply theme to document
  const applyTheme = (theme: string) => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else if (theme === 'light') {
        root.classList.remove('dark');
        root.classList.add('light');
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
          root.classList.remove('light');
        } else {
          root.classList.remove('dark');
          root.classList.add('light');
        }
      }
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = async (key: keyof typeof notificationsForm) => {
    const newValue = !notificationsForm[key];
    setNotificationsForm(prev => ({ ...prev, [key]: newValue }));
    
    setLoadingNotifications(true);
    try {
      const success = await updateNotifications({ [key]: newValue });
      if (!success) {
        // Revert on error
        setNotificationsForm(prev => ({ ...prev, [key]: !newValue }));
        showToast('Error al actualizar la notificación', 'error');
      }
    } catch {
      setNotificationsForm(prev => ({ ...prev, [key]: !newValue }));
      showToast('Error al actualizar la notificación', 'error');
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setLoadingDelete(true);
    try {
      const success = await deleteAccount();
      if (success) {
        showToast('Cuenta eliminada correctamente');
      } else {
        showToast('Error al eliminar la cuenta', 'error');
      }
    } catch {
      showToast('Error al eliminar la cuenta', 'error');
    } finally {
      setLoadingDelete(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
          <p className="text-gray-400">Personaliza tu experiencia</p>
        </div>

        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {toast.type === 'success' ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <AlertCircle className="w-5 h-5 text-white" />
            )}
            <span className="text-white font-medium">{toast.message}</span>
          </div>
        )}

        {/* Settings Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Perfil</h2>
                  <p className="text-sm text-gray-400">Información de tu cuenta</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tu nombre"
                    required
                    minLength={2}
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tu@ejemplo.com"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loadingProfile}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {loadingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Guardar cambios</span>
                </button>
              </form>
            </div>

            {/* Notifications Section */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Notificaciones</h2>
                  <p className="text-sm text-gray-400">Gestiona tus preferencias</p>
                </div>
              </div>

              {loadingNotifications ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { key: 'emailAlerts', label: 'Alertas de gastos', desc: 'Recibe notificaciones cuando excedas tu presupuesto' },
                    { key: 'goalReminders', label: 'Recordatorios de metas', desc: 'Notificaciones sobre el progreso de tus metas' },
                    { key: 'weeklySummary', label: 'Resumen semanal', desc: 'Recibe un resumen de tus finanzas semanalmente' },
                    { key: 'aiSuggestions', label: 'Sugerencias IA', desc: 'Personaliza las recomendaciones inteligentes' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                      <div>
                        <p className="text-white font-medium">{item.label}</p>
                        <p className="text-sm text-gray-400">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={notificationsForm[item.key as keyof typeof notificationsForm]}
                          onChange={() => handleNotificationToggle(item.key as keyof typeof notificationsForm)}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security Section */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Seguridad</h2>
                  <p className="text-sm text-gray-400">Protege tu cuenta</p>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setShowPasswordDialog(true)}
                  className="w-full flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-white">Cambiar contraseña</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
                <div className="w-full flex items-center justify-between p-4 bg-gray-700/50 rounded-lg opacity-50 cursor-not-allowed">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-white">Autenticación de dos factores</span>
                  </div>
                  <span className="text-yellow-400 text-sm">Próximamente</span>
                </div>
                <div className="w-full flex items-center justify-between p-4 bg-gray-700/50 rounded-lg opacity-50 cursor-not-allowed">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-white">Sesiones activas</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            {/* Preferences */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Palette className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Preferencias</h2>
                  <p className="text-sm text-gray-400">Apariencia</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tema
                  </label>
                  <select 
                    value={preferencesForm.theme}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, theme: e.target.value as 'dark' | 'light' | 'system' })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="dark">Oscuro</option>
                    <option value="light">Claro</option>
                    <option value="system">Sistema</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Moneda
                  </label>
                  <select 
                    value={preferencesForm.currency}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, currency: e.target.value as 'USD' | 'EUR' | 'ARS' | 'MXN' })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="ARS">ARS ($)</option>
                    <option value="MXN">MXN ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Idioma
                  </label>
                  <select 
                    value={preferencesForm.language}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, language: e.target.value as 'es' | 'en' | 'pt' })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                  </select>
                </div>
                <button 
                  onClick={handlePreferencesUpdate}
                  disabled={loadingPreferences}
                  className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loadingPreferences && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Guardar preferencias</span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/30">
              <h3 className="text-lg font-semibold text-red-400 mb-4">Zona de Peligro</h3>
              <p className="text-sm text-gray-400 mb-4">
                Estas acciones son irreversibles. Procede con precaución.
              </p>
              <button 
                onClick={() => setShowDeleteDialog(true)}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      <ConfirmDialog
        isOpen={showPasswordDialog}
        onClose={() => {
          setShowPasswordDialog(false);
          setPasswordError('');
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }}
        onConfirm={handlePasswordChange}
        title="Cambiar contraseña"
        description={
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña actual</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nueva contraseña</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar contraseña</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            {passwordError && (
              <p className="text-red-400 text-sm">{passwordError}</p>
            )}
          </div>
        }
        confirmText="Cambiar contraseña"
        cancelText="Cancelar"
        type="warning"
        isLoading={loadingPassword}
      />

      {/* Delete Account Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        title="Eliminar cuenta"
        description="¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible y perderás todos tus datos, incluyendo transacciones, presupuestos y metas."
        confirmText="Eliminar mi cuenta"
        cancelText="Cancelar"
        type="danger"
        isLoading={loadingDelete}
      />
    </Layout>
  );
};

export default SettingsPage;
